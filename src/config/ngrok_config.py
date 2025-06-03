import os
from pyngrok import ngrok

# Get ngrok auth token from environment variable
NGROK_AUTH_TOKEN = os.getenv('NGROK_AUTH_TOKEN')

def setup_ngrok(port):
    """Setup ngrok tunnel for the Flask app."""
    if NGROK_AUTH_TOKEN:
        ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    
    # Open a ngrok tunnel to the HTTP server
    public_url = ngrok.connect(port).public_url
    print(f' * ngrok tunnel "{public_url}" -> http://127.0.0.1:{port}')
    return public_url 