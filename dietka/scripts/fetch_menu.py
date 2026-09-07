import json
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

API_URL = "https://dietly.pl/api/form/open/menus"
DIET_ID = 21
COMPANY_ID = "elitediet"
API_KEY = "de9ed228-b371-43dc-9f9f-df8b1b0f14df"

today = datetime.now(ZoneInfo("Europe/Warsaw")).date()

# 14 dni wstecz + dziś + 42 dni naprzód.
dates = [
    (today + timedelta(days=i)).isoformat()
    for i in range(-14, 43)
]

criteria = json.dumps(
    {"dietId": DIET_ID, "dates": dates},
    separators=(",", ":")
)

url = API_URL + "?" + urllib.parse.urlencode({
    "searchCriteria": criteria
})

req = urllib.request.Request(
    url,
    headers={
        "accept": "*/*",
        "accept-language": "pl,en-US;q=0.9,en;q=0.8",
        "api-key": API_KEY,
        "company-id": COMPANY_ID,
        "origin": "https://zamow.elite-diet.pl",
        "referer": "https://zamow.elite-diet.pl/",
        "user-agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/152.0.0.0 Safari/537.36"
        ),
    },
)

with urllib.request.urlopen(req, timeout=30) as response:
    raw = json.load(response)

menu = {
    date: raw.get(date, []) if isinstance(raw.get(date, []), list) else []
    for date in dates
}

payload = {
    "dietId": DIET_ID,
    "companyId": COMPANY_ID,
    "dates": dates,
    "menu": menu,
    "fetchedAt": datetime.now(ZoneInfo("Europe/Warsaw")).isoformat()
}

Path("menu-data.json").write_text(
    json.dumps(payload, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print("Zapisano menu-data.json")
for date in dates:
    count = len(menu[date])
    if count:
        print(f"{date}: {count} posiłków")
