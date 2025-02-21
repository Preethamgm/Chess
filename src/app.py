from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/ai-move', methods=['POST'])
def ai_move():
    # In a real application, you would extract the board state or move history from the request
    data = request.get_json()
    
    # Simulated AI processing (this is just a dummy response)
    # For example, pretend that the AI always returns "e2e4" as the move.
    dummy_move = {
        "move": "e2e4",
        "evaluation": 0.5,
        "message": "This is a dummy AI move."
    }
    
    return jsonify(dummy_move)

if __name__ == '__main__':
    app.run(debug=True)
