#!/bin/zsh

# Set metadata variables
AUTHOR="Mikeal Rogers, Xuanzang, Buddha"
TITLE="Sūtra on the Noble Path of Dependent Origination"
TAGS="Buddhism, Sutra"
PUBLISHER="Hear the World Sound"
PUBDATE=$(date +%Y-%m-%d)  # Set current date dynamically
LANGUAGE="en"

# Conversion options
MARKDOWN_EXTENSIONS="footnotes,tables,codehilite,meta,nl2br,smarty,sane_lists,wikilinks,fenced_code,toc"
PAGE_BREAKS_BEFORE="//h:h1"

# Define the list of txt files to convert
TXT_FILE="T0714_001.md"

CSS="./translation.css"
FONT_FAMILY="FiraGO"
COVER_IMAGE="./cover.jpg"

# Convert txt to markdown using ebook-convert with specified options
ebook-convert "$TXT_FILE" "${TXT_FILE:r}.epub" \
--authors "$AUTHOR" \
--title "$TITLE" \
--tags "$TAGS" \
--extra-css $CSS \
--publisher "$PUBLISHER" \
--pubdate "$PUBDATE" \
--markdown-extensions "$MARKDOWN_EXTENSIONS" \
--embed-font-family "$FONT_FAMILY" \
--no-default-epub-cover \
--page-breaks-before "$PAGE_BREAKS_BEFORE" \
--cover "$COVER_IMAGE" \
--preserve-cover-aspect-ratio \
--preserve-spaces \
--pretty-print


echo "Conversion complete!"
