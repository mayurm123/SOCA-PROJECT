import os
import time
import logging
from datetime import datetime
from dotenv import load_dotenv
import pymongo
from smartapi.smartconnect import SmartConnect

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
ANGEL_API_KEY = os.getenv("ANGEL_API_KEY")
ANGEL_CLIENT_ID = os.getenv("ANGEL_CLIENT_ID")
ANGEL_PASSWORD = os.getenv("ANGEL_PASSWORD")
ANGEL_API_SECRET = os.getenv("ANGEL_API_SECRET")
ANGEL_OTP = os.getenv("ANGEL_OTP")

# Mongo setup
client = pymongo.MongoClient(MONGO_URI)
db = client["soca"]
collection = db["option_chain3"]
collection.create_index(
    [("symbol", pymongo.ASCENDING), ("timestamp", pymongo.ASCENDING)],
    unique=True
)

# Angel One API setup
def get_smart_api():
    obj = SmartConnect(api_key=ANGEL_API_KEY)
    data = obj.generateSession(ANGEL_CLIENT_ID, ANGEL_PASSWORD, ANGEL_OTP, ANGEL_API_SECRET)
    return obj

smart_api = get_smart_api()
master_contract = smart_api.getMasterContract("NFO")["data"]

# Get latest expiry per symbol
def get_latest_expiry(symbol):
    expiries = sorted({c["expiry"] for c in master_contract if c["symbol"] == symbol})
    return expiries[0] if expiries else None

def fetch_and_store(symbol):
    try:
        expiry = get_latest_expiry(symbol)
        if not expiry:
            logger.warning(f"No expiry available for {symbol}")
            return

        contracts = [
            c for c in master_contract
            if c["symbol"] == symbol and c["expiry"] == expiry and c["instrumenttype"] == "OPTIDX"
        ]

        contracts.sort(key=lambda x: x["strike"])
        cmp = contracts[len(contracts)//2]["strike"] if contracts else 0
        lower = [c for c in contracts if c["strike"] < cmp][-15:]
        upper = [c for c in contracts if c["strike"] >= cmp][:15]
        selected = lower + upper

        records_dict = {}
        for row in selected:
            try:
                ltp = smart_api.ltpData(exchange="NFO", tradingsymbol=row["tradingsymbol"], symboltoken=row["token"])
                strike = row["strike"]
                if strike not in records_dict:
                    records_dict[strike] = {
                        "strikePrice": strike,
                        "expiryDate": row["expiry"]
                    }
                records_dict[strike][row["optiontype"]] = {
                    "ltp": ltp["data"]["ltp"],
                    "tradingsymbol": row["tradingsymbol"]
                }
                time.sleep(0.2)
            except Exception as e:
                logger.warning(f"Failed to fetch {row['tradingsymbol']}: {e}")

        timestamp = datetime.now()
        doc = {
            "symbol": symbol,
            "timestamp": timestamp,
            "expiryDate": expiry,
            "records": list(records_dict.values())
        }

        try:
            collection.insert_one(doc)
            logger.info(f"✅ Stored {symbol} data at {timestamp}")
        except pymongo.errors.DuplicateKeyError:
            logger.warning(f"Duplicate entry for {symbol} at {timestamp}, skipping.")

    except Exception as e:
        logger.error(f"Unexpected error fetching {symbol}: {e}")


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