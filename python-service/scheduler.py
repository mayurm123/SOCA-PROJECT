import schedule
import time
from datetime import datetime
import fetch_data

def run_services():
    print(f"Running services at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    fetch_data.main()      # Assuming fetchdata.py has a main() function
    

# # Schedule the jobs
schedule.every().day.at("18:30").do(run_services)
schedule.every().day.at("19:40").do(run_services)

print("Scheduler started. Waiting for scheduled times...")
while True:
    schedule.run_pending()
    time.sleep(30)  # Check every 30 seconds
