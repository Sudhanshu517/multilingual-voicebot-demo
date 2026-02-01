import pandas as pd

FILE_PATH = "mock_invoice_dataset_fixed_dates.xlsx"

def get_swap_invoice_summary(driver_id: str) -> str:
    df = pd.read_excel(FILE_PATH)

    data = df[df["driver_id"] == driver_id]
    if data.empty:
        return f"No swap or invoice data found for driver {driver_id}."

    row = data.iloc[0]

    total_swaps = row["N_b"] + row["N_s"]
    swap_cost = (row["N_b"] * row["P_b"]) + (row["N_s"] * row["P_s"])
    service_charge = total_swaps * row["SC"]
    penalty = row["LP"]
    penalty_recovered = row["LP_rec"]

    total_invoice = swap_cost + service_charge + penalty - penalty_recovered

    return (
        f"Invoice Summary for Driver {driver_id}:\n"
        f"- Total swaps: {total_swaps} (Base: {row['N_b']}, Secondary: {row['N_s']})\n"
        f"- Swap cost: ₹{swap_cost}\n"
        f"- Service charges: ₹{service_charge}\n"
        f"- Leave penalty: ₹{penalty}\n"
        f"- Penalty recovered: ₹{penalty_recovered}\n"
        f"➡️ Total payable amount: ₹{total_invoice}"
    )

# Example
# print(get_swap_invoice_summary("DRV0001"))
