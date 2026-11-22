from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    usgs_base_url: str = "https://earthquake.usgs.gov/fdsnws/event/1"
    nws_alerts_url: str = "https://api.weather.gov/alerts/active"
    elevation_url: str = "https://api.open-meteo.com/v1/elevation"
    http_timeout_s: float = 8.0
    cache_ttl_s: int = 60
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    use_sample_fallback: bool = True
    user_agent: str = "SEISMOS-ORBIT-EXE/1.0 (hackathon prototype)"

@lru_cache
def get_settings() -> Settings:
    return Settings()
