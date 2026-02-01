from swap import get_swap_invoice_summary
from near import get_nearest_station
from subs import get_subscription_details
from leave import get_leave_and_activation_info


def main():
    print("\n=== Tier-1 Driver Voicebot Resolver ===\n")

    driver_id = input("Enter Driver ID (e.g. DRV0001): ").strip()

    print("\nChoose query to resolve:")
    print("1. Swap history & Invoice explanation")
    print("2. Nearest Battery Smart Station")
    print("3. Subscription & Pricing details")
    print("4. Leave information & Activation DSK")

    choice = input("\nEnter option (1-4): ").strip()

    print("\n--- Response ---\n")

    if choice == "1":
        response = get_swap_invoice_summary(driver_id)

    elif choice == "2":
        response = get_nearest_station(driver_id)

    elif choice == "3":
        response = get_subscription_details(driver_id)

    elif choice == "4":
        response = get_leave_and_activation_info(driver_id)

    else:
        response = "Invalid option selected. Please try again."

    print(response)
    print("\n----------------\n")


if __name__ == "__main__":
    main()
