# ============================================================
#  routes/mess_config.py  — Create & list mess locations
# ============================================================

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from bson import ObjectId

from core.database import get_db
from core.security import get_current_admin
from models.schemas import MessCreate

router = APIRouter()


@router.post("", dependencies=[Depends(get_current_admin)])
async def create_mess(data: MessCreate):
    db = get_db()

    # Prevent duplicate mess names
    existing = await db.mess.find_one({"name": data.name})
    if existing:
        raise HTTPException(status_code=400, detail="A mess with this name already exists")

    doc = {
        "name": data.name,
        "institution": data.institution,
        "created_at": datetime.utcnow(),
    }
    result = await db.mess.insert_one(doc)

    return {"id": str(result.inserted_id), "name": data.name, "message": "Mess created successfully"}


@router.get("")
async def get_all_mess():
    """Public route — frontend needs this to populate dropdowns."""
    db = get_db()
    mess_list = []
    async for m in db.mess.find().sort("created_at", -1):
        mess_list.append({
            "id": str(m["_id"]),
            "name": m["name"],
            "institution": m["institution"],
            "created_at": m["created_at"].isoformat(),
        })
    return {"mess": mess_list}


@router.delete("/{mess_id}", dependencies=[Depends(get_current_admin)])
async def delete_mess(mess_id: str):
    db = get_db()
    result = await db.mess.delete_one({"_id": ObjectId(mess_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mess not found")
    return {"message": "Mess deleted successfully"}
