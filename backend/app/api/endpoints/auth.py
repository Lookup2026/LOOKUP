from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
import logging

logger = logging.getLogger(__name__)
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.storage import upload_photo, delete_photo
from app.core.config import settings
from app.models import User, BlockedUser, Look, Report
from app.models.look import LookLike, LookView, SavedLook
from app.models.location import LocationPing, Crossing
from app.models.user import generate_referral_code
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")  # 5 inscriptions max par minute par IP
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """Creer un nouveau compte utilisateur"""

    # Verifier si email existe deja
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est deja utilise"
        )

    # Verifier si username existe deja
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce nom d'utilisateur est deja pris"
        )

    # Chercher le parrain si un code est fourni
    referrer = None
    if user_data.referral_code:
        referrer = db.query(User).filter(
            User.referral_code == user_data.referral_code.upper()
        ).first()

    # Generer un code de parrainage unique
    new_referral_code = generate_referral_code()
    while db.query(User).filter(User.referral_code == new_referral_code).first():
        new_referral_code = generate_referral_code()

    # Creer l'utilisateur
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        referral_code=new_referral_code,
        referred_by_id=referrer.id if referrer else None
    )
    db.add(user)

    # Incrementer le compteur du parrain
    if referrer:
        referrer.referral_count += 1

    db.commit()
    db.refresh(user)

    return user

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")  # 10 tentatives max par minute par IP
async def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    """Connexion utilisateur"""

    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte desactive"
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    response = JSONResponse(content={
        "access_token": access_token,
        "token_type": "bearer"
    })
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return response

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Obtenir les infos de l'utilisateur connecte"""
    return current_user

@router.post("/logout")
async def logout():
    """Deconnecter l'utilisateur (supprime le cookie httpOnly)"""
    response = JSONResponse(content={"success": True})
    response.delete_cookie(key="access_token", httponly=True, secure=settings.is_production, samesite="lax")
    return response


@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload une photo de profil"""

    # Vérifier le type de fichier (whitelist stricte)
    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
    if photo.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format accepte : JPEG, PNG ou WebP uniquement"
        )

    # Lire le contenu (lecture limitee pour eviter memory exhaustion)
    content = await photo.read(settings.MAX_FILE_SIZE + 1)
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fichier trop volumineux (max 5MB)"
        )

    # Supprimer l'ancienne photo si elle existe
    if current_user.avatar_url:
        await delete_photo(current_user.avatar_url)

    # Upload la nouvelle photo
    try:
        avatar_url = await upload_photo(content, photo.filename)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'upload de la photo"
        )

    # Mettre à jour l'utilisateur
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)

    return current_user


@router.delete("/account")
async def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supprimer definitivement son compte et toutes ses donnees (RGPD).
    Cette action est irreversible.
    """
    user_id = current_user.id
    logger.info(f"Suppression compte demandee par user {user_id} ({current_user.email})")

    # 1. Supprimer les photos des looks depuis le storage
    user_looks = db.query(Look).filter(Look.user_id == user_id).all()
    for look in user_looks:
        if look.photo_url:
            try:
                await delete_photo(look.photo_url)
            except Exception as e:
                logger.warning(f"Echec suppression photo look {look.id}: {e}")

    # 2. Supprimer l'avatar
    if current_user.avatar_url:
        try:
            await delete_photo(current_user.avatar_url)
        except Exception as e:
            logger.warning(f"Echec suppression avatar user {user_id}: {e}")

    # 3. Supprimer les likes/vues donnes par l'utilisateur sur d'autres looks
    db.query(LookLike).filter(LookLike.user_id == user_id).delete()
    db.query(LookView).filter(LookView.user_id == user_id).delete()

    # 4. Supprimer les looks sauvegardes (par l'utilisateur et de l'utilisateur)
    db.query(SavedLook).filter(SavedLook.user_id == user_id).delete()
    # Supprimer les sauvegardes des looks de l'utilisateur par d'autres
    for look in user_looks:
        db.query(SavedLook).filter(SavedLook.look_id == look.id).delete()

    # 5. Supprimer les looks (cascade supprime items, likes, views)
    db.query(Look).filter(Look.user_id == user_id).delete()

    # 6. Supprimer les location pings
    db.query(LocationPing).filter(LocationPing.user_id == user_id).delete()

    # 7. Supprimer les croisements
    db.query(Crossing).filter(
        or_(Crossing.user1_id == user_id, Crossing.user2_id == user_id)
    ).delete()

    # 8. Supprimer les blocages (dans les deux sens)
    db.query(BlockedUser).filter(
        or_(BlockedUser.blocker_id == user_id, BlockedUser.blocked_id == user_id)
    ).delete()

    # 9. Supprimer les signalements (faits par ou contre l'utilisateur)
    db.query(Report).filter(
        or_(Report.reporter_id == user_id, Report.reported_user_id == user_id)
    ).delete()

    # 10. Mettre a jour les parrainages (ne pas casser les references)
    # Les utilisateurs parraines gardent leur compte mais perdent la reference
    db.query(User).filter(User.referred_by_id == user_id).update(
        {User.referred_by_id: None}
    )

    # 11. Enfin supprimer l'utilisateur
    db.delete(current_user)
    db.commit()

    return {"success": True, "message": "Ton compte et toutes tes donnees ont ete supprimes definitivement."}
