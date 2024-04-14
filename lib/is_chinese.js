// Function to determine if a line is likely Chinese
function isChinese(text, threshold = 0.5) {
  // Extend Unicode range to include additional Chinese characters and punctuations
  const chineseCharRegex = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/g;
  const matches = text.match(chineseCharRegex);
  const chineseCharCount = matches ? matches.length : 0;

  // Optionally, include Chinese punctuation in your consideration
  const chinesePunctuationRegex = /[\u3000-\u303F\uff00-\uffef]/g;
  const punctuationMatches = text.match(chinesePunctuationRegex);
  const chinesePunctuationCount = punctuationMatches
    ? punctuationMatches.length
    : 0;

  // Calculate the proportion of Chinese characters and punctuation in the text
  const totalChineseCount = chineseCharCount + chinesePunctuationCount;
  const proportionOfChinese = totalChineseCount / text.length;

  // Return true if the proportion of Chinese content exceeds the threshold
  return proportionOfChinese >= threshold;
}

export default isChinese;
