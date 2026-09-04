#!/usr/bin/env python3
"""Small same-origin API for the Azuride creator editor."""

import hashlib
import hmac
import json
import os
import secrets
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CONTENT_PATH = ROOT / "content.json"
SECRET_PATH = ROOT / "admin-secret.json"
MAX_BODY = 2 * 1024 * 1024
TOKEN_TTL = 8 * 60 * 60
TOKENS = {}
TOKENS_LOCK = threading.Lock()


def read_json(path, fallback):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return fallback


def verify_password(password):
    secret = read_json(SECRET_PATH, {})
    if not isinstance(secret, dict) or secret.get("algorithm") != "pbkdf2-sha256":
        return False
    try:
        salt = bytes.fromhex(secret["salt"])
        expected = bytes.fromhex(secret["hash"])
        rounds = int(secret["rounds"])
    except (KeyError, TypeError, ValueError):
        return False
    actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, rounds)
    return hmac.compare_digest(actual, expected)


def save_content(payload):
    if not isinstance(payload, dict) or not isinstance(payload.get("projects"), list):
        raise ValueError("invalid content")
    if len(payload["projects"]) > 100:
        raise ValueError("too many projects")
    content = {
        "projects": payload["projects"],
        "mainProjectIndex": int(payload.get("mainProjectIndex", 0)),
        "updatedAt": int(time.time()),
    }
    serialized = json.dumps(content, ensure_ascii=False, separators=(",", ":"))
    if len(serialized.encode("utf-8")) > MAX_BODY:
        raise ValueError("content too large")
    temporary = CONTENT_PATH.with_suffix(".json.tmp")
    temporary.write_text(serialized, encoding="utf-8")
    os.replace(temporary, CONTENT_PATH)


class Handler(BaseHTTPRequestHandler):
    server_version = "AzurideAdmin/1.0"

    def log_message(self, format, *args):
        return

    def send_json(self, status, payload):
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def read_body(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise ValueError("invalid body")
        if length <= 0 or length > MAX_BODY:
            raise ValueError("invalid body")
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def authorized(self):
        value = self.headers.get("Authorization", "")
        token = value[7:] if value.startswith("Bearer ") else ""
        with TOKENS_LOCK:
            expires = TOKENS.get(token)
            if expires and expires > time.time():
                return True
            TOKENS.pop(token, None)
        return False

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/content":
            content = read_json(CONTENT_PATH, {"projects": [], "mainProjectIndex": 0})
            self.send_json(200, content)
            return
        self.send_json(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/api/login":
            self.send_json(404, {"error": "not found"})
            return
        try:
            payload = self.read_body()
            password = str(payload.get("password", "")) if isinstance(payload, dict) else ""
        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"error": "invalid request"})
            return
        if not verify_password(password):
            time.sleep(0.15)
            self.send_json(401, {"error": "invalid credentials"})
            return
        token = secrets.token_urlsafe(32)
        with TOKENS_LOCK:
            TOKENS[token] = time.time() + TOKEN_TTL
        self.send_json(200, {"token": token, "expiresIn": TOKEN_TTL})

    def do_PUT(self):
        if self.path != "/api/content":
            self.send_json(404, {"error": "not found"})
            return
        if not self.authorized():
            self.send_json(401, {"error": "unauthorized"})
            return
        try:
            save_content(self.read_body())
        except (ValueError, json.JSONDecodeError, OSError):
            self.send_json(400, {"error": "invalid content"})
            return
        self.send_json(200, {"ok": True})


def main():
    port = int(os.environ.get("AZURIDE_API_PORT", "8090"))
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
