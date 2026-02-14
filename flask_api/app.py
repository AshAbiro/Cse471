try:
    from flask_api.api.index import app
except Exception:
    from api.index import app
