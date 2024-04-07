#!/bin/sh

display_usage() {
    echo "Usage: $0 <file.txt>"
    echo "This command transforms a translation file (.txt) into a JSON file (.json) detailing the language."
    echo
    echo "Arguments:"
    echo "  <file>    The text file to be converted. Must end with '.txt' extension."
    echo
    echo "Options:"
    echo "  -h, --help    Display this help message and exit."
    echo
    echo "Example:"
    echo "  $0 sample.txt    Converts 'sample.txt' to 'sample.json' using the Deno parser."
}

# Check for help option or if an argument is provided
if [ "$1" = "-h" ] || [ "$1" = "--help" ] || [ $# -eq 0 ]; then
  display_usage
  exit 0
fi

# Capture the first argument (the input file)
inputFile="$1"

# Ensure the input file ends with .txt
if [ "${inputFile##*.}" != "txt" ]; then
    echo "Error: The input file must end with '.txt'"
    exit 1
fi

# Set up the Deno PATH
export PATH="$HOME/.deno/bin:$PATH"

# Replace the .txt extension with .json for the output filename
outputFile="${inputFile%.txt}.json"

# Execute the parser.js script with the inputFile as an argument
# and write its output to the outputFile
exec deno run --allow-net --allow-env --allow-read --allow-write "trans-txt-to-json.js" "$inputFile" > "$outputFile"

```

i'd like to change this command such that everything it currently does appears behind a command named "txt-to-json" and i can run it like this:

```./build.sh txt-to-json sample.txt```
To make the shell script respond to the command "txt-to-json" followed by a filename, you need to modify the script to parse the command line to identify the "txt-to-json" action and then run the existing functionality based on that action. Here's how you can achieve this:

```shell script
#!/bin/sh

display_usage() {
    echo "Usage: $0 txt-to-json <file.txt>"
    echo "This command transforms a translation file (.txt) into a JSON file (.json) detailing the language."
    echo
    echo "Arguments:"
    echo "  action    'txt-to-json' to trigger the conversion process."
    echo "  <file>    The text file to be converted. Must end with '.txt' extension."
    echo
    echo "Options:"
    echo "  -h, --help    Display this help message and exit."
    echo
    echo "Example:"
    echo "  $0 txt-to-json sample.txt    Converts 'sample.txt' to 'sample.json' using the Deno parser."
}

# Set up the Deno PATH
export PATH="$HOME/.deno/bin:$PATH"

# Function to convert txt to json
txt_to_json() {
  # Capture the file argument
  inputFile="$1"

  # Ensure the input file ends with .txt
  if [ "${inputFile##*.}" != "txt" ]; then
      echo "Error: The file must end with '.txt'"
      exit 1
  fi

  # Replace the .txt extension with .json for the output filename
  outputFile="${inputFile%.txt}.json"

  # Execute the parser.js script with the inputFile as an argument
  # and write its output to the outputFile
  exec deno run --allow-net --allow-env --allow-read --allow-write "trans-txt-to-json.js" "$inputFile" > "$outputFile"
}

# Check for help option
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  display_usage
  exit 0
fi

# Ensure there's at least two arguments (action and file)
if [ $# -lt 2 ]; then
  display_usage
  exit 1
fi

# Identify the action
action="$1"

case $action in
  txt-to-json)
    txt_to_json "$2"
    ;;
  *)
    echo "Error: Unknown action '$action'"
    display_usage
    exit 1
    ;;
esac
