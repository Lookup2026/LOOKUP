import re
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response
from app.core.storage import download_photo, extract_filename

router = APIRouter(prefix="/photos", tags=["photos"])

# Regex pour valider le format UUID des noms de fichiers
UUID_FILENAME_PATTERN = re.compile(r'^[a-f0-9\-]+\.\w+$', re.IGNORECASE)


@router.get("/{filename}")
async def get_photo(filename: str):
    """
    Sert une photo depuis Supabase Storage.
    Public car les noms de fichiers sont des UUID non devinables.
    Validation du format pour empecher le path traversal.
    """
    # Valider le format du filename pour empecher le path traversal
    if '/' in filename or '..' in filename or not UUID_FILENAME_PATTERN.match(filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nom de fichier invalide"
        )
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
