import pandas as pd
from pathlib import Path
from typing import List
from .models import Outlook, NarrativeNode

# Assuming run from 'backend' directory or root, we try to locate robustly
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_FILE = BASE_DIR / "data" / "Bloomberg_Outlooks_2019_2026_Desagregado 1.xlsx"

class DataLoader:
    _data: List[Outlook] = None

    @classmethod
    def load_data(cls) -> List[Outlook]:
        if cls._data is None:
            if not DATA_FILE.exists():
                raise FileNotFoundError(f"Data file not found at {DATA_FILE}")
            
            df = pd.read_excel(DATA_FILE)
            # Fill NaN with None or empty string to avoid validation errors
            df = df.where(pd.notnull(df), None)
            
            records = df.to_dict(orient="records")
            cls._data = [Outlook(**record) for record in records]
        return cls._data

    @classmethod
    def get_outlooks(cls) -> List[Outlook]:
        return cls.load_data()

    @classmethod
    def get_narrative_river_data(cls) -> List[NarrativeNode]:
        """
        Transforms the flat outlook data into nodes for the narrative river visualization.
        """
        outlooks = cls.load_data()
        if not outlooks:
            return []

        # Convert back to DataFrame for easier aggregation
        df = pd.DataFrame([o.model_dump() for o in outlooks])
        
        # Sanitize theme names
        df['Theme_Clean'] = df['Theme'].astype(str).str.strip().str.upper()
        df = df[df['Theme_Clean'] != 'NONE'] # Remove empty themes
        
        # Ensure Rank is numeric, coercing errors to a high number (low priority)
        df['Rank'] = pd.to_numeric(df['Rank'], errors='coerce').fillna(999)

        nodes = []
        
        # Process each year
        for year in sorted(df['Year'].dropna().unique().astype(int)):
            year_df = df[df['Year'] == year].copy()
            
            # 1. Identify BASE CASE
            # Methodology: "The BASE CASE theme exists in every year... Rank 1-5"
            # Strategy: Look for specific 'BASE CASE' theme OR Rank 1 if not explicit.
            
            base_case_df = year_df[year_df['Theme_Clean'].str.contains('BASE CASE', na=False)]
            
            # If no explicit 'BASE CASE' found, take the Rank 1 item
            if base_case_df.empty:
                 base_case_df = year_df[year_df['Rank'] == 1]
            
            # Get the top-ranked item for the Base Case properties
            if not base_case_df.empty:
                # Use the first one found in file order as the canonical Base Case for that year
                base_node_row = base_case_df.iloc[0]
                
                # Naming Logic: Use Sub_theme if available and descriptive, else "Global Outlook"
                base_name = base_node_row['Sub_theme']
                if not base_name or pd.isna(base_name) or str(base_name).strip() == '':
                    base_name = "Global Outlook"
                
                nodes.append(NarrativeNode(
                    id=f"{year}-base",
                    year=int(year),
                    name=str(base_name),
                    rank=0, # Base Case is always Rank 0
                    type='base'
                ))
            
            # 2. Identify Other Key Themes
            # Filter out the rows we just used for Base Case
            remaining_df = year_df.drop(base_case_df.index, errors='ignore')
            
            # Key Change: Use Order of Appearance as the implicit rank
            seen_themes = set()
            rank_counter = 1
            
            for _, row in remaining_df.iterrows():
                theme_name = row['Theme_Clean']
                
                # Skip if empty, short, or already seen
                if len(theme_name) < 2 or theme_name in seen_themes:
                    continue
                
                seen_themes.add(theme_name)
                
                # Formatting: Title Case
                display_name = theme_name.title()
                
                nodes.append(NarrativeNode(
                    id=f"{year}-{theme_name.lower().replace(' ', '-')}",
                    year=int(year),
                    name=display_name,
                    rank=rank_counter,
                    type='theme'
                ))
                
                rank_counter += 1
                
                # Limit to top 5 themes per year
                if rank_counter > 5:
                    break
                
        return nodes
