import pandas as pd
from pathlib import Path
from typing import List
from .models import Outlook

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
