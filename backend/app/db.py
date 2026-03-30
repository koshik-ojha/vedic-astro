"""MongoDB database layer for Vedic Astrology Bot.

This module provides database operations using MongoDB with async support.
Collections: users, profiles, daily_cache
"""

from typing import Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import MONGODB_URL, MONGODB_DB_NAME

# Global MongoDB client and database
_mongo_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


async def connect_db():
    """Initialize MongoDB connection."""
    global _mongo_client, _database
    _mongo_client = AsyncIOMotorClient(MONGODB_URL)
    _database = _mongo_client[MONGODB_DB_NAME]

    # Create indexes for better performance
    await _database.users.create_index("telegram_user_id", unique=True, sparse=True)
    await _database.users.create_index("email", unique=True, sparse=True)
    # Allow multiple profiles per user (drop old single-field unique index if exists)
    try:
        await _database.profiles.drop_index("user_id_1")
    except Exception:
        pass
    await _database.profiles.create_index([("user_id", 1), ("profile_name", 1)], unique=True)
    await _database.daily_cache.create_index([("date", 1), ("type", 1), ("key", 1)], unique=True)

    print(f"Connected to MongoDB: {MONGODB_DB_NAME}")


async def disconnect_db():
    """Close MongoDB connection."""
    global _mongo_client
    if _mongo_client:
        _mongo_client.close()
        print("Disconnected from MongoDB")


def get_database() -> AsyncIOMotorDatabase:
    """Get the database instance."""
    if _database is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return _database


async def get_or_create_user_by_telegram(telegram_user_id: str, name: str | None = None) -> Dict[str, Any]:
    """Get or create a user by Telegram user ID."""
    db = get_database()
    
    # Try to find existing user
    user = await db.users.find_one({"telegram_user_id": telegram_user_id})
    
    if user:
        # Update name if provided and not already set
        if name and not user.get("name"):
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"name": name}}
            )
            user["name"] = name
        user["id"] = str(user["_id"])
        return user
    
    # Create new user
    new_user = {
        "telegram_user_id": telegram_user_id,
        "name": name
    }
    result = await db.users.insert_one(new_user)
    new_user["id"] = str(result.inserted_id)
    new_user["_id"] = result.inserted_id
    return new_user


async def upsert_profile(user_id: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    """Create or update a named profile for a user."""
    db = get_database()
    profile_name = profile.get("profile_name") or "My Profile"
    profile_data = {"user_id": user_id, "profile_name": profile_name, **profile}

    await db.profiles.update_one(
        {"user_id": user_id, "profile_name": profile_name},
        {"$set": profile_data},
        upsert=True,
    )
    saved = await db.profiles.find_one({"user_id": user_id, "profile_name": profile_name})
    if saved:
        saved["id"] = str(saved["_id"])
        saved.pop("_id", None)
        return saved
    return profile_data


async def get_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get the first profile for a user (backward compat)."""
    db = get_database()
    profile = await db.profiles.find_one({"user_id": user_id})
    if profile:
        profile["id"] = str(profile["_id"])
        profile.pop("_id", None)
    return profile


async def get_profile_by_id(profile_id: str) -> Optional[Dict[str, Any]]:
    """Get a profile by its MongoDB ObjectId."""
    from bson import ObjectId
    db = get_database()
    try:
        doc = await db.profiles.find_one({"_id": ObjectId(profile_id)})
    except Exception:
        return None
    if doc:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
    return doc


async def list_profiles(user_id: str) -> list:
    """List all profiles for a user."""
    db = get_database()
    cursor = db.profiles.find({"user_id": user_id})
    result = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        result.append(doc)
    return result


async def delete_profile_by_id(profile_id: str, user_id: str) -> None:
    """Delete a profile by ID (scoped to user for safety)."""
    from bson import ObjectId
    db = get_database()
    try:
        r = await db.profiles.delete_one({"_id": ObjectId(profile_id), "user_id": user_id})
        if r.deleted_count == 0:
            raise ValueError("Profile not found")
    except ValueError:
        raise
    except Exception:
        raise ValueError("Invalid profile id")


async def update_profile_by_id(profile_id: str, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update a profile by ID (scoped to user for safety)."""
    from bson import ObjectId
    db = get_database()
    try:
        # Ensure user_id matches for security
        existing = await db.profiles.find_one({"_id": ObjectId(profile_id), "user_id": user_id})
        if not existing:
            raise ValueError("Profile not found")
        
        # Update the profile
        update_data = {**profile_data, "user_id": user_id}
        await db.profiles.update_one(
            {"_id": ObjectId(profile_id)},
            {"$set": update_data}
        )
        
        # Return updated profile
        updated = await db.profiles.find_one({"_id": ObjectId(profile_id)})
        if updated:
            updated["id"] = str(updated["_id"])
            updated.pop("_id", None)
        return updated
    except ValueError:
        raise
    except Exception:
        raise ValueError("Invalid profile id")


async def put_daily_cache(date: str, type_: str, key: str, content: Any) -> None:
    """Store daily astrology data in cache."""
    db = get_database()
    
    cache_data = {
        "date": date,
        "type": type_,
        "key": key,
        "content": content
    }
    
    await db.daily_cache.update_one(
        {"date": date, "type": type_, "key": key},
        {"$set": cache_data},
        upsert=True
    )


async def get_daily_cache(date: str, type_: str, key: str) -> Optional[Dict[str, Any]]:
    """Retrieve daily astrology data from cache."""
    db = get_database()
    cache = await db.daily_cache.find_one({"date": date, "type": type_, "key": key})
    return cache


# ── Email / Password Auth ──────────────────────────────────────────────────

async def create_user_with_email(email: str, name: str, password_hash: str) -> Dict[str, Any]:
    """Create a new user with email and hashed password."""
    from datetime import datetime, timezone
    db = get_database()
    new_user = {
        "email": email,
        "name": name,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(new_user)
    new_user["id"] = str(result.inserted_id)
    new_user["_id"] = result.inserted_id
    return new_user


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Fetch a user by email address."""
    db = get_database()
    user = await db.users.find_one({"email": email})
    if user:
        user["id"] = str(user["_id"])
    return user


async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a user by their MongoDB ObjectId string."""
    from bson import ObjectId
    db = get_database()
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None
    if user:
        user["id"] = str(user["_id"])
    return user
