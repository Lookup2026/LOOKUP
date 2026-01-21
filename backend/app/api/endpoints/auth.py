from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
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

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
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
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
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

    return Token(access_token=access_token)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Obtenir les infos de l'utilisateur connecte"""
    return current_user


@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload une photo de profil"""

    # Vérifier le type de fichier
    if not photo.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier doit être une image"
        )

    # Lire le contenu
    content = await photo.read()
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur upload photo: {str(e)}"
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

    # 1. Supprimer les photos des looks depuis le storage
    user_looks = db.query(Look).filter(Look.user_id == user_id).all()
    for look in user_looks:
        if look.photo_url:
            try:
                await delete_photo(look.photo_url)
            except Exception:
                pass  # Continue meme si la photo n'existe plus

    # 2. Supprimer l'avatar
    if current_user.avatar_url:
        try:
            await delete_photo(current_user.avatar_url)
        except Exception:
            pass

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
