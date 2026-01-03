import pandas as pd
import os

file_path = r"../data/Bloomberg_Outlooks_2019_2026_Desagregado 1.xlsx"

try:
    df = pd.read_excel(file_path)
    print("Columns:", df.columns.tolist())
    print("\nFirst 3 rows:")
    print(df.head(3).to_string())
    print("\nData Types:")
    print(df.dtypes)
except Exception as e:
    print(f"Error reading excel: {e}")
