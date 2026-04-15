#!/usr/bin/env python3

from __future__ import annotations

import argparse
import http.server
import mimetypes
from pathlib import Path


class GzipDistHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str | None = None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self):
        request_path = self.translate_path(self.path)
        resolved_path = Path(request_path)

        if resolved_path.is_dir():
            resolved_path = resolved_path / 'index.html'

        gzip_path = Path(f'{resolved_path}.gz')
        if gzip_path.is_file():
            self._send_gzip_file(gzip_path, resolved_path.name)
            return

        super().do_GET()

    def do_HEAD(self):
        request_path = self.translate_path(self.path)
        resolved_path = Path(request_path)

        if resolved_path.is_dir():
            resolved_path = resolved_path / 'index.html'

        gzip_path = Path(f'{resolved_path}.gz')
        if gzip_path.is_file():
            self._send_gzip_headers(gzip_path, resolved_path.name)
            return

        super().do_HEAD()

    def _send_gzip_headers(self, gzip_path: Path, original_name: str):
        content_type = mimetypes.guess_type(original_name)[0] or 'application/octet-stream'
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Encoding', 'gzip')
        self.send_header('Content-Length', str(gzip_path.stat().st_size))
        self.end_headers()

    def _send_gzip_file(self, gzip_path: Path, original_name: str):
        self._send_gzip_headers(gzip_path, original_name)
        with gzip_path.open('rb') as gzip_file:
            self.wfile.write(gzip_file.read())


def main() -> None:
    parser = argparse.ArgumentParser(description='Serve gz-only dist files with proper gzip headers.')
    parser.add_argument('--directory', default='dist', help='Directory to serve. Defaults to dist.')
    parser.add_argument('--port', type=int, default=8000, help='Port to listen on. Defaults to 8000.')
    args = parser.parse_args()

    directory = str(Path(args.directory).resolve())
    handler = lambda *handler_args, **handler_kwargs: GzipDistHandler(
        *handler_args,
        directory=directory,
        **handler_kwargs,
    )

    with http.server.ThreadingHTTPServer(('0.0.0.0', args.port), handler) as server:
        print(f'Serving gzip-aware dist from {directory} on http://0.0.0.0:{args.port}')
        server.serve_forever()


if __name__ == '__main__':
    main()