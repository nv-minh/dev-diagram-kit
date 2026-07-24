#!/usr/bin/env python3
"""
plantuml_encode.py — encode one .puml file using PlantUML's standard text encoding
(raw deflate + custom base64 alphabet), printing the encoded string to build the server URL.

Used by render-plantuml.sh — do NOT call directly; the bash script handles the rest
(build URL + curl + check response).

Usage: python3 plantuml_encode.py <file.puml>
"""
import sys
import zlib

# PlantUML uses its own character table, NOT standard base64 (RFC 4648).
_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"


def _encode6bit(b):
    return _ALPHABET[b & 0x3F]


def _append3bytes(b1, b2, b3):
    c1 = b1 >> 2
    c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
    c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
    c4 = b3 & 0x3F
    return _encode6bit(c1) + _encode6bit(c2) + _encode6bit(c3) + _encode6bit(c4)


def encode_plantuml(data: bytes) -> str:
    out = []
    for i in range(0, len(data), 3):
        chunk = data[i:i + 3]
        b1 = chunk[0]
        b2 = chunk[1] if len(chunk) > 1 else 0
        b3 = chunk[2] if len(chunk) > 2 else 0
        out.append(_append3bytes(b1, b2, b3))
    return "".join(out)


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 plantuml_encode.py <file.puml>", file=sys.stderr)
        sys.exit(2)
    path = sys.argv[1]
    with open(path, "rb") as f:
        text = f.read()
    # raw deflate: drop the 2-byte zlib header + 4-byte adler32 checksum (PlantUML spec)
    compressed = zlib.compress(text, 9)[2:-4]
    print(encode_plantuml(compressed))


if __name__ == "__main__":
    main()
