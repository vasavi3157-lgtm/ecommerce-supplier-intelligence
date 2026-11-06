import pandas as pd
import os

data_path = "data"

files = [
    "olist_orders_dataset.csv",
    "olist_order_items_dataset.csv",
    "olist_sellers_dataset.csv",
    "olist_order_reviews_dataset.csv",
    "olist_products_dataset.csv"
]

for file in files:
    path = os.path.join(data_path, file)

    df = pd.read_csv(path)

    print("\n" + "=" * 60)
    print("FILE:", file)
    print("=" * 60)

    print("Rows:", len(df))
    print("Columns:", len(df.columns))

    print("\nColumn names:")
    print(df.columns.tolist())

    print("\nMissing values:")
    print(df.isnull().sum())