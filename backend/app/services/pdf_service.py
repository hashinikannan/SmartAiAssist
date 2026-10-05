import io
import logging
from pypdf import PdfReader

logger = logging.getLogger(__name__)

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Extracts text from raw bytes of an uploaded syllabus PDF using PyPDF.
    Throws ValueError with clear user message if extraction fails.
    """
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        
        if len(reader.pages) == 0:
            raise ValueError("Uploaded PDF contains 0 pages.")

        extracted_text = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_text.append(f"--- Page {i+1} ---\n" + page_text)

        full_text = "\n".join(extracted_text).strip()
        if not full_text:
            raise ValueError("Could not extract readable text from PDF. It might be scanned or image-only.")

        return full_text
    except Exception as e:
        logger.error(f"PyPDF extraction error: {e}")
        raise ValueError(f"Failed to process PDF: {str(e)}")
