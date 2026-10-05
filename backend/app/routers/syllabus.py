import base64
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.pdf_service import extract_text_from_pdf_bytes
from app.services.ai_service import get_ai_service
from app.models.schemas import SyllabusParseResponse

router = APIRouter(prefix="/syllabus", tags=["Syllabus"])

class SyllabusUploadRequest(BaseModel):
    pdf_base64: Optional[str] = None
    raw_text: Optional[str] = None
    filename: Optional[str] = "syllabus.pdf"

@router.post("/upload", response_model=SyllabusParseResponse)
async def upload_syllabus(req: SyllabusUploadRequest):
    try:
        extracted_text = ""
        if req.pdf_base64:
            # Decode base64 bytes
            pdf_bytes = base64.b64decode(req.pdf_base64)
            extracted_text = extract_text_from_pdf_bytes(pdf_bytes)
        elif req.raw_text:
            extracted_text = req.raw_text
        else:
            raise HTTPException(status_code=400, detail="Either pdf_base64 or raw_text must be provided.")

        ai_service = get_ai_service()
        parsed_result = await ai_service.parse_syllabus_text(extracted_text)
        return parsed_result
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Syllabus PDF processing failed: {str(e)}")
