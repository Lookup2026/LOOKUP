"""
Système de zones 50m x 50m pour la détection des croisements.
Au lieu de calculer les distances GPS, on découpe la carte en grille.
"""

import math

# Taille d'une zone en mètres
ZONE_SIZE_METERS = 50

# 1 degré de latitude = ~111km
METERS_PER_DEGREE_LAT = 111_000

def get_zone_id(latitude: float, longitude: float) -> str:
    """
    Convertit des coordonnées GPS en identifiant de zone.
    Retourne un ID unique pour chaque carré de 50m x 50m.
    """
    # Calculer l'index de la zone en latitude
    zone_lat = int(latitude * METERS_PER_DEGREE_LAT / ZONE_SIZE_METERS)

    # Pour la longitude, ajuster selon la latitude (la terre est ronde)
    # 1 degré de longitude = 111km * cos(latitude)
    meters_per_degree_lon = METERS_PER_DEGREE_LAT * math.cos(math.radians(latitude))
    zone_lon = int(longitude * meters_per_degree_lon / ZONE_SIZE_METERS)

    # Créer un ID unique pour cette zone
    return f"{zone_lat}:{zone_lon}"


def get_adjacent_zones(zone_id: str) -> list:
    """
    Retourne la liste des zones adjacentes (8 voisins + la zone elle-meme).
    """
    zone_lat, zone_lon = map(int, zone_id.split(':'))
    adjacent = []
    for dlat in [-1, 0, 1]:
        for dlon in [-1, 0, 1]:
            adjacent.append(f"{zone_lat + dlat}:{zone_lon + dlon}")
    return adjacent


def get_zone_center(zone_id: str) -> tuple:
    """
    Retourne les coordonnées du centre d'une zone.
    """
    zone_lat, zone_lon = map(int, zone_id.split(':'))

    # Reconvertir en coordonnées GPS (approximatif)
    lat = (zone_lat * ZONE_SIZE_METERS) / METERS_PER_DEGREE_LAT
    # On utilise une latitude moyenne pour la conversion inverse
    lon = (zone_lon * ZONE_SIZE_METERS) / (METERS_PER_DEGREE_LAT * math.cos(math.radians(lat)))

    return (lat, lon)
