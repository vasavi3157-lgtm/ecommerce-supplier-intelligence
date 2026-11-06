import pandas as pd


# Load datasets
orders = pd.read_csv("data/olist_orders_dataset.csv")
order_items = pd.read_csv("data/olist_order_items_dataset.csv")


# Convert date columns
orders["order_delivered_customer_date"] = pd.to_datetime(
    orders["order_delivered_customer_date"]
)

orders["order_estimated_delivery_date"] = pd.to_datetime(
    orders["order_estimated_delivery_date"]
)


# Keep only delivered orders
delivered_orders = orders[
    orders["order_delivered_customer_date"].notna()
].copy()


# Create delay target
delivered_orders["delay"] = (
    delivered_orders["order_delivered_customer_date"]
    > delivered_orders["order_estimated_delivery_date"]
).astype(int)


# Merge with order items
delay_data = delivered_orders.merge(
    order_items,
    on="order_id",
    how="left"
)


# Select useful columns
delay_data = delay_data[
    [
        "order_id",
        "seller_id",
        "product_id",
        "price",
        "freight_value",
        "delay"
    ]
]


# Check the target distribution
print("\nDelay distribution:")
print(delay_data["delay"].value_counts())

print("\nDelay percentage:")
print(delay_data["delay"].value_counts(normalize=True) * 100)


# Save dataset
delay_data.to_csv(
    "data/delay_ml_dataset.csv",
    index=False
)


print("\nDelay ML dataset created successfully!")
print("Rows:", len(delay_data))
print("Columns:", delay_data.columns.tolist())