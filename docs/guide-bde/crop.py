"""Recadre les captures brutes (shots/final) vers guide/img, coordonnees en pixels CSS (x2)."""
import os
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
S, O = f"{D}/shots/final/", f"{D}/guide/img/"
os.makedirs(O, exist_ok=True)


def crop(name, box=None, out=None):
    im = Image.open(S + name + ".png").convert("RGB")
    if box:
        im = im.crop(tuple(v * 2 for v in box))
    im.save(O + (out or name) + ".png", optimize=True)
    print(out or name, im.size)


crop("01-connexion", (0, 170, 1440, 750))
crop("02-accueil")
crop("06-verser-resultat", (0, 22, 784, 442))
for n in ["03-verser-fichiers", "04-verser-matiere", "05-verser-formulaire",
          "07-mes-epreuves-menu", "11-supprimer", "13-manquante-prerempli", "16-mobile", "16-mobile-menu"]:
    crop(n)
crop("08-fiche", (300, 20, 1410, 900))
crop("09-modifier", (440, 0, 1250, 900))
crop("10-remplacer", (440, 0, 1250, 700))
crop("12-manquantes-page", (300, 125, 860, 900), "12-manquantes")
crop("14-recherche", (300, 0, 1410, 900))
crop("15-reglages", (510, 0, 1190, 700))
