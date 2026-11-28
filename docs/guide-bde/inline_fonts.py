"""Prepare guide-inline.html : polices en data: URI (les zones de marge de @page ne voient pas les
fichiers) et espaces insecables de la typographie francaise dans le corps du texte."""
import base64, os, re
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "guide")
s = open(os.path.join(D, "guide.html")).read()


def font(m):
    data = base64.b64encode(open(os.path.join(D, "fonts", m.group(1)), "rb").read()).decode()
    return f"url(data:font/woff2;base64,{data}) format('woff2')"


head, body = s.split("</style>", 1)
head = re.sub(r"url\(fonts/([\w.-]+)\)", font, head)
NB, NNB = " ", " "


def typo(t):
    t = re.sub(r" ([:;?!»])", NNB + r"\1", t)
    t = t.replace("« ", "«" + NNB)
    t = re.sub(r"(\d) (Ko|heures|fichiers?)", r"\1" + NB + r"\2", t)
    return re.sub(r"(section|Figure|Étape) (\w)", r"\1" + NB + r"\2", t)


# Texte seulement : les balises (et leurs attributs) restent intactes.
body = "".join(part if part.startswith("<") else typo(part) for part in re.split(r"(<[^>]+>)", body))
open(os.path.join(D, "guide-inline.html"), "w").write(head + "</style>" + body)
