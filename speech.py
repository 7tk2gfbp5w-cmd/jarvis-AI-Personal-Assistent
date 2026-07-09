import os
import queue
import numpy as np
import sounddevice as sd
from scipy.io.wavfile import write
from faster_whisper import WhisperModel

print("Loading Whisper model...")

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

print("✅ Whisper model ready!")

SAMPLE_RATE = 16000
BLOCK_SIZE = 1024

SILENCE_THRESHOLD = 300
START_THRESHOLD = 500
MAX_SILENCE_BLOCKS = 15

audio_queue = queue.Queue()


def callback(indata, frames, time, status):
    if status:
        print(status)

    audio_queue.put(indata.copy())


def listen():

    print("\n🎤 Waiting for speech...")

    recorded = []

    speaking = False
    silence_blocks = 0

    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype="int16",
        blocksize=BLOCK_SIZE,
        callback=callback
    ):

        while True:

            data = audio_queue.get()

            volume = np.abs(data).mean()

            if not speaking:

                if volume > START_THRESHOLD:

                    print("🗣️ Speech detected.")

                    speaking = True

                    recorded.append(data)

            else:

                recorded.append(data)

                if volume < SILENCE_THRESHOLD:

                    silence_blocks += 1

                else:

                    silence_blocks = 0

                if silence_blocks > MAX_SILENCE_BLOCKS:

                    print("✅ Speech finished.")

                    break

    audio = np.concatenate(recorded, axis=0)

    filename = "temp.wav"

    write(filename, SAMPLE_RATE, audio)

    try:

        segments, info = model.transcribe(
            filename,
            language="en",
            beam_size=5,
            best_of=5,
            vad_filter=True,
            condition_on_previous_text=False,
            temperature=0
        )

        text = ""

        for segment in segments:
            text += segment.text.strip() + " "

    finally:

        if os.path.exists(filename):
            os.remove(filename)

    text = text.strip()

    print("📝 You said:", text)

    return text


if __name__ == "__main__":

    while True:

        text = listen()

        if text.lower() in ["exit", "quit", "stop"]:

            print("👋 Goodbye!")

            break