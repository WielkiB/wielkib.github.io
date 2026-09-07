import json
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

COMPANY_ID = "elitediet"
MENU_ID = 142
CITY_ID = 982954

today = datetime.now(ZoneInfo("Europe/Warsaw")).date()
dates = [(today + timedelta(days=i)).isoformat() for i in range(-14, 43)]

headers = {
    "accept": "application/json",
    "company-id": COMPANY_ID,
    "x-launcher-type": "BROWSER_DIETLY",
    "referer": "https://dietly.pl/catering-dietetyczny-firma/elitediet",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
}

menu = {}
for date in dates:
    url = f"https://dietly.pl/api/dietly/open/company-card/{COMPANY_ID}/menu/{MENU_ID}/city/{CITY_ID}/date/{date}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            data = json.load(response)
            menu[date] = data
            print(f"{date}: {len(data.get('meals', []))} posiłków")
    except Exception as exc:
        menu[date] = None
        print(f"{date}: brak danych ({exc})")

payload = {
    "companyId": COMPANY_ID,
    "menuId": MENU_ID,
    "cityId": CITY_ID,
    "dates": dates,
    "menu": menu,
    "fetchedAt": datetime.now(ZoneInfo("Europe/Warsaw")).isoformat(),
}

Path("menu-data.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print("Zapisano menu-data.json")
