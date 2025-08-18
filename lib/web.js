// lib/web.js - Simple web page content fetcher
import { load } from 'cheerio';

// Extract URLs from text
export function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const matches = text.match(urlRegex) || [];

  return matches.map(url => {
    // Add protocol if missing
    if (url.startsWith('www.')) {
      return `https://${url}`;
    }
    return url;
  });
}

// Fetch and extract text content from a webpage
export async function fetchPageContent(url) {
  try {
    console.log(`🕷️  Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Yak/1.0 (Local LLM Assistant)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, .nav, .menu, .sidebar').remove();

    // Try to get main content, fall back to body
    let content = $('main, article, .content, .post, .entry').text();
    if (!content.trim()) {
      content = $('body').text();
    }

    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Limit content length (don't overwhelm the LLM)
    const maxLength = 8000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '\n\n[Content truncated...]';
    }

    console.log(`✅ Fetched ${content.length} characters\n`);
    return content;

  } catch (error) {
    console.log(`❌ Failed to fetch ${url}: ${error.message}`);
    return null;
  }
}

// Check if text contains URLs
function hasUrls(text) {
  return /https?:\/\/|www\./i.test(text);
}

// Maybe enhance prompt with web content (checks for URLs first)
export async function maybeEnhancePromptWithWeb(prompt) {
  if (!hasUrls(prompt)) {
    return { enhanced: prompt, hasWeb: false };
  }

  console.log('\n🌐 Detected URL(s), fetching content...');

  const urls = extractUrls(prompt);
  let enhancedPrompt = prompt;

  for (const url of urls) {
    const content = await fetchPageContent(url);

    if (content) {
      enhancedPrompt = `Based on this webpage content from ${url}:

${content}

---

${prompt}`;
    }
  }

  return { enhanced: enhancedPrompt, hasWeb: true };
}
