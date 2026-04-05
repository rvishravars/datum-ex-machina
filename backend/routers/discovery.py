from fastapi import APIRouter
import json
import os

router = APIRouter()

INDEX_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "index", "metadata_index.json")

def build_stats_nz_tree(tables):
    """
    Builds a hierarchical tree for Stats NZ: Theme -> Subject -> Table
    """
    themes_dict = {}
    for table in tables:
        theme = table.get("theme", "General Statistics")
        subject = table.get("subject", "Uncategorized")
        
        if theme not in themes_dict:
            themes_dict[theme] = {"name": theme, "children_dict": {}}
        
        if subject not in themes_dict[theme]["children_dict"]:
            themes_dict[theme]["children_dict"][subject] = {"name": subject, "children": []}
            
        themes_dict[theme]["children_dict"][subject]["children"].append({
            "name": table.get("title", "Unknown Table"),
            "id": table.get("id"),
            "value": 1,
            "type": "table"
        })
    
    # Convert themes and subjects to lists for D3
    theme_list = []
    for theme_name, theme_data in themes_dict.items():
        subject_list = []
        for subject_name, subject_data in theme_data["children_dict"].items():
            subject_list.append(subject_data)
        
        theme_list.append({
            "name": theme_name,
            "children": subject_list
        })
        
    return {"name": "Stats NZ", "children": theme_list}

def build_data_govt_tree(packages):
    """
    Builds a hierarchical tree for Data.govt: Organization -> Dataset
    """
    orgs_dict = {}
    for pkg in packages:
        org = pkg.get("organization", "Unknown Dept")
        
        if org not in orgs_dict:
            orgs_dict[org] = {"name": org, "children": []}
            
        orgs_dict[org]["children"].append({
            "name": pkg.get("title", "Unknown Dataset"),
            "id": pkg.get("id"),
            "value": 1,
            "type": "dataset",
            "url": pkg.get("url")
        })
    
    return {"name": "Government Catalog", "children": list(orgs_dict.values())}

@router.get("/discovery/tree")
def get_discovery_tree():
    """
    Returns the full hierarchical 'Information Tree' for the Evidence Horizon.
    """
    if not os.path.exists(INDEX_PATH):
        return {"error": "Index not found."}
    
    with open(INDEX_PATH, "r") as f:
        index = json.load(f)
        
    return {
        "last_updated": index.get("last_updated"),
        "total_datasets": len(index.get("data_govt_packages", [])) + len(index.get("stats_nz_tables", [])),
        "root": {
            "name": "Aotearoa Horizon",
            "children": [
                build_stats_nz_tree(index.get("stats_nz_tables", [])),
                build_data_govt_tree(index.get("data_govt_packages", []))
            ]
        }
    }
