import subprocess
import os

MODEL = "voices/en_US-ryan-medium.onnx"

def speak(text):
    with open("temp.txt", "w") as f:
        f.write(text)

    subprocess.run([
        "piper",
        "--model", MODEL,
        "--input-file", "temp.txt",
        "--output-file", "temp.wav"
    ])

    subprocess.run(["afplay", "temp.wav"])

    os.remove("temp.txt")
    os.remove("temp.wav")