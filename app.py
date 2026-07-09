from flask import Flask, request, jsonify
from flask_cors import CORS

from brain import ask
from speech import listen

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "🤖 Jarvis Backend Running!"


@app.route("/chat", methods=["POST"])
def chat():

    data = request.json

    message = data.get("message", "")

    if message.strip() == "":
        return jsonify({
            "reply": "Please enter a message."
        })

    reply = ask(message)

    return jsonify({
        "reply": reply
    })


@app.route("/listen", methods=["POST"])
def speech_to_text():

    try:

        print("🎤 Listening...")

        text = listen()

        print("You said:", text)

        return jsonify({
            "success": True,
            "text": text
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True,
        use_reloader=False

    )