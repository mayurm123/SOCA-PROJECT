import requests
import pymongo
import time
import logging
import os
from datetime import datetime
from dotenv import load_dotenv
# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
SYMBOLS = os.getenv("SYMBOLS", "NIFTY,BANKNIFTY,FINNIFTY").split(",")

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "*/*",
    "Referer": "https://www.nseindia.com/option-chain",
    "Connection": "keep-alive"


}

# Mongo setup
client = pymongo.MongoClient(MONGO_URI)
db = client["soca"]
collection = db["option_chain"]
collection.create_index(
    [("symbol", pymongo.ASCENDING), ("timestamp", pymongo.ASCENDING)],
    unique=True
)

def fetch_and_store(symbol):
    try:
        session = requests.Session()
        session.get("https://www.nseindia.com", headers=HEADERS, timeout=10)
        time.sleep(1)

        url = f"https://www.nseindia.com/api/option-chain-indices?symbol={symbol}"
        res = session.get(url, headers=HEADERS, timeout=10)

        if res.status_code == 429:
            logger.warning(f"Rate limited for {symbol}. Sleeping for 60 seconds.")
            time.sleep(60)
            return
        elif res.status_code != 200:
            logger.error(f"{symbol} fetch failed with status code {res.status_code}")
            return

        try:
            json_data = res.json()
        except Exception as e:
            logger.error(f"JSON parse failed for {symbol}: {e}")
            return

        expiry = json_data["records"]["expiryDates"][0]
        timestamp = datetime.now()
        all_data = [row for row in json_data["records"]["data"] if row.get("expiryDate") == expiry]
        all_data.sort(key=lambda x: x["strikePrice"])

        # Get the current market price
        underlying_value = json_data["records"].get("underlyingValue", 0)
        lower_index = next((i for i, row in enumerate(all_data) if row["strikePrice"] > underlying_value), len(all_data) // 2)

        below = all_data[max(0, lower_index - 15):lower_index]
        above = all_data[lower_index:lower_index + 15]
        selected_data = below + above

        records = [
            {
                "strikePrice": row["strikePrice"],
                "expiryDate": row["expiryDate"],
                "CE": row.get("CE"),
                "PE": row.get("PE")
            }
            for row in selected_data
        ]

        doc = {
            "symbol": symbol,
            "timestamp": timestamp,
            "expiryDate": expiry,
            "records": records
        }

        try:
            collection.insert_one(doc)
            logger.info(f"✅ Stored {symbol} data at {timestamp}")
        except pymongo.errors.DuplicateKeyError:
            logger.warning(f"Duplicate entry for {symbol} at {timestamp}, skipping.")

    except Exception as e:
        logger.error(f"Unexpected error fetching {symbol}: {e}")


# Commented  by mayur : 28/05/25 for getting a call from scheduler   
# if __name__ == "__main__":
#     try:
#         while True:
#             for sym in SYMBOLS:
#                 fetch_and_store(sym)
#             time.sleep(30)
#     except KeyboardInterrupt:
#         logger.info("🛑 Stopped by user.")


# added by mayur : 28/05/25 for getting a call from scheduler      

  

def main():
    for sym in SYMBOLS:
        fetch_and_store(sym)

if __name__ == "__main__":
    try:
        while True:
            main()
            time.sleep(30)
    except KeyboardInterrupt:
        logger.info("🛑 Stopped by user.")
