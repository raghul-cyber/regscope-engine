import subprocess
import threading
import http.server
import socketserver
import os
import signal
import sys

PORT = 7860

class HealthCheckHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress logging of health check requests to avoid log clutter
        return

    def do_GET(self):
        if self.path == "/health" or self.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status": "healthy", "role": "celery-worker"}')
        else:
            self.send_response(404)
            self.end_headers()

def run_http_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), HealthCheckHandler) as httpd:
        print(f"Serving health check on port {PORT}", flush=True)
        httpd.serve_forever()

if __name__ == "__main__":
    print("Starting health check server thread...", flush=True)
    server_thread = threading.Thread(target=run_http_server, daemon=True)
    server_thread.start()

    celery_args = [
        "celery", "-A", "app.workers.celery_app", "worker",
        "--loglevel=info", "--concurrency=4",
        "--queues=crawl,ingest,pipeline,embed",
        "--max-tasks-per-child=100"
    ]
    print(f"Starting celery worker: {' '.join(celery_args)}", flush=True)
    
    process = subprocess.Popen(celery_args)
    
    def handle_signal(signum, frame):
        print(f"Received signal {signum}, terminating Celery worker...", flush=True)
        process.terminate()
        
    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)

    ret_code = process.wait()
    print(f"Celery worker exited with code {ret_code}", flush=True)
    sys.exit(ret_code)
