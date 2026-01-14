from supabase import create_client, Client
from app.core.config import settings
import uuid

_supabase_client: Client = None

def get_supabase_client() -> Client:
    """Get or create Supabase client"""
    global _supabase_client
    if _supabase_client is None and settings.SUPABASE_URL and settings.SUPABASE_KEY:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client


async def upload_photo(file_content: bytes, filename: str) -> str:
    """
    Upload a photo to Supabase Storage.
    Returns the public URL of the uploaded file.
    """
    client = get_supabase_client()

    if not client:
        raise Exception("Supabase not configured")

    # Generate unique filename
    file_ext = filename.split(".")[-1] if "." in filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_ext}"

    # Upload to Supabase Storage
    result = client.storage.from_(settings.SUPABASE_BUCKET).upload(
        path=unique_filename,
        file=file_content,
        file_options={"content-type": f"image/{file_ext}"}
    )

    # Get public URL
    public_url = client.storage.from_(settings.SUPABASE_BUCKET).get_public_url(unique_filename)

    return public_url


async def delete_photo(photo_url: str) -> bool:
    """
    Delete a photo from Supabase Storage.
    """
    client = get_supabase_client()

    if not client or not photo_url:
        return False

    try:
        # Extract filename from URL
        filename = photo_url.split("/")[-1]
        client.storage.from_(settings.SUPABASE_BUCKET).remove([filename])
        return True
    except Exception:
        return False
