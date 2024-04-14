import isChinese from "./lib/is_chinese.js";
import OpenAI from "https://deno.land/x/openai@v4.33.0/mod.ts";

async function parseTextFile(filePath) {
  const decoder = new TextDecoder("utf-8");
  const content = await Deno.readFile(filePath);
  const text = decoder.decode(content);
  const lines = text.split("\n");
  const result = [];
  let lastChineseLineIndex = null;

  for (let i = 0; i < lines.length; i++) {
    // Skip lines that start with "#"
    if (lines[i].trim().startsWith("#")) {
      continue;
    }

    if (isChinese(lines[i])) {
      // Add the new Chinese line as a new object in the result array.
      result.push({ chinese: lines[i].trim(), english: null });
      lastChineseLineIndex = result.length - 1; // Record the index of the last Chinese line.
    } else if (lastChineseLineIndex !== null && lines[i].trim() !== "") {
      // Check if the current line (presumably English) should append or replace the English text
      // for the last recorded Chinese line object.
      if (result[lastChineseLineIndex].english === null) {
        result[lastChineseLineIndex].english = lines[i];
      } else {
        result[lastChineseLineIndex].english += "\n" + lines[i];
      }
    }
  }

  return result;
}

const apiKey = Deno.env.get("OPENAI_API_KEY");
if (!apiKey) {
  console.error("API key (OPENAI_API_KEY) not found in environment variables.");
  Deno.exit(1);
}

const client = new OpenAI({ apiKey });

let filePath;

if (Deno.args.length > 0) {
  filePath = Deno.args[0];
} else {
  console.log("No arguments provided.");
}

async function getUserInput(prompt) {
  console.log(prompt); // Display prompt message to the user
  const buffer = new Uint8Array(1024);
  const n = await Deno.stdin.read(buffer);
  const decoder = new TextDecoder();
  return n ? decoder.decode(buffer.subarray(0, n)).trim() : null;
}

const lines = await parseTextFile(filePath);
const excludes = "，：？　　.\"'。";
let trans_txt = "";
const trans_map = {};
const occurances = (text) => {
  const chars = Array.from(text).filter((c) => {
    return !excludes.includes(c);
  });
  return Object.fromEntries(
    Object.keys(trans_map)
      .filter((k) => {
        for (const c of chars) {
          if (k.includes(c)) return true;
        }
        return false;
      })
      .map((k) => [k, trans_map[k]]),
  );
};
const add_trans = (line) => {
  trans_txt += line.chinese + "\n" + line.english + "\n\n";
  trans_map[line.chinese] = line.english;
};

let prompt =
  "We're going to be translating a Buddhist text from classical Chinese to English.\n\n";

for (const line of lines) {
  if (line.english) {
    add_trans(line);
  } else {
    let prev = occurances(line.chinese);
    if (Object.keys(prev).length > 10) {
      const keys = Object.keys(prev);
      const cc = (key) =>
        Array.from(key).filter((c) => line.chinese.includes(c)).length;
      const sk = keys.sort((a, b) => cc(b) - cc(a)).slice(0, 10);

      prev = sk.reduce((a, k) => ({ ...a, [k]: prev[k] }), {});
    }

    prompt +=
      "Here is the entire text, translated, leading up to the line I'll be asking you to translate:\n\n```\n";
    prompt += trans_txt;
    prompt += "```\n\n";

    if (Object.keys(prev).length > 0) {
      prompt += "There are ";
      prompt += Object.keys(prev).length + " ";
      prompt +=
        "highly relevant previously translated lines to consider as context to remain consistent with:\n\n```\n";
      for (const [k, v] of Object.entries(prev)) {
        prompt += `${k}\n${v}\n\n`;
      }
      prompt += "```\n\n";
    }

    prompt += "\n";

    prompt += `Translate the following classical Chinese text to English:\n\`\`\`\n${line.chinese}\n\`\`\`\n\n`;

    console.log(prompt);
    const response = await getUserInput("Press Enter to continue...");
  }
}
