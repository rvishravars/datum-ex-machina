import os
import importlib.util
from .base import BaseStory


def load_stories():
    """
    Dynamically discovers and instantiates all Story classes in the stories/ directory.
    """
    stories = {}
    stories_dir = os.path.dirname(__file__)

    for item in os.listdir(stories_dir):
        if item.startswith("__") or item == "base.py" or item == "registry.py":
            continue

        item_path = os.path.join(stories_dir, item)
        if os.path.isdir(item_path):
            story_file = os.path.join(item_path, "story.py")
            if os.path.exists(story_file):
                try:
                    # Dynamically import the module
                    module_name = f"stories.{item}.story"
                    spec = importlib.util.spec_from_file_location(
                        module_name, story_file
                    )
                    if spec is None or spec.loader is None:
                        continue
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)

                    # Find the subclass of BaseStory in the module
                    for attr_name in dir(module):
                        attr = getattr(module, attr_name)
                        if (
                            isinstance(attr, type)
                            and issubclass(attr, BaseStory)
                            and attr is not BaseStory
                        ):
                            story_instance = attr()
                            stories[story_instance.id] = story_instance
                except Exception as e:
                    print(f"FAILED TO LOAD STORY [{item}]: {e}")

    return stories


# Global registry instance with safe loading
try:
    STORY_REGISTRY = load_stories()
except Exception as e:
    print(f"CRITICAL ERROR IN STORY REGISTRY: {e}")
    STORY_REGISTRY = {}


def get_all_stories():
    return list(STORY_REGISTRY.values())


def get_story(story_id):
    return STORY_REGISTRY.get(story_id)
