"""Kvitterer Zniff-kjøp hos Google Play.

Appen legger kjøpsbeviset (purchaseToken) i skjemaet «Zniff kvittering». Svarene havner i et regneark.
Denne jobben leser regnearket, sjekker hvert kjøp hos Google Play og kvitterer kjøp som ikke er kvittert.
Google refunderer kjøp som ikke er kvittert innen tre dager. Ingen nøkler: tilgangen kommer fra GitHub via Workload Identity.
"""
import json, os, sys, urllib.parse, urllib.request, urllib.error

TOKEN = os.environ["GTOKEN"]
SHEET = "1dfP-XxRnKGSzj7KWCVBWI6cDJ7Z-wL412CzYpSi7p_o"
RANGE = "'Skjemasvar 1'!A2:B"
PKG, SKU = "no.wergeland.zniff", "zniff_full"
API = f"https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{PKG}/purchases/products/{SKU}/tokens/"


def call(url, method="GET", body=None):
    req = urllib.request.Request(url, method=method, data=body, headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")[:300]


status, data = call(f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET}/values/{urllib.parse.quote(RANGE)}")
if status != 200:
    print("Fikk ikke lest regnearket:", status, data)
    sys.exit(1)

rows = data.get("values", [])
tokens = []
for row in rows[-500:]:
    t = (row[1] if len(row) > 1 else "").strip()
    if 20 <= len(t) <= 4096 and t not in tokens:
        tokens.append(t)

kvittert = allerede = ukjent = feil = 0
for t in tokens:
    kort = t[:8] + "…"
    s, p = call(API + urllib.parse.quote(t, safe=""))
    if s in (400, 404, 410):
        ukjent += 1
        continue
    if s in (401, 403):
        print("Ingen tilgang til Google Play:", s, p)
        sys.exit(1)
    if s != 200:
        feil += 1
        print(kort, "Google svarte", s)
        continue
    if p.get("purchaseState") != 0:
        print(kort, "ikke betalt (state", p.get("purchaseState"), ")")
        continue
    if p.get("acknowledgementState") == 1:
        allerede += 1
        continue
    s2, p2 = call(API + urllib.parse.quote(t, safe="") + ":acknowledge", "POST", b"{}")
    if s2 in (200, 204):
        kvittert += 1
        print(kort, "kvittert")
    else:
        feil += 1
        print(kort, "kvittering feilet", s2, p2)

print(f"Rader: {len(rows)}, unike kjøpsbevis: {len(tokens)}, kvittert nå: {kvittert}, kvittert fra før: {allerede}, ukjente: {ukjent}, feil: {feil}")
sys.exit(1 if feil else 0)
