#!/bin/sh
# Builds index.html from src/, then copies it into docs/, which is all
# GitHub Pages publishes. docs/app.html is kept so old links still work.
set -e
cd "$(dirname "$0")"
(cd src && python build.py)
cp index.html docs/index.html
cp index.html docs/app.html
cp src/og.png docs/og.png
echo "index.html, docs/index.html, docs/app.html and docs/og.png updated"
