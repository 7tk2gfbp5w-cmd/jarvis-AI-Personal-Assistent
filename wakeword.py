import sounddevice as sd
import numpy as np
from openwakeword.model import Model

print("Loading wake word model...")

model = Model(inference_framework="onnx")

print("✅ Wake word model loaded.")

SAMPLE_RATE = 16000
CHUNK_SIZE = 1280


def wait_for_wake_word():
    print("😴 Waiting for wake word...")

    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype="int16",
        blocksize=CHUNK_SIZE,
    ) as stream:

        while True:
            audio, overflow = stream.read(CHUNK_SIZE)

            prediction = model.predict(audio.flatten())

            for wakeword, score in prediction.items():

                if score > 0.5:
                    print(f"✅ Wake word detected: {wakeword}")
                    return