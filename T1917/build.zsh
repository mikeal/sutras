#!/bin/zsh

# Set metadata variables
AUTHOR="Zhìyǐ, Mikeal Rogers (translator)"
TITLE="Six Subtle Dharma Doors"
TAGS="Buddhism, Meditation, Manual, Meditation Manual"
PUBLISHER="Hear the World Sound"
PUBDATE=$(date +%Y-%m-%d)  # Set current date dynamically
LANGUAGE="en"

# Conversion options
MARKDOWN_EXTENSIONS="footnotes,tables,codehilite,meta,nl2br,smarty,sane_lists,wikilinks,fenced_code,toc"
PAGE_BREAKS_BEFORE="//h:h1"

# Define the list of txt files to convert
TXT_FILE="T1917_001.md"

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
--chapter "//*[name()='h1' or name()='h2' or name()='h3']" --level1-toc "//*[name()='h1']" --level2-toc "//*[name()='h2']" --level3-toc "//*[name()='h3']" \
--pretty-print


echo "Conversion complete!"
