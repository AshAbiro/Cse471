try:
    from flask_api.api.index import app
except ModuleNotFoundError as exc:
    if exc.name != "flask_api":
        raise
    from api.index import app
