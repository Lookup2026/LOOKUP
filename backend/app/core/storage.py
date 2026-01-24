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


def extract_filename(photo_url: str) -> str:
    """Extract filename from a photo_url (handles both full URLs and plain filenames)"""
    if not photo_url:
        return ""
    # If it's a full URL, get the last part
    filename = photo_url.split("/")[-1]
    # Remove query params if any
    filename = filename.split("?")[0]
    return filename


async def download_photo(photo_url: str) -> tuple[bytes, str]:
    """
    Download a photo from Supabase Storage.
    Returns (file_content, content_type)
    """
    client = get_supabase_client()
    if not client:
        raise Exception("Supabase not configured")

    filename = extract_filename(photo_url)
    if not filename:
        raise Exception("Invalid photo URL")

    data = client.storage.from_(settings.SUPABASE_BUCKET).download(filename)

    # Determine content type from extension
    ext = filename.split(".")[-1].lower() if "." in filename else "jpg"
    content_type = f"image/{ext}"
    if ext == "jpg":
        content_type = "image/jpeg"

    return data, content_type


async def upload_photo(file_content: bytes, filename: str) -> str:
    """
    Upload a photo to Supabase Storage.
    Returns the filename (to be served via /api/photos/ endpoint).
    """
    client = get_supabase_client()

    if not client:
        raise Exception("Supabase not configured")

    # Generate unique filename
    file_ext = filename.split(".")[-1] if "." in filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_ext}"

    # Upload to Supabase Storage
    client.storage.from_(settings.SUPABASE_BUCKET).upload(
        path=unique_filename,
        file=file_content,
        file_options={"content-type": f"image/{file_ext}"}
    )

    # Return just the filename - served via /api/photos/{filename}
    return unique_filename


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
