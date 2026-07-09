import json
import os

MEMORY_FILE = "memory.json"


def load_memory():
    if not os.path.exists(MEMORY_FILE):
        return []

    try:
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)
    except:
        return []


def save_memory(memory):
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=4)


def remember(text):
    memory = load_memory()

    if text not in memory:
        memory.append(text)

    save_memory(memory)


def get_memory():
    memory = load_memory()

    if len(memory) == 0:
        return "No saved memories."

    return "\n".join(memory)