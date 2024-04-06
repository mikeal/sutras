#!/usr/bin/env deno run --allow-read

// Function to determine if a line is likely Chinese
function isChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

// Async function to parse the text file
async function parseTextFile(filePath) {
  const decoder = new TextDecoder("utf-8");
  const content = await Deno.readFile(filePath);
  const text = decoder.decode(content);
  const lines = text.split("\n");
  const result = {};
  let lastChineseLine = null;

  for (let i = 0; i < lines.length; i++) {
    if (isChinese(lines[i])) {
      lastChineseLine = lines[i];
      result[lastChineseLine] = "";
    } else if (lastChineseLine && lines[i].trim() !== "") {
      result[lastChineseLine] +=
        (result[lastChineseLine].length > 0 ? "\n" : "") + lines[i];
    }
  }

  return result;
}

// Using top-level await to call the function
const filePath = "./T1579/T1579_001.txt";
const parsedData = await parseTextFile(filePath);
console.log(parsedData);
