import pandas as pd

# Load datasets
orders = pd.read_csv("data/olist_orders_dataset.csv")
order_items = pd.read_csv("data/olist_order_items_dataset.csv")
products = pd.read_csv("data/olist_products_dataset.csv")

# Convert date columns
orders["order_purchase_timestamp"] = pd.to_datetime(
    orders["order_purchase_timestamp"]
)

orders["order_delivered_customer_date"] = pd.to_datetime(
    orders["order_delivered_customer_date"]
)

order_items["shipping_limit_date"] = pd.to_datetime(
    order_items["shipping_limit_date"]
)

# Keep only delivered orders
delivered_orders = orders[
    orders["order_delivered_customer_date"].notna()
].copy()

# Calculate actual delivery time
delivered_orders["delivery_time_days"] = (
    delivered_orders["order_delivered_customer_date"]
    - delivered_orders["order_purchase_timestamp"]
).dt.total_seconds() / (24 * 60 * 60)

# Calculate shipping time allowed
# order_items["shipping_limit_days"] = (
#     order_items["shipping_limit_date"]
#     - order_items["shipping_limit_date"].dt.normalize()
# ).dt.total_seconds() / (24 * 60 * 60)

# Merge orders with order items
delivery_data = delivered_orders.merge(
    order_items,
    on="order_id",
    how="left"
)

# Merge product information
delivery_data = delivery_data.merge(
    products,
    on="product_id",
    how="left"
)

# Select useful columns
delivery_data = delivery_data[
    [
        "order_id",
        "seller_id",
        "product_id",
        "price",
        "freight_value",
        "product_category_name",
        "product_weight_g",
        "product_length_cm",
        "product_height_cm",
        "product_width_cm",
        "product_photos_qty",
        "delivery_time_days"
    ]
]

# Check missing values
print("\nMissing values:")
print(delivery_data.isnull().sum())
# Handle missing values

# Missing category → unknown
delivery_data["product_category_name"] = (
    delivery_data["product_category_name"].fillna("unknown")
)

# Missing numerical values → median
numeric_columns = [
    "product_weight_g",
    "product_length_cm",
    "product_height_cm",
    "product_width_cm",
    "product_photos_qty"
]

for column in numeric_columns:
    delivery_data[column] = delivery_data[column].fillna(
        delivery_data[column].median()
    )

print("\nMissing values after cleaning:")
print(delivery_data.isnull().sum())

# Save dataset
delivery_data.to_csv(
    "data/delivery_ml_dataset.csv",
    index=False
)

print("\nDelivery ML dataset created successfully!")
print("Rows:", len(delivery_data))
print("\nColumns:")
print(delivery_data.columns.tolist())