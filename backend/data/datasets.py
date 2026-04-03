"""
Built-in curated dataset registry.
Now dynamically loaded from the stories module.
"""

from stories.registry import get_all_stories

# The lists are now dynamically populated from the stories module
# We preserve the name DATASETS to keep the API stable
DATASETS = [story.to_dict() for story in get_all_stories()]
