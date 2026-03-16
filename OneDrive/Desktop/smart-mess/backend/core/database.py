# ============================================================
#  core/database.py  — MongoDB connection using Motor (async)
# ============================================================

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# These will be set when connect_db() is called
client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Called once when FastAPI starts up."""
    global client, db
    client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
    db = client[os.getenv("DB_NAME", "smart_mess_db")]
    print("✅ Connected to MongoDB")


async def close_db():
    """Called when FastAPI shuts down."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db():
    """Returns the database instance. Used in all route files."""
    return db
