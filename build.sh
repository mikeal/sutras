#!/bin/sh
export PATH="$HOME/.deno/bin:$PATH"
exec deno run --allow-read "parser.js"
