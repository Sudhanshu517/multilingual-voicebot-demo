import pandas as pd

FILE_PATH = "mock_invoice_dataset_fixed_dates.xlsx"

def get_subscription_details(driver_id: str) -> str:
    df = pd.read_excel(FILE_PATH)

    data = df[df["driver_id"] == driver_id]
    if data.empty:
        return f"No subscription found for driver {driver_id}."

    row = data.iloc[0]

    return (
        f"Subscription Details for Driver {driver_id}:\n"
        f"- Plan: {row['subscription_plan']}\n"
        f"- Valid from {row['plan_start_date']} to {row['plan_end_date']}\n"
        f"- Renewals done: {row['renewals']}\n"
        f"- Pricing status: {row['pricing_clarification']}\n"
        f"अगर pricing unclear है, तो agent आपकी मदद कर सकता है।"
    )

# Example
# print(get_subscription_details("DRV0001"))
