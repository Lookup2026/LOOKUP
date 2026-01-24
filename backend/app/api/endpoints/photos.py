from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response
from app.core.storage import download_photo, extract_filename

router = APIRouter(prefix="/photos", tags=["photos"])


@router.get("/{filename}")
async def get_photo(filename: str):
    """Sert une photo depuis Supabase Storage"""
    try:
        data, content_type = await download_photo(filename)
        return Response(
            content=data,
            media_type=content_type,
            headers={"Cache-Control": "public, max-age=86400"}
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo non trouvee"
        )
