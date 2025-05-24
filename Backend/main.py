from fastapi import FastAPI
import database
from fastapi.middleware.cors import CORSMiddleware
from features.authentication.routes import router as auth_router
from features.Role_access.routes import user_role_router, moderator_request_router
try:
    database.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    import traceback
    traceback.print_exc()
    raise e

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify your Flutter app's exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_role_router)
app.include_router(moderator_request_router)
