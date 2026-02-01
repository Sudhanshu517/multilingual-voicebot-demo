import pandas as pd
import math

FILE_PATH = "mock_invoice_dataset_fixed_dates.xlsx"

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two lat/long points in KM
    """
    R = 6371  # Earth radius in KM

    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2) ** 2 + \
        math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def get_nearest_station(driver_id: str) -> str:
    df = pd.read_excel(FILE_PATH)

    driver_data = df[df["driver_id"] == driver_id]
    if driver_data.empty:
        return f"No location data found for driver {driver_id}."

    driver_row = driver_data.iloc[0]
    driver_lat = 26.421418
    driver_lon = 80.402548
    
    nearest_station = None
    min_distance = float("inf")

    for _, row in df.iterrows():
        station_lat = row["latitude"]
        station_lon = row["longitude"]

        distance = haversine_distance(
            driver_lat, driver_lon, station_lat, station_lon
        )

        if distance < min_distance:
            min_distance = distance
            nearest_station = row["nearest_DSK_for_activation"]

    return (
        f"Nearest Battery Smart Station for Driver {driver_id}:\n"
        f"- DSK ID: {nearest_station}\n"
        f"- Distance: {round(min_distance, 2)} km\n"
        f"आप इस station पर जाकर battery swap कर सकते हैं।"
    )


# Example usage:
# print(get_nearest_station("DRV0001"))
