import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDb } from "./config/db.js";
import User from "./models/User.js";
import Tour from "./models/Tour.js";

async function seed() {
  await connectDb(process.env.MONGO_URI);

  await User.deleteMany();
  await Tour.deleteMany();

  const adminPass = await bcrypt.hash("Admin123!", 10);
  const guidePass = await bcrypt.hash("Guide123!", 10);
  const touristPass = await bcrypt.hash("User123!", 10);

  const admin = await User.create({
    name: "Admin",
    email: "admin@nichecity.com",
    password: adminPass,
    role: "admin",
    status: "active"
  });

  const guide = await User.create({
    name: "Farhan Rahman",
    email: "guide@nichecity.com",
    password: guidePass,
    role: "guide",
    status: "active",
    bio: "Old Dhaka food and heritage storyteller"
  });

  const guide2 = await User.create({
    name: "Nusrat Akter",
    email: "guide2@nichecity.com",
    password: guidePass,
    role: "guide",
    status: "active",
    bio: "Riverfront routes and city photography"
  });

  await User.create({
    name: "Tourist One",
    email: "tourist@nichecity.com",
    password: touristPass,
    role: "tourist",
    status: "active"
  });

  const tours = [
    {
      title: "Old Dhaka Street Food Walk",
      description: "Chowk Bazar bites, bakarkhani, and the lanes of Shakhari Bazar.",
      itinerary: "Meet at Chowk Bazar, walk 2.5 km, visit 6 food stops.",
      category: "Food",
      durationHours: 3,
      price: 18,
      capacity: 12,
      meetingPoint: "Chowk Bazar, Old Dhaka",
      coverImage: "https://images.unsplash.com/flagged/photo-1573664217554-15b547ef9f8a?auto=format&fit=crop&w=800&q=60",
      guide: guide._id,
      status: "approved",
      slots: [
        { start: new Date(Date.now() + 86400000), capacity: 12, booked: 3 },
        { start: new Date(Date.now() + 172800000), capacity: 12, booked: 1 }
      ]
    },
    {
      title: "Old Dhaka Heritage Walk",
      description: "Ahsan Manzil, Lalbagh Fort, and the Armenian Church precinct.",
      itinerary: "Meet at Ahsan Manzil gate, walk 3 km, end at Armanitola.",
      category: "Heritage",
      durationHours: 3,
      price: 20,
      capacity: 15,
      meetingPoint: "Ahsan Manzil Museum gate, Kumartoli",
      coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60",
      guide: guide._id,
      status: "approved",
      slots: [
        { start: new Date(Date.now() + 2 * 86400000), capacity: 15, booked: 4 },
        { start: new Date(Date.now() + 4 * 86400000), capacity: 15, booked: 0 }
      ]
    },
    {
      title: "Sadarghat & Buriganga Riverfront",
      description: "Sadarghat launch terminal and the Buriganga riverfront views.",
      itinerary: "Meet at Sadarghat, short boat ride, riverfront photo stops.",
      category: "Culture",
      durationHours: 2,
      price: 12,
      capacity: 10,
      meetingPoint: "Sadarghat launch terminal",
      coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60",
      guide: guide2._id,
      status: "approved",
      slots: [
        { start: new Date(Date.now() + 3 * 86400000), capacity: 10, booked: 2 },
        { start: new Date(Date.now() + 5 * 86400000), capacity: 10, booked: 0 }
      ]
    },
    {
      title: "Curzon Hall & Dhaka University Walk",
      description: "Curzon Hall architecture and the historic Shahbagh campus.",
      itinerary: "Meet at Curzon Hall main gate, campus walk, photo stops.",
      category: "Culture",
      durationHours: 2,
      price: 10,
      capacity: 12,
      meetingPoint: "Curzon Hall gate, University of Dhaka",
      coverImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=60",
      guide: guide2._id,
      status: "approved",
      slots: [
        { start: new Date(Date.now() + 2 * 86400000), capacity: 12, booked: 1 },
        { start: new Date(Date.now() + 6 * 86400000), capacity: 12, booked: 0 }
      ]
    },
    {
      title: "Hatirjheel Evening Loop",
      description: "Walkways, bridges, and lake views at Hatirjheel after sunset.",
      itinerary: "Meet at Hatirjheel viewing deck, loop walk, photo stops.",
      category: "Night",
      durationHours: 2,
      price: 14,
      capacity: 12,
      meetingPoint: "Hatirjheel Lake viewing deck",
      coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60",
      guide: guide2._id,
      status: "approved",
      slots: [
        { start: new Date(Date.now() + 1 * 86400000), capacity: 12, booked: 3 },
        { start: new Date(Date.now() + 3 * 86400000), capacity: 12, booked: 0 }
      ]
    },
    {
      title: "Parliament & Manik Mia Avenue",
      description: "Jatiya Sangsad Bhaban views and Manik Mia Avenue.",
      itinerary: "Meet at Manik Mia Avenue, loop walk, lake viewpoints.",
      category: "Photography",
      durationHours: 2,
      price: 16,
      capacity: 12,
      meetingPoint: "Manik Mia Avenue south gate",
      coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60",
      guide: guide2._id,
      status: "approved",
      slots: [
        { start: new Date(Date.now() + 4 * 86400000), capacity: 12, booked: 2 },
        { start: new Date(Date.now() + 7 * 86400000), capacity: 12, booked: 0 }
      ]
    }
  ];

  const created = await Tour.insertMany(tours);

  console.log("Seed completed", {
    admin: admin.email,
    guide: guide.email,
    guide2: guide2.email,
    tours: created.map(t => t.title)
  });
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
