import pandas as pd

orders = pd.read_csv("data/olist_orders_dataset.csv")
order_items = pd.read_csv("data/olist_order_items_dataset.csv")

print("Orders:", len(orders))
print("Order Items:", len(order_items))

# Connect orders with suppliers
supplier_orders = order_items.merge(
    orders,
    on="order_id",
    how="left"
)

print("\nSupplier Orders:")
print(supplier_orders[[
    "order_id",
    "seller_id",
    "product_id",
    "order_status",
    "order_purchase_timestamp",
    "order_delivered_customer_date",
    "order_estimated_delivery_date"
]].head())
# Convert delivery columns to datetime
supplier_orders["order_delivered_customer_date"] = pd.to_datetime(
    supplier_orders["order_delivered_customer_date"]
)

supplier_orders["order_estimated_delivery_date"] = pd.to_datetime(
    supplier_orders["order_estimated_delivery_date"]
)

# Keep only orders that were actually delivered
delivered_orders = supplier_orders[
    supplier_orders["order_delivered_customer_date"].notna()
].copy()

# Check whether each order was delivered on time
delivered_orders["on_time"] = (
    delivered_orders["order_delivered_customer_date"]
    <= delivered_orders["order_estimated_delivery_date"]
)

print("\nDelivery Analysis:")
print(delivered_orders[[
    "seller_id",
    "order_delivered_customer_date",
    "order_estimated_delivery_date",
    "on_time"
]].head())

# Calculate on-time delivery rate for each supplier
supplier_delivery = (
    delivered_orders
    .groupby("seller_id")["on_time"]
    .mean()
    .reset_index()
)

supplier_delivery["on_time_delivery_rate"] = (
    supplier_delivery["on_time"] * 100
)

supplier_delivery = supplier_delivery.drop(columns=["on_time"])

print("\nSupplier Delivery Performance:")
print(supplier_delivery.head(10))

# Load review data
reviews = pd.read_csv("data/olist_order_reviews_dataset.csv")

# Connect reviews to supplier orders
supplier_reviews = supplier_orders.merge(
    reviews[["order_id", "review_score"]],
    on="order_id",
    how="left"
)

# Calculate average rating for each supplier
supplier_rating = (
    supplier_reviews
    .groupby("seller_id")["review_score"]
    .mean()
    .reset_index()
)

supplier_rating = supplier_rating.rename(
    columns={"review_score": "average_rating"}
)

print("\nSupplier Rating:")
print(supplier_rating.head(10))

# Calculate total number of orders handled by each supplier
supplier_order_count = (
    supplier_orders
    .groupby("seller_id")["order_id"]
    .nunique()
    .reset_index()
)

supplier_order_count = supplier_order_count.rename(
    columns={"order_id": "total_orders"}
)

print("\nSupplier Order Count:")
print(supplier_order_count.head(10))

# Combine supplier metrics
supplier_metrics = supplier_delivery.merge(
    supplier_rating,
    on="seller_id",
    how="left"
)

supplier_metrics = supplier_metrics.merge(
    supplier_order_count,
    on="seller_id",
    how="left"
)

# Convert average rating from 1-5 to 0-100
supplier_metrics["rating_score"] = (
    supplier_metrics["average_rating"] / 5
) * 100

# Normalize order volume to 0-100
max_orders = supplier_metrics["total_orders"].max()

supplier_metrics["order_volume_score"] = (
    supplier_metrics["total_orders"] / max_orders
) * 100

# Calculate Supplier Trust Score
supplier_metrics["trust_score"] = (
    supplier_metrics["on_time_delivery_rate"] * 0.50
    + supplier_metrics["rating_score"] * 0.30
    + supplier_metrics["order_volume_score"] * 0.20
)

print("\nFinal Supplier Trust Score:")
print(
    supplier_metrics[
        [
            "seller_id",
            "on_time_delivery_rate",
            "average_rating",
            "total_orders",
            "trust_score"
        ]
    ].head(10)
)
# Save supplier intelligence data
supplier_metrics.to_csv(
    "data/supplier_intelligence.csv",
    index=False
)

print("\nSupplier intelligence data saved successfully!")