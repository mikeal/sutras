import OpenAI from "https://deno.land/x/openai@v4.33.0/mod.ts";
import isChinese from "./lib/is_chinese";

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
      // If encountering a new Chinese line, first check if there is a pending lastChineseLine to be updated.
      // This is to ensure no English text is missed for the very last Chinese line in the document.
      if (lastChineseLine !== null && result[lastChineseLine] === "") {
        result[lastChineseLine] = lines[i - 1]; // Assume the previous line was the missing English translation.
      }
      lastChineseLine = lines[i];
      result[lastChineseLine] = ""; // Initialize with an empty string to accommodate for English text.
    } else if (lastChineseLine && lines[i].trim() !== "") {
      result[lastChineseLine] +=
        (result[lastChineseLine].length > 0 ? "\n" : "") + lines[i];
    }
  }

  // Handle the last Chinese line if the file ends without a newline.
  if (
    lastChineseLine &&
    result[lastChineseLine].trim() === "" &&
    lines[lines.length - 1].trim() !== ""
  ) {
    result[lastChineseLine] = lines[lines.length - 1];
  }

  return result;
}

// Assuming OPENAI_API_KEY is set in your environment variables
const apiKey = Deno.env.get("OPENAI_API_KEY");
if (!apiKey) {
  console.error("API key (OPENAI_API_KEY) not found in environment variables.");
  Deno.exit(1);
}

const client = new OpenAI({ apiKey });

function parseChatGPTResponse(responseText) {
  try {
    // Directly attempt to parse the response as JSON
    return JSON.parse(responseText);
  } catch (error) {
    // If direct parsing fails, attempt to extract JSON from markdown
    const markdownJsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (markdownJsonMatch && markdownJsonMatch[1]) {
      try {
        // Parse the extracted JSON string from markdown
        return JSON.parse(markdownJsonMatch[1]);
      } catch (innerError) {
        throw new Error("Failed to parse JSON extracted from markdown.");
      }
    } else {
      throw new Error("No valid JSON found in the response.");
    }
  }
}

async function fetchTranslationMapping(
  chineseText,
  englishText,
  maxRetries = 3,
) {
  const prompt = `Given the Chinese sentence "${chineseText}" translates to "${englishText}" in English, provide a detailed JSON object mapping of each Chinese character or phrase to the corresponding English words *only* (value should be a string).`;
  let retries = 0; // Current retry attempt

  while (retries < maxRetries) {
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      });

      // Assuming the AI responds with a JSON string that needs to be parsed
      if (!response.choices[0] || !response.choices[0].message) {
        throw new Error("nope");
      }

      const mappingResponse = parseChatGPTResponse(
        response.choices[0].message.content,
      );

      return { [chineseText]: mappingResponse };
    } catch (error) {
      console.error(
        `Attempt ${retries + 1} failed for '${chineseText}'. Error: ${error}`,
      );
      retries++;
      if (retries === maxRetries) {
        console.error(
          `Max retries reached. Failed to fetch translation mapping for '${chineseText}'.`,
        );
        return { [chineseText]: `Error: ${error.message}` };
      }
    }
  }
}

async function fetchTranslationsMappingsInParallel(
  translations,
  maxRetries = 3,
) {
  const promises = Object.entries(translations).map(
    ([chineseText, englishText]) =>
      fetchTranslationMapping(chineseText, englishText, maxRetries),
  );

  // Wait for all promises to settle, regardless of rejection
  const results = await Promise.allSettled(promises);

  // Consolidate results into one object
  const mappings = results.reduce((acc, result) => {
    if (result.status === "fulfilled") {
      return { ...acc, ...result.value };
    }
    // Handle or log errors as necessary
    // Errors have already been logged, but you might want to handle them differently
    return acc;
  }, {});

  return mappings;
}

let filePath;

if (Deno.args.length > 0) {
  filePath = Deno.args[0];
} else {
  console.log("No arguments provided.");
}

const maps = await fetchTranslationsMappingsInParallel(
  await parseTextFile(filePath),
);
console.log(JSON.stringify(maps, null, 2));
