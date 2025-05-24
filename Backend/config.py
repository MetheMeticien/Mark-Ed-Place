from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # DATABASE_URL: str = "postgresql://healthstaruser:Os6qVLusTe4Cqft3foftAAEodBG3PZls@dpg-d0fijfbuibrs73eo8j3g-a.singapore-postgres.render.com/healthstardb"
    DATABASE_URL: str = "postgresql://postgres:1234@localhost:5432/coderush"
    
    SECRET_KEY: str = "RifatSarwar"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()