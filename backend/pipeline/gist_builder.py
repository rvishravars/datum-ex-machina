import os
import json
import httpx
from typing import Dict


def build_ipynb_from_py(source_code: str, dependencies: list = None, class_name: str = None) -> Dict:
    cells = []

    deps_str = " ".join(dependencies) if dependencies else ""
    pip_cmd = f"!pip install -q {deps_str}\n" if deps_str else ""

    # 1. Setup Cell to ensure Colab has access to core abstractions
    setup_code = f"""# Run this cell first to ensure dependencies are loaded into the cloud environment
{pip_cmd}!mkdir -p stories
!wget -qO stories/__init__.py https://raw.githubusercontent.com/rvishravars/datum-ex-machina/main/backend/stories/__init__.py
!wget -qO stories/base.py https://raw.githubusercontent.com/rvishravars/datum-ex-machina/main/backend/stories/base.py
print('Datum Ex Machina dependencies loaded!')"""

    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" for line in setup_code.split("\n")]
    })

    # 2. Parse the python script into discrete cells using # %% markers
    chunks = source_code.split("# %%")
    for chunk in chunks:
        if not chunk.strip():
            continue
        # Check if the chunk seems like pure markdown meant for Colab text cells
        if chunk.strip().lower().startswith("markdown") or chunk.strip().lower().startswith("md"):
            # Clean up the marker
            lines = chunk.strip().split("\n")[1:]
            cells.append({
                "cell_type": "markdown",
                "metadata": {},
                "source": [line + "\n" for line in lines]
            })
        else:
            lines = chunk.strip("\r\n").split("\n")
            # If the `# %%` marker had text right after it, turn it back into a valid python comment
            if lines and lines[0].strip() and not lines[0].lstrip().startswith("#"):
                lines[0] = "# " + lines[0].strip()

            cells.append({
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [line + "\n" for line in lines]
            })

    if class_name:
        execution_code = f"""# %% Execute and Visualize
import pandas as pd
import matplotlib.pyplot as plt

# Instantiate the story
story = {class_name}()
data = story.load_data()
df = pd.DataFrame(data)

# Basic Visualization
plt.figure(figsize=(10, 6))
if 'y2' in df.columns:
    plt.plot(df['x'], df['y'], marker='o', label=getattr(story, 'y_label', 'Y'))
    plt.plot(df['x'], df['y2'], marker='s', label='Secondary')
else:
    plt.plot(df['x'], df['y'], marker='o', color='purple', label=getattr(story, 'y_label', 'Y'))

plt.title(getattr(story, 'title', 'Dataset Visualization'))
plt.xlabel(getattr(story, 'x_label', 'X'))
plt.ylabel(getattr(story, 'unit', 'Value'))
plt.grid(True, linestyle='--', alpha=0.7)
plt.legend()
plt.show()"""

        cells.append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [line + "\n" for line in execution_code.split("\n")]
        })

    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }


async def deploy_to_gist(filename: str, source_code: str, dependencies: list = None, class_name: str = None) -> str:
    """Returns the Colab URL linked to the dynamically created Secret Gist."""
    token = os.getenv("GITHUB_API_TOKEN")
    if not token:
        raise ValueError("GITHUB_API_TOKEN is not configured. Cannot coordinate Cloud Deployments.")

    ipynb_data = build_ipynb_from_py(source_code, dependencies, class_name)
    gist_filename = filename.replace(".py", ".ipynb")

    payload = {
        "description": f"Datum Ex Machina Cloud Deployment -> {gist_filename}",
        "public": False,  # Keep it unlisted
        "files": {
            gist_filename: {
                "content": json.dumps(ipynb_data, indent=2)
            }
        }
    }

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    async with httpx.AsyncClient() as client:
        res = await client.post("https://api.github.com/gists", json=payload, headers=headers)
        if res.status_code != 201:
            raise Exception(f"GitHub API Error: {res.text}")

    data = res.json()
    gist_id = data["id"]
    owner_login = data.get("owner", {}).get("login", "anonymous")
    # Provide the deep link to Colab utilizing the gist owner mechanism
    return f"https://colab.research.google.com/gist/{owner_login}/{gist_id}"
