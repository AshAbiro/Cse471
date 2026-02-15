import os
from datetime import datetime, timedelta
from functools import wraps

import bcrypt
import jwt
from bson import ObjectId
from flask import Flask, g, jsonify, request
from flask_cors import CORS
from pymongo import DESCENDING, MongoClient


def utc_now():
    return datetime.utcnow()


def parse_iso_datetime(value):
    if isinstance(value, datetime):
        return value
    if not value or not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def to_object_id(value):
    if isinstance(value, ObjectId):
        return value
    if not value:
        return None
    try:
        return ObjectId(value)
    except Exception:
        return None


def serialize_value(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize_value(v) for v in value]
    if isinstance(value, dict):
        return {k: serialize_value(v) for k, v in value.items()}
    return value


def serialize_doc(doc):
    if not doc:
        return None
    return serialize_value(doc)


def resolve_db_name(uri, fallback):
    if not uri or "/" not in uri:
        return fallback
    tail = uri.split("/", 3)
    if len(tail) < 4:
        return fallback
    db_part = tail[3].split("?", 1)[0]
    return db_part if db_part else fallback


MONGO_URI = os.getenv("MONGO_URI", "")
JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
MONGO_DB = os.getenv("MONGO_DB") or resolve_db_name(MONGO_URI, "niche-city-tour")

mongo = None
db = None
users_col = None
tours_col = None
bookings_col = None
reviews_col = None

app = Flask(__name__)
CORS(app)


def ensure_db():
    global mongo, db, users_col, tours_col, bookings_col, reviews_col
    if users_col is not None:
        return None
    if not MONGO_URI:
        return "MONGO_URI is missing"
    try:
        mongo = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        mongo.admin.command("ping")
        db = mongo[MONGO_DB]
        users_col = db["users"]
        tours_col = db["tours"]
        bookings_col = db["bookings"]
        reviews_col = db["reviews"]
        return None
    except Exception as exc:
        return str(exc)


@app.before_request
def db_guard():
    if request.path == "/api/health":
        return None
    if not request.path.startswith("/api/"):
        return None
    error = ensure_db()
    if error:
        return jsonify({"message": "Database connection failed", "detail": error}), 500
    return None


def auth_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            token = auth_header[7:] if auth_header.startswith("Bearer ") else None
            if not token:
                return jsonify({"message": "Unauthorized"}), 401
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            except Exception:
                return jsonify({"message": "Invalid token"}), 401

            user_id = to_object_id(payload.get("id"))
            if not user_id:
                return jsonify({"message": "Unauthorized"}), 401

            user = users_col.find_one({"_id": user_id})
            if not user:
                return jsonify({"message": "Unauthorized"}), 401
            if user.get("status") == "suspended":
                return jsonify({"message": "Account suspended"}), 403

            if roles and user.get("role") not in roles:
                return jsonify({"message": "Forbidden"}), 403

            g.user = user
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def populate_tours(tours, include_guide_details=False):
    guide_ids = list(
        {
            t.get("guide")
            for t in tours
            if t.get("guide") is not None
        }
    )
    guide_map = {}
    if guide_ids:
        projection = {"name": 1, "profilePhoto": 1}
        if include_guide_details:
            projection["bio"] = 1
        for guide in users_col.find({"_id": {"$in": guide_ids}}, projection):
            guide_map[guide["_id"]] = guide

    populated = []
    for tour in tours:
        data = dict(tour)
        guide = guide_map.get(tour.get("guide"))
        data["guide"] = serialize_doc(guide) if guide else None
        populated.append(serialize_doc(data))
    return populated


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role")

    if not name or not email or not password:
        return jsonify({"message": "Missing fields"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"message": "Email already used"}), 409

    safe_role = "guide" if role == "guide" else "tourist"
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    created = {
        "name": name,
        "email": email,
        "password": hashed,
        "role": safe_role,
        "status": "pending" if safe_role == "guide" else "active",
        "bio": "",
        "phone": "",
        "profilePhoto": "",
        "createdAt": utc_now(),
        "updatedAt": utc_now(),
    }
    result = users_col.insert_one(created)
    return jsonify({"message": "Registered", "id": str(result.inserted_id)}), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    user = users_col.find_one({"email": email})
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), (user.get("password") or "").encode("utf-8")):
        return jsonify({"message": "Invalid credentials"}), 401

    if user.get("role") == "guide" and user.get("status") != "active":
        return jsonify({"message": "Guide pending approval"}), 403

    token = jwt.encode(
        {
            "id": str(user["_id"]),
            "role": user.get("role"),
            "exp": utc_now() + timedelta(days=7),
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    return jsonify(
        {
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user.get("name"),
                "role": user.get("role"),
            },
        }
    )


@app.get("/api/tours")
def list_tours():
    category = request.args.get("category")
    min_price = request.args.get("minPrice")
    max_price = request.args.get("maxPrice")
    rating = request.args.get("rating")
    query_text = request.args.get("q")
    status = request.args.get("status")

    query = {"status": status or "approved"}
    if category:
        query["category"] = category
    if query_text:
        query["title"] = {"$regex": query_text, "$options": "i"}

    if min_price or max_price:
        price_filter = {}
        if min_price:
            price_filter["$gte"] = float(min_price)
        if max_price:
            price_filter["$lte"] = float(max_price)
        query["price"] = price_filter

    if rating:
        query["avgRating"] = {"$gte": float(rating)}

    tours = list(tours_col.find(query).sort("createdAt", DESCENDING))
    return jsonify(populate_tours(tours))


@app.get("/api/tours/<tour_id>")
def get_tour(tour_id):
    obj_id = to_object_id(tour_id)
    if not obj_id:
        return jsonify({"message": "Tour not found"}), 404
    tour = tours_col.find_one({"_id": obj_id})
    if not tour:
        return jsonify({"message": "Tour not found"}), 404
    if tour.get("status") != "approved":
        return jsonify({"message": "Tour not approved"}), 403
    populated = populate_tours([tour], include_guide_details=True)
    return jsonify(populated[0])


@app.post("/api/tours")
@auth_required("guide", "admin")
def create_tour():
    data = request.get_json(silent=True) or {}
    payload = dict(data)
    payload["guide"] = g.user["_id"]
    payload["status"] = "approved" if g.user.get("role") == "admin" else "pending"
    payload.setdefault("slots", [])
    payload.setdefault("avgRating", 0)
    payload.setdefault("ratingsCount", 0)
    payload["createdAt"] = utc_now()
    payload["updatedAt"] = utc_now()
    try:
        result = tours_col.insert_one(payload)
    except Exception:
        return jsonify({"message": "Invalid data"}), 400
    return jsonify({"message": "Tour submitted", "id": str(result.inserted_id)}), 201


@app.put("/api/tours/<tour_id>")
@auth_required("guide", "admin")
def update_tour(tour_id):
    obj_id = to_object_id(tour_id)
    if not obj_id:
        return jsonify({"message": "Tour not found"}), 404
    tour = tours_col.find_one({"_id": obj_id})
    if not tour:
        return jsonify({"message": "Tour not found"}), 404

    if g.user.get("role") == "guide" and str(tour.get("guide")) != str(g.user.get("_id")):
        return jsonify({"message": "Forbidden"}), 403

    updates = request.get_json(silent=True) or {}
    updates.pop("_id", None)
    updates.pop("guide", None)
    if g.user.get("role") == "guide":
        updates["status"] = "pending"
    updates["updatedAt"] = utc_now()
    tours_col.update_one({"_id": obj_id}, {"$set": updates})
    return jsonify({"message": "Updated"})


@app.delete("/api/tours/<tour_id>")
@auth_required("guide", "admin")
def delete_tour(tour_id):
    obj_id = to_object_id(tour_id)
    if not obj_id:
        return jsonify({"message": "Tour not found"}), 404
    tour = tours_col.find_one({"_id": obj_id})
    if not tour:
        return jsonify({"message": "Tour not found"}), 404

    if g.user.get("role") == "guide" and str(tour.get("guide")) != str(g.user.get("_id")):
        return jsonify({"message": "Forbidden"}), 403

    tours_col.delete_one({"_id": obj_id})
    return jsonify({"message": "Deleted"})


@app.patch("/api/tours/<tour_id>/status")
@auth_required("admin")
def change_tour_status(tour_id):
    status = (request.get_json(silent=True) or {}).get("status")
    if status not in {"approved", "rejected", "pending"}:
        return jsonify({"message": "Invalid status"}), 400
    obj_id = to_object_id(tour_id)
    if not obj_id:
        return jsonify({"message": "Tour not found"}), 404
    result = tours_col.update_one({"_id": obj_id}, {"$set": {"status": status, "updatedAt": utc_now()}})
    if result.matched_count == 0:
        return jsonify({"message": "Tour not found"}), 404
    return jsonify({"message": "Status updated"})


@app.post("/api/bookings")
@auth_required("tourist")
def create_booking():
    data = request.get_json(silent=True) or {}
    tour_id = to_object_id(data.get("tourId"))
    target_slot = parse_iso_datetime(data.get("slotStart"))
    if not tour_id or not target_slot:
        return jsonify({"message": "Invalid data"}), 400

    tour = tours_col.find_one({"_id": tour_id})
    if not tour or tour.get("status") != "approved":
        return jsonify({"message": "Tour not found"}), 404

    slots = tour.get("slots", [])
    slot_index = -1
    for idx, slot in enumerate(slots):
        start_dt = parse_iso_datetime(slot.get("start"))
        if not start_dt:
            continue
        if int(start_dt.timestamp()) == int(target_slot.timestamp()):
            slot_index = idx
            break

    if slot_index < 0:
        return jsonify({"message": "Slot not found"}), 400

    slot = slots[slot_index]
    if slot.get("booked", 0) >= slot.get("capacity", 0):
        return jsonify({"message": "Slot full"}), 409

    slots[slot_index]["booked"] = slot.get("booked", 0) + 1
    tours_col.update_one({"_id": tour_id}, {"$set": {"slots": slots, "updatedAt": utc_now()}})

    price = float(tour.get("price", 0))
    platform_fee = round(price * 0.12, 2)
    total_price = round(price + platform_fee, 2)

    booking = {
        "tour": tour_id,
        "user": g.user["_id"],
        "slotStart": slot.get("start"),
        "priceAtBooking": price,
        "platformFee": platform_fee,
        "totalPrice": total_price,
        "status": "confirmed",
        "createdAt": utc_now(),
        "updatedAt": utc_now(),
    }
    result = bookings_col.insert_one(booking)
    return jsonify({"message": "Booked", "id": str(result.inserted_id)}), 201


@app.get("/api/bookings/my")
@auth_required("tourist")
def my_bookings():
    docs = list(bookings_col.find({"user": g.user["_id"]}).sort("createdAt", DESCENDING))
    tour_ids = list({b.get("tour") for b in docs if b.get("tour") is not None})
    tours = {
        t["_id"]: t
        for t in tours_col.find({"_id": {"$in": tour_ids}}, {"title": 1, "category": 1, "coverImage": 1})
    }
    out = []
    for booking in docs:
        row = dict(booking)
        row["tour"] = serialize_doc(tours.get(booking.get("tour")))
        out.append(serialize_doc(row))
    return jsonify(out)


@app.get("/api/bookings/guide")
@auth_required("guide")
def guide_bookings():
    tour_docs = list(tours_col.find({"guide": g.user["_id"]}, {"_id": 1, "title": 1}))
    if not tour_docs:
        return jsonify([])
    tour_map = {t["_id"]: t for t in tour_docs}
    tour_ids = list(tour_map.keys())
    docs = list(bookings_col.find({"tour": {"$in": tour_ids}}).sort("createdAt", DESCENDING))
    user_ids = list({d.get("user") for d in docs if d.get("user") is not None})
    user_map = {
        u["_id"]: u for u in users_col.find({"_id": {"$in": user_ids}}, {"name": 1})
    }
    out = []
    for booking in docs:
        row = dict(booking)
        row["tour"] = serialize_doc(tour_map.get(booking.get("tour")))
        row["user"] = serialize_doc(user_map.get(booking.get("user")))
        out.append(serialize_doc(row))
    return jsonify(out)


@app.patch("/api/bookings/<booking_id>/cancel")
@auth_required("tourist")
def cancel_booking(booking_id):
    obj_id = to_object_id(booking_id)
    if not obj_id:
        return jsonify({"message": "Booking not found"}), 404
    booking = bookings_col.find_one({"_id": obj_id})
    if not booking:
        return jsonify({"message": "Booking not found"}), 404
    if str(booking.get("user")) != str(g.user.get("_id")):
        return jsonify({"message": "Forbidden"}), 403
    if booking.get("status") != "confirmed":
        return jsonify({"message": "Cannot cancel"}), 400

    bookings_col.update_one(
        {"_id": obj_id},
        {"$set": {"status": "cancelled", "updatedAt": utc_now()}},
    )

    tour = tours_col.find_one({"_id": booking.get("tour")})
    if tour:
        slots = tour.get("slots", [])
        target_slot = parse_iso_datetime(booking.get("slotStart"))
        for idx, slot in enumerate(slots):
            start_dt = parse_iso_datetime(slot.get("start"))
            if start_dt and target_slot and int(start_dt.timestamp()) == int(target_slot.timestamp()):
                if slot.get("booked", 0) > 0:
                    slots[idx]["booked"] = slot.get("booked", 0) - 1
                    tours_col.update_one(
                        {"_id": tour["_id"]},
                        {"$set": {"slots": slots, "updatedAt": utc_now()}},
                    )
                break

    return jsonify({"message": "Cancelled"})


@app.post("/api/reviews")
@auth_required("tourist")
def create_review():
    data = request.get_json(silent=True) or {}
    booking_id = to_object_id(data.get("bookingId"))
    rating = int(data.get("rating") or 0)
    comment = data.get("comment") or ""
    if not booking_id or rating < 1 or rating > 5:
        return jsonify({"message": "Invalid data"}), 400

    booking = bookings_col.find_one({"_id": booking_id})
    if not booking:
        return jsonify({"message": "Booking not found"}), 404
    if str(booking.get("user")) != str(g.user.get("_id")):
        return jsonify({"message": "Forbidden"}), 403
    if reviews_col.find_one({"booking": booking_id}):
        return jsonify({"message": "Already reviewed"}), 409

    review_doc = {
        "booking": booking_id,
        "tour": booking.get("tour"),
        "user": g.user["_id"],
        "rating": rating,
        "comment": comment,
        "createdAt": utc_now(),
        "updatedAt": utc_now(),
    }
    result = reviews_col.insert_one(review_doc)

    tour = tours_col.find_one({"_id": booking.get("tour")})
    if tour:
        total = float(tour.get("avgRating", 0)) * int(tour.get("ratingsCount", 0)) + rating
        count = int(tour.get("ratingsCount", 0)) + 1
        avg = round(total / count, 2)
        tours_col.update_one(
            {"_id": tour["_id"]},
            {"$set": {"ratingsCount": count, "avgRating": avg, "updatedAt": utc_now()}},
        )

    return jsonify({"message": "Review submitted", "id": str(result.inserted_id)}), 201


@app.get("/api/reviews/tour/<tour_id>")
def list_reviews(tour_id):
    obj_id = to_object_id(tour_id)
    if not obj_id:
        return jsonify([])
    docs = list(reviews_col.find({"tour": obj_id}).sort("createdAt", DESCENDING))
    user_ids = list({d.get("user") for d in docs if d.get("user") is not None})
    user_map = {
        u["_id"]: u for u in users_col.find({"_id": {"$in": user_ids}}, {"name": 1})
    }
    out = []
    for review in docs:
        row = dict(review)
        row["user"] = serialize_doc(user_map.get(review.get("user")))
        out.append(serialize_doc(row))
    return jsonify(out)


@app.get("/api/admin/guides/pending")
@auth_required("admin")
def admin_pending_guides():
    docs = list(users_col.find({"role": "guide", "status": "pending"}, {"name": 1, "email": 1, "status": 1}))
    return jsonify([serialize_doc(d) for d in docs])


@app.patch("/api/admin/guides/<guide_id>/status")
@auth_required("admin")
def admin_update_guide_status(guide_id):
    status = (request.get_json(silent=True) or {}).get("status")
    if status not in {"active", "suspended", "pending"}:
        return jsonify({"message": "Invalid status"}), 400
    obj_id = to_object_id(guide_id)
    if not obj_id:
        return jsonify({"message": "Guide not found"}), 404
    result = users_col.update_one(
        {"_id": obj_id, "role": "guide"},
        {"$set": {"status": status, "updatedAt": utc_now()}},
    )
    if result.matched_count == 0:
        return jsonify({"message": "Guide not found"}), 404
    return jsonify({"message": "Updated"})


@app.get("/api/admin/tours/pending")
@auth_required("admin")
def admin_pending_tours():
    tours = list(tours_col.find({"status": "pending"}).sort("createdAt", DESCENDING))
    return jsonify(populate_tours(tours))


@app.get("/api/admin/users")
@auth_required("admin")
def admin_users():
    docs = list(users_col.find({}, {"name": 1, "email": 1, "role": 1, "status": 1, "createdAt": 1}))
    return jsonify([serialize_doc(d) for d in docs])


@app.get("/api/admin/users/<user_id>")
@auth_required("admin")
def admin_user_detail(user_id):
    obj_id = to_object_id(user_id)
    if not obj_id:
        return jsonify({"message": "User not found"}), 404
    user = users_col.find_one(
        {"_id": obj_id},
        {"name": 1, "email": 1, "role": 1, "status": 1, "bio": 1, "phone": 1, "createdAt": 1},
    )
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(serialize_doc(user))


@app.get("/api/admin/stats")
@auth_required("admin")
def admin_stats():
    return jsonify(
        {
            "users": users_col.count_documents({}),
            "tours": tours_col.count_documents({}),
            "guides": users_col.count_documents({"role": "guide"}),
        }
    )


@app.errorhandler(404)
def not_found(_):
    return jsonify({"message": "Not found"}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
