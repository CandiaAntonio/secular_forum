import sys
from pathlib import Path
import json

# Add backend to sys.path to resolve imports
backend_path = Path(r"c:\1 Projects\secular_forum\secular_forum\backend")
sys.path.append(str(backend_path))

from app.services import DataLoader

try:
    nodes = DataLoader.get_narrative_river_data()
    print(f"Total Nodes: {len(nodes)}")
    
    # Check Base Case lineage
    base_nodes = [n for n in nodes if n.type == 'base']
    base_nodes.sort(key=lambda x: x.year)
    
    print("-" * 20)
    print("BASE CASE SPINE (Year -> Name):")
    for n in base_nodes:
        print(f"{n.year}: {n.name}")
        
    print("-" * 20)
    print("Example 2024 Theme Nodes:")
    themes_2024 = [n for n in nodes if n.year == 2024 and n.type != 'base']
    for n in themes_2024:
        print(f"- {n.name} (Rank {n.rank})")

except Exception as e:
    print(f"Error: {e}")
