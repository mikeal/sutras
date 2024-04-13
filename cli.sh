#!/bin/sh

display_usage() {
    echo "Usage: $0 <action> [options]"
    echo
    echo "Actions:"
    echo "  txt-to-json <file.txt>   Transforms a translation file (.txt) into a JSON file (.json)."
    echo "  check-internals <sutra>  Checks the internals of a translation for a given sutra."
    echo
    echo "Options:"
    echo "  -h, --help    Display this help message and exit."
    echo
    echo "Examples:"
    echo "  $0 txt-to-json sample.txt    Converts 'sample.txt' to 'sample.json' using the Deno parser."
    echo "  $0 check-internals sutra     Checks the translation internals for 'sutra' using Deno."
}

# Set up the Deno PATH
export PATH="$HOME/.deno/bin:$PATH"

txt_to_json() {
  inputFile="$1"
  if [ "${inputFile##*.}" != "txt" ]; then
      echo "Error: The file must end with '.txt'"
      exit 1
  fi
  outputFile="${inputFile%.txt}.json"
  exec deno run --allow-net --allow-env --allow-read "trans-txt-to-json.js" "$inputFile" > "$outputFile"
}

check_internals() {
  sutra="$1"
  exec deno run --allow-net --allow-env --allow-read --allow-write "check-trans-internals.js" "$sutra"
}

# Check for help option
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  display_usage
  exit 0
fi

if [ $# -lt 2 ]; then
  display_usage
  exit 1
fi

action="$1"

case $action in
  txt-to-json)
    txt_to_json "$2"
    ;;
  check-internals)
    check_internals "$2"
    ;;
  *)
    echo "Error: Unknown action '$action'"
    display_usage
    exit 1
    ;;
esac
