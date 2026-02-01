import pandas as pd

FILE_PATH = "mock_invoice_dataset_fixed_dates.xlsx"

def get_leave_and_activation_info(driver_id: str) -> str:
    df = pd.read_excel(FILE_PATH)

    data = df[df["driver_id"] == driver_id]
    if data.empty:
        return f"No leave or activation info found for driver {driver_id}."

    row = data.iloc[0]

    return (
        f"Leave & Activation Info for Driver {driver_id}:\n"
        f"- Leave status: {row['leave_info']}\n"
        f"- Leave penalty applied: ₹{row['LP']}\n"
        f"- Nearest DSK for activation: {row['nearest_DSK_for_activation']}\n"
        f"Activation ke liye isi DSK par visit karein."
    )

# Example
# print(get_leave_and_activation_info("DRV0001"))
