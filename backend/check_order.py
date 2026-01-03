import pandas as pd
import os

file_path = r"c:\1 Projects\secular_forum\secular_forum\data\Bloomberg_Outlooks_2019_2026_Desagregado 1.xlsx"

df = pd.read_excel(file_path)

# Check the raw order of themes for 2024 to see if it implies a ranking
year = 2024
print(f"--- Raw Theme Order {year} (First 50 unique) ---")
df_year = df[df['Year'] == year]
seen_themes = set()
ordered_themes = []
for theme in df_year['Theme']:
    t = str(theme).strip().upper()
    if t not in seen_themes:
        ordered_themes.append(t)
        seen_themes.add(t)

print(ordered_themes[:10])

print("-" * 20)
print("Previous Logic vs New Logic Check")
# Previous logic sorted by min(Rank)
theme_min_ranks = df_year.groupby('Theme')['Rank'].min().sort_values().head(10)
print("Sort by Min(Rank) result:\n", theme_min_ranks)
