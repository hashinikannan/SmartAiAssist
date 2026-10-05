import logging
from typing import Dict, Any, List, Optional
import uuid
import datetime

from app.config import settings

logger = logging.getLogger(__name__)

# Fallback in-memory database store (Starts completely empty for a brand new student account)
class InMemoryDBStore:
    def __init__(self):
        self.subjects: Dict[str, Dict[str, Any]] = {}
        self.study_plans: Dict[str, Dict[str, Any]] = {}
        self.study_sessions: Dict[str, Dict[str, Any]] = {}
        self.quiz_results: List[Dict[str, Any]] = []
        self.chat_history: List[Dict[str, Any]] = []
        self.user_profile: Dict[str, Any] = {
            "id": "user_1",
            "name": "Student",
            "email": "student@studymate.ai",
            "daily_study_hours": 3.0,
            "preferred_study_time": "Morning & Evening",
            "study_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "streak": 0
        }

in_memory_db = InMemoryDBStore()
is_mongo_connected = False
db_client = None
mongo_db = None

async def init_db():
    global is_mongo_connected, db_client, mongo_db
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Test ping
        await client.admin.command('ping')
        db_client = client
        mongo_db = client[settings.MONGODB_DB_NAME]
        is_mongo_connected = True
        logger.info("Successfully connected to MongoDB!")
    except Exception as e:
        is_mongo_connected = False
        logger.warning(f"MongoDB connection failed ({e}). Falling back to in-memory database mode.")

def get_db_status():
    return {
        "mongo_connected": is_mongo_connected,
        "database_mode": "MongoDB" if is_mongo_connected else "In-Memory Fallback"
    }
