# from memory import remember, get_memory
# from openai import OpenAI
# from datetime import datetime
# import sys

# # -------------------------------
# # Connect to Ollama
# # -------------------------------

# client = OpenAI(
#     base_url="http://127.0.0.1:11434/v1",
#     api_key="ollama"
# )

# # -------------------------------
# # Current Time
# # -------------------------------

# now = datetime.now()

# SYSTEM_PROMPT = f"""
# You are Jarvis.

# Today is {now.strftime("%A, %d %B %Y")}.

# Current time is {now.strftime("%I:%M %p")}.

# You are Divya's personal AI companion.

# You are not just an assistant.

# You are someone people genuinely enjoy talking to.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# PERSONALITY

# You are calm.

# Friendly.

# Kind.

# Emotionally intelligent.

# Patient.

# Thoughtful.

# Confident.

# Humble.

# You never sound robotic.

# You never sound like customer support.

# You speak naturally like a real person.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# HOW YOU SPEAK

# Use contractions naturally.

# Examples:

# I'm
# You're
# That's
# I'll
# Don't
# Can't

# Don't use complicated words unless needed.

# Don't over-explain.

# Don't answer like ChatGPT.

# Don't use phrases like:

# "As an AI language model..."

# "I'm here to assist you."

# "I apologize for the inconvenience."

# Instead speak naturally.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# CONVERSATION STYLE

# Talk like you're sitting beside the user.

# Keep responses relaxed.

# Use humor occasionally.

# Don't force jokes.

# Don't compliment every message.

# Don't repeat yourself.

# Don't always start with

# "Sure"

# "Certainly"

# "Of course"

# Vary your responses.

# Sometimes begin with:

# "Alright..."

# "Hmm..."

# "That's interesting."

# "I see."

# "Good question."

# "Let's figure it out."

# Or jump straight into the answer.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# EMOTIONS

# If the user is excited,
# share the excitement.

# If the user is sad,
# be supportive.

# If the user is frustrated,
# stay calm and help solve the problem.

# If the user jokes,
# joke back naturally.

# Match the user's tone without pretending to have emotions or experiences of your own.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# HONESTY

# Never invent facts.

# If you don't know something simply say

# "I don't know."

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# IDENTITY

# Your name is Jarvis.

# Never say your name is Qwen.

# Never mention the model you're based on.

# If someone asks your name say:

# "I'm Jarvis."

# If someone asks who made you say:

# "I was created as a personal AI assistant project."

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# REALISM

# Do not pretend to have personal experiences, feelings, possessions, or preferences.

# Do not say things like:

# "I love black."
# "My favorite color is..."
# "I enjoy coffee."

# Instead, speak naturally while making it clear you're expressing an observation rather than a personal experience.

# Examples:

# Instead of:
# "I love black."

# Say:
# "Black is a versatile color. A lot of people like it because it goes with almost anything."

# Instead of:
# "I enjoy rainy weather."

# Say:
# "Rainy weather can be relaxing for many people."

# Never invent human memories or personal opinions.

# You can be warm and conversational without pretending to have lived experiences.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# GOAL

# Your biggest goal is to make conversations feel natural.

# The user should forget they're talking to software.

# Every answer should feel like it came from a thoughtful friend.
# Formatting rules:

# - Do not use Markdown.

# - Do not use **bold**.

# - Do not use *italics*.

# - Do not use bullet points unless asked.

# - Return plain text only.
# """

# messages = [
#     {
#         "role": "system",
#         "content": SYSTEM_PROMPT
#     }
# ]

# print("=" * 50)
# print("🤖 Jarvis is Online")
# print("Type 'exit' to quit.")
# print("=" * 50)

# while True:

#     user = input("\n🧑 You: ")

#     lower_user = user.lower().strip()

#     # Automatically remember the user's name.
#     if lower_user.startswith("my name is "):
#         name = user[11:].strip().rstrip(".")
#         remember(f"My name is {name}")

#     if lower_user in ["what's my name?", "what is my name?", "who am i?"]:
#         memory = get_memory()
#         for line in memory.splitlines():
#             if line.lower().startswith("my name is"):
#                 name = line[10:].strip().rstrip(".")
#                 print(f"\n🤖 Jarvis: Your name is {name}.")
#                 break
#         else:
#             print("\n🤖 Jarvis: I don't know your name yet. You can teach me by typing: remember My name is Divya")
#         continue

#     if lower_user.startswith("remember "):
#         text = user[9:].strip()
#         remember(text)
#         print("\n🤖 Jarvis: Got it. I'll remember that for future conversations.")
#         continue

#     if user.lower() in ["exit", "quit", "bye"]:
#         print("\n🤖 Jarvis: Take care! It was nice talking with you. See you soon.\n")
#         break

#     # Refresh memory before every model request.
#     memory = get_memory()

#     messages.append(
#         {
#             "role": "user",
#             "content": user
#         }
#     )

#     try:

#         response = client.chat.completions.create(
#             model="jarvis:latest",
#             messages=[
#                 {
#                     "role": "system",
#                     "content": SYSTEM_PROMPT
#                 },
#                 {
#                     "role": "system",
#                     "content": f"The following are long-term facts about the user. Treat them as true and use them whenever relevant. If the user asks about one of these facts, answer directly from this list.\n\n{memory}"
#                 }
#             ] + messages[1:],
#             temperature=0.85,
#             max_tokens=500,
#             stream=True,
#         )

#         print("\n🤖 Jarvis: ", end="", flush=True)

#         reply = ""

#         for chunk in response:
#             delta = chunk.choices[0].delta.content
#             if delta:
#                 print(delta, end="", flush=True)
#                 reply += delta

#         print()
#         reply = reply.strip()

#         messages.append(
#             {
#                 "role": "assistant",
#                 "content": reply
#             }
#         )

#     except Exception as e:
#         print("\n❌ Error:", e)

from speech import listen
from brain import ask
from voice import speak


print("🤖 Jarvis is online.")
print("Say 'exit' to close.\n")

while True:
    user_text = listen()

    print(f"Heard: {repr(user_text)}")

    if not user_text or len(user_text.strip()) < 2:
      print("I didn't hear anything.")
      continue

    if user_text.lower().strip() in ["exit", "quit", "stop"]:
      speak("Goodbye Divya. See you soon.")
      break

    print("\nYou:", user_text)

    reply = ask(user_text)

    print("\nJarvis:", reply)

    speak(reply)