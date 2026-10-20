#!/usr/bin/env python3
import http.server
import os
import socketserver
from urllib.parse import unquote

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "frontend_dist"))


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


class Handler(http.server.SimpleHTTPRequestHandler):
    def handle(self):
        try:
            super().handle()
        except (ConnectionResetError, BrokenPipeError):
            return

    def translate_path(self, path: str) -> str:
        path = unquote(path.split("?", 1)[0].split("#", 1)[0])
        if path.startswith("/"):
            path = path[1:]
        return os.path.join(ROOT, path)

    def do_GET(self):
        fs_path = self.translate_path(self.path)

        if os.path.isdir(fs_path):
            fs_path = os.path.join(fs_path, "index.html")

        if os.path.exists(fs_path):
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

        self.path = "/index.html"
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def log_message(self, fmt, *args):
        print(fmt % args)


if __name__ == "__main__":
    host = os.environ.get("FRONTEND_HOST", "0.0.0.0")
    port = int(os.environ.get("FRONTEND_PORT", "5173"))
    os.chdir(ROOT)
    with ReusableTCPServer((host, port), Handler) as httpd:
        print(f"Serving {ROOT} on http://{host}:{port}")
        httpd.serve_forever()
