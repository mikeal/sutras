import { Parser } from "https://deno.land/x/xmlparser@v0.2.0/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
// import { DOMParser } from "https://esm.sh/linkedom";

const createElement = (tag) => {
  return new DOMParser().parseFromString(`<${tag}></${tag}>`, "text/html");
};
// Reading the filename from the command line arguments
const filename = Deno.args[0];

if (!filename) {
  console.log("Please provide a file name.");
  Deno.exit(1);
}

const data = Deno.readTextFileSync(filename);

const parser = new Parser();
const root = parser.parse(data);

const query_by_tags = (element, ...tags) => {
  for (const tag of tags) {
    const elems = element.children.filter((c) => c.tag.toLowerCase() === tag);
    if (elems.length > 1) throw new Error("too many elements");
    if (elems.length === 0) throw new Error("not found");
    element = elems[0];
  }
  return element;
};

const body = query_by_tags(root, "tei", "text", "body");

const xml_to_html_tag_table = {
  lb: "line-begin",
  l: "verse-line",
  lg: "line-group",
  head: "tei-head",
  div: "tei-div",
  anchor: "tei-anchor",
  pb: "page-begin",
  juan: "tei-juan",
  jhead: "juan-head",
  title: "tei-title",
  mulu: "tei-mulu",
  g: "tei-glyph",
  milestone: "tei-milestone",
  docNumber: "tei-doc-number",
  p: "tei-p",
  space: "tei-space",
  byline: "tei-byline",
};
const known_tags = new Set(Object.keys(xml_to_html_tag_table));
// we don't mess with <p> because it's a standard html element that works the way we want
//
const setAttributes = (el, attrs) => {
  return Object.entries(attrs).forEach(([key, value]) =>
    el.setAttribute(key, value),
  );
};

const xml_to_html = (xml_element) => {
  const doc = createElement(xml_element.tag);
  const html_element = doc.querySelector(xml_element.tag);
  setAttributes(html_element, xml_element.attr);

  if (xml_element.value) {
    html_element.setAttribute("lang", "zh");
    html_element.textContent = xml_element.value;
  }
  if (!xml_element.attr.id && xml_element.attr.n) {
    html_element.setAttribute("id", xml_element.tag + "-" + xml_element.attr.n);
  }

  for (const el of xml_element.children) {
    if (known_tags.has(el.tag)) {
      el.tag = xml_to_html_tag_table[el.tag];
      html_element.appendChild(xml_to_html(el));
    } else {
      throw new Error(`unknown tag ${el.tag}`);
    }
  }
  return html_element;
};

body.tag = "tei-body";
const html = xml_to_html(body);

function wrapWithTemplate(str) {
  // Basic HTML structure with DOCTYPE declaration, and <html>, <head>, and <body> tags
  const header = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link type="text/css" rel="stylesheet" href="style.css">
</head>
<body>
`;
  const footer = `
</body>
</html>`;

  return header + str + footer;
}

console.log(wrapWithTemplate(html.outerHTML));
