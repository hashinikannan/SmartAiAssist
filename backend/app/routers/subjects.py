from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import uuid

from app.models.schemas import Subject, SubjectCreate, SubjectUpdate
from app.database import in_memory_db, is_mongo_connected, mongo_db

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.get("", response_model=List[Subject])
async def get_subjects():
    if is_mongo_connected:
        try:
            cursor = mongo_db.subjects.find({})
            subjects = await cursor.to_list(length=100)
            return [Subject(**s) for s in subjects]
        except Exception:
            pass
    return list(in_memory_db.subjects.values())

@router.post("", response_model=Subject)
async def create_subject(sub: SubjectCreate):
    new_id = f"sub-{uuid.uuid4().hex[:8]}"
    subject = Subject(
        id=new_id,
        name=sub.name,
        exam_date=sub.exam_date,
        topics=sub.topics,
        difficulty=sub.difficulty,
        confidence=sub.confidence,
        daily_available_hours=sub.daily_available_hours
    )
    
    if is_mongo_connected:
        try:
            await mongo_db.subjects.insert_one(subject.dict())
        except Exception:
            pass

    in_memory_db.subjects[new_id] = subject.dict()
    return subject

@router.put("/{subject_id}", response_model=Subject)
async def update_subject(subject_id: str, update_data: SubjectUpdate):
    existing = in_memory_db.subjects.get(subject_id)
    if is_mongo_connected:
        try:
            doc = await mongo_db.subjects.find_one({"id": subject_id})
            if doc:
                existing = doc
        except Exception:
            pass

    if not existing:
        raise HTTPException(status_code=404, detail="Subject not found")

    updated_dict = existing.copy()
    if update_data.name is not None:
        updated_dict["name"] = update_data.name
    if update_data.exam_date is not None:
        updated_dict["exam_date"] = update_data.exam_date
    if update_data.topics is not None:
        updated_dict["topics"] = [t.dict() if hasattr(t, 'dict') else t for t in update_data.topics]
    if update_data.difficulty is not None:
        updated_dict["difficulty"] = update_data.difficulty
    if update_data.confidence is not None:
        updated_dict["confidence"] = update_data.confidence

    if is_mongo_connected:
        try:
            await mongo_db.subjects.update_one({"id": subject_id}, {"$set": updated_dict})
        except Exception:
            pass

    in_memory_db.subjects[subject_id] = updated_dict
    return Subject(**updated_dict)

@router.delete("/{subject_id}")
async def delete_subject(subject_id: str):
    if is_mongo_connected:
        try:
            await mongo_db.subjects.delete_one({"id": subject_id})
        except Exception:
            pass
            
    if subject_id in in_memory_db.subjects:
        del in_memory_db.subjects[subject_id]
        return {"message": "Subject deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Subject not found")
