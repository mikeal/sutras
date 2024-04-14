#!/bin/sh

display_usage() {
    echo "Usage: $0 <action> [options]"
    echo
    echo "Actions:"
    echo "  txt-to-json <file.txt>     Transforms a translation file (.txt) into a JSON file (.json)."
    echo "  finish-trans <file.txt>    Completes a translation based on what has been translated in the file thus far."
    echo "  check-internals <sutra>    Checks the internals of a translation for a given sutra."
    echo "  xml-to-html <file.xml>     Converts an XML file (.xml) to an HTML file (.html)."
    echo
    echo "Options:"
    echo "  -h, --help    Display this help message and exit."
    echo
    echo "Examples:"
    echo "  $0 txt-to-json sample.txt     Converts 'sample.txt' to 'sample.json' using the Deno parser."
    echo "  $0 xml-to-html example.xml    Converts 'example.xml' to 'example.html' using Deno."
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

xml_to_html() {
  local inputFile="$1"

  # Validate the input file extension.
  if [ "${inputFile##*.}" != "xml" ]; then
      echo "Error: The file must end with '.xml'"
      exit 1
  fi

  # Extract only the filename from the input file path
  local inputFilename=$(basename "$inputFile")

  # Generate an output filename by replacing the xml extension with html.
  local outputFilename="${inputFilename%.xml}.html"
  local outputPath="./gh-pages"
  local outputFile="${outputPath}/${outputFilename}"

  # Ensure the output directory exists
  mkdir -p "$outputPath"

  # Execute the transformation
  deno run --allow-net --allow-env --allow-read --allow-write "xml_to_html.js" "$inputFile" > "$outputFile"

  # Prettify the output HTML file
  npx prettier --bracket-same-line --html-whitespace-sensitivity ignore --write "$outputFile"
}

check_internals() {
  sutra="$1"
  exec deno run --allow-net --allow-env --allow-read --allow-write "check-trans-internals.js" "$sutra"
}

finish_trans() {
  sutra="$1"
  exec deno run --allow-net --allow-env --allow-read --allow-write "finish-trans.js" "$sutra"
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
  finish_trans)
    finish_trans "$2"
    ;;
  check-internals)
    check_internals "$2"
    ;;
  xml-to-html)
    xml_to_html "$2"
    ;;
  *)
    echo "Error: Unknown action '$action'"
    display_usage
    exit 1
    ;;
esac
