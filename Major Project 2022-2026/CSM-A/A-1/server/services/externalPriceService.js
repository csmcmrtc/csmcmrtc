import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedResult = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for: ${key}`);
    return cached.data;
  }
  return null;
};

const setCachedResult = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Common browser launch options
 */
const getBrowserOptions = () => ({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920,1080',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process'
  ]
});

/**
 * Common page setup
 */
const setupPage = async (browser) => {
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  });

  return page;
};

/**
 * Scrape Swiggy Instamart for product information
 */
const scrapeSwiggy = async (productName, lat, lng) => {
  let browser;
  try {
    browser = await puppeteer.launch(getBrowserOptions());
    const page = await setupPage(browser);

    // Set location via localStorage before navigation
    if (lat && lng) {
      await page.evaluateOnNewDocument((latitude, longitude) => {
        localStorage.setItem('lat', latitude.toString());
        localStorage.setItem('lng', longitude.toString());
        localStorage.setItem('userLocation', JSON.stringify({ lat: latitude, lng: longitude }));
      }, lat, lng);
    }

    const searchUrl = `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(productName)}`;
    console.log(`Scraping Swiggy: ${searchUrl}`);
    
    // Use domcontentloaded instead of networkidle0 for faster loading
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollBy(0, 800));
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract HTML - get body content
    const htmlContent = await page.evaluate(() => {
      const body = document.body;
      if (!body) return '';
      return body.innerHTML.substring(0, 25000);
    });

    const pageTitle = await page.title();
    console.log(`Swiggy - Title: "${pageTitle}", Content: ${htmlContent.length} chars`);

    await browser.close();
    
    return { 
      success: htmlContent.length > 500, 
      html: htmlContent, 
      platform: 'Swiggy Instamart' 
    };
    
  } catch (error) {
    if (browser) await browser.close();
    console.error('Swiggy scraping error:', error.message);
    return { success: false, error: error.message, platform: 'Swiggy Instamart' };
  }
};

/**
 * Scrape Zepto for product information
 */
const scrapeZepto = async (productName, lat, lng) => {
  let browser;
  try {
    browser = await puppeteer.launch(getBrowserOptions());
    const page = await setupPage(browser);

    // Set location
    if (lat && lng) {
      await page.evaluateOnNewDocument((latitude, longitude) => {
        localStorage.setItem('user_location', JSON.stringify({ lat: latitude, lng: longitude }));
      }, lat, lng);
    }

    const searchUrl = `https://www.zeptonow.com/search?query=${encodeURIComponent(productName)}`;
    console.log(`Scraping Zepto: ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 8000));
    await page.evaluate(() => window.scrollBy(0, 800));
    await new Promise(resolve => setTimeout(resolve, 2000));

    const htmlContent = await page.evaluate(() => {
      const body = document.body;
      if (!body) return '';
      return body.innerHTML.substring(0, 25000);
    });

    const pageTitle = await page.title();
    console.log(`Zepto - Title: "${pageTitle}", Content: ${htmlContent.length} chars`);

    await browser.close();
    
    return { 
      success: htmlContent.length > 500, 
      html: htmlContent, 
      platform: 'Zepto' 
    };
    
  } catch (error) {
    if (browser) await browser.close();
    console.error('Zepto scraping error:', error.message);
    return { success: false, error: error.message, platform: 'Zepto' };
  }
};

/**
 * Scrape Blinkit for product information
 */
const scrapeBlinkit = async (productName, lat, lng) => {
  let browser;
  try {
    browser = await puppeteer.launch(getBrowserOptions());
    const page = await setupPage(browser);

    // Set location
    if (lat && lng) {
      await page.evaluateOnNewDocument((latitude, longitude) => {
        localStorage.setItem('__blinkit_lat__', latitude.toString());
        localStorage.setItem('__blinkit_lon__', longitude.toString());
      }, lat, lng);
    }

    const searchUrl = `https://blinkit.com/s/?q=${encodeURIComponent(productName)}`;
    console.log(`Scraping Blinkit: ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 8000));
    await page.evaluate(() => window.scrollBy(0, 800));
    await new Promise(resolve => setTimeout(resolve, 2000));

    const htmlContent = await page.evaluate(() => {
      const body = document.body;
      if (!body) return '';
      return body.innerHTML.substring(0, 25000);
    });

    const pageTitle = await page.title();
    console.log(`Blinkit - Title: "${pageTitle}", Content: ${htmlContent.length} chars`);

    await browser.close();
    
    return { 
      success: htmlContent.length > 500, 
      html: htmlContent, 
      platform: 'Blinkit' 
    };
    
  } catch (error) {
    if (browser) await browser.close();
    console.error('Blinkit scraping error:', error.message);
    return { success: false, error: error.message, platform: 'Blinkit' };
  }
};

/**
 * Sleep helper for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fallback regex-based parser when Gemini is unavailable
 * Extracts product data directly from HTML using patterns
 */
const parseWithRegex = (scrapedData) => {
  const html = scrapedData.html || '';
  const platform = scrapedData.platform;
  const products = [];

  try {
    // Common price patterns: ₹150, Rs. 150, Rs150
    const pricePattern = /(?:₹|Rs\.?\s*)(\d+(?:\.\d{1,2})?)/gi;
    
    // Find all prices in the HTML
    const allPrices = [...html.matchAll(pricePattern)].map(m => parseFloat(m[1]));
    
    // Platform-specific parsing strategies
    if (platform === 'Blinkit') {
      // Blinkit uses specific class patterns
      const productBlockPattern = /<div[^>]*class="[^"]*Product__UpdatedDetailContainer[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
      const namePattern = /<div[^>]*class="[^"]*Product__UpdatedTitle[^"]*"[^>]*>([^<]+)/i;
      const pricePattern2 = /<div[^>]*class="[^"]*Product__UpdatedPriceAndAtc498[^"]*"[^>]*>[\s\S]*?₹(\d+)/i;
      
      // Alternative: Look for product names and nearby prices
      const genericNamePattern = /(?:class="[^"]*(?:product|item|title|name)[^"]*"[^>]*>|data-testid="[^"]*product[^"]*"[^>]*>)\s*([A-Za-z][A-Za-z0-9\s\-\'\.]+?)(?:<|$)/gi;
      let match;
      while ((match = genericNamePattern.exec(html)) !== null) {
        const name = match[1].trim();
        if (name.length > 3 && name.length < 100 && !name.includes('{') && !name.includes('<')) {
          // Find a nearby price
          const nearbyText = html.substring(Math.max(0, match.index - 200), Math.min(html.length, match.index + 500));
          const priceMatch = nearbyText.match(/₹\s*(\d+(?:\.\d{1,2})?)/);
          if (priceMatch) {
            products.push({
              name,
              price: parseFloat(priceMatch[1]),
              originalPrice: null,
              discount: null,
              quantity: extractQuantity(name),
              inStock: true
            });
          }
        }
      }
    } else if (platform === 'Zepto') {
      // Zepto patterns
      const productPattern = /(?:data-testid|aria-label)="[^"]*"[^>]*>([A-Za-z][A-Za-z0-9\s\-\'\.]+(?:\d+\s*(?:g|kg|ml|l|pcs|pieces?))?)/gi;
      let match;
      while ((match = productPattern.exec(html)) !== null) {
        const name = match[1].trim();
        if (name.length > 3 && name.length < 100 && !name.includes('{')) {
          const nearbyText = html.substring(Math.max(0, match.index - 200), Math.min(html.length, match.index + 500));
          const priceMatch = nearbyText.match(/₹\s*(\d+(?:\.\d{1,2})?)/);
          const originalPriceMatch = nearbyText.match(/(?:line-through|strikethrough|mrp)[^>]*>?\s*₹?\s*(\d+(?:\.\d{1,2})?)/i);
          if (priceMatch) {
            products.push({
              name,
              price: parseFloat(priceMatch[1]),
              originalPrice: originalPriceMatch ? parseFloat(originalPriceMatch[1]) : null,
              discount: null,
              quantity: extractQuantity(name),
              inStock: true
            });
          }
        }
      }
    } else if (platform === 'Swiggy Instamart') {
      // Swiggy patterns
      const productPattern = /(?:class="[^"]*(?:styles_itemName|product-name|item-title)[^"]*"[^>]*>|>)([A-Z][A-Za-z0-9\s\-\'\.]+)(?:<)/gi;
      let match;
      while ((match = productPattern.exec(html)) !== null) {
        const name = match[1].trim();
        if (name.length > 3 && name.length < 100 && !name.includes('{')) {
          const nearbyText = html.substring(Math.max(0, match.index - 200), Math.min(html.length, match.index + 500));
          const priceMatch = nearbyText.match(/₹\s*(\d+(?:\.\d{1,2})?)/);
          if (priceMatch) {
            products.push({
              name,
              price: parseFloat(priceMatch[1]),
              originalPrice: null,
              discount: null,
              quantity: extractQuantity(name),
              inStock: true
            });
          }
        }
      }
    }

    // Generic fallback: Look for price tags with context
    if (products.length === 0) {
      // Find text near price symbols that could be product names
      const priceContextPattern = /([A-Z][A-Za-z0-9\s\-\'\.]{3,50}(?:\d+\s*(?:g|kg|ml|l))?)[^₹]{0,100}₹\s*(\d+(?:\.\d{1,2})?)/gi;
      let match;
      while ((match = priceContextPattern.exec(html)) !== null && products.length < 10) {
        const name = match[1].trim().replace(/<[^>]*>/g, '').trim();
        const price = parseFloat(match[2]);
        if (name.length > 3 && price > 0 && price < 10000) {
          products.push({
            name,
            price,
            originalPrice: null,
            discount: null,
            quantity: extractQuantity(name),
            inStock: true
          });
        }
      }
    }

    // Deduplicate products
    const seen = new Set();
    const uniqueProducts = products.filter(p => {
      const key = `${p.name.toLowerCase()}-${p.price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`Regex fallback parsed ${uniqueProducts.length} products from ${platform}`);
    
    return {
      platform,
      success: uniqueProducts.length > 0,
      products: uniqueProducts.slice(0, 15), // Limit to 15 products
      parsedWith: 'regex-fallback'
    };
  } catch (error) {
    console.error(`Regex parsing error for ${platform}:`, error.message);
    return {
      platform,
      success: false,
      error: error.message,
      products: []
    };
  }
};

/**
 * Extract quantity from product name
 */
const extractQuantity = (name) => {
  const quantityMatch = name.match(/(\d+(?:\.\d+)?\s*(?:g|gm|gms|kg|ml|l|ltr|litre|liter|pcs|pieces?|pack|units?))/i);
  return quantityMatch ? quantityMatch[1] : null;
};

/**
 * Use Gemini AI to parse scraped HTML and extract product information
 */
const parseWithGemini = async (scrapedData, retryCount = 0) => {
  const MAX_RETRIES = 1; // Reduced since we have regex fallback
  
  try {
    if (!scrapedData.success || !scrapedData.html || scrapedData.html.length < 500) {
      // Try regex fallback even for insufficient content
      console.log(`Insufficient Gemini content for ${scrapedData.platform}, trying regex...`);
      return parseWithRegex(scrapedData);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are an expert at extracting product data from HTML. Analyze this HTML from ${scrapedData.platform} and extract grocery product information.

TASK: Find ALL products and extract their details. Look for prices in Indian Rupees (₹ symbol).

EXTRACT:
- Product names (grocery items)
- Current prices (numbers after ₹ or Rs.)
- Original/MRP prices (usually crossed out)
- Quantities (g, kg, ml, L, pieces)
- Discount percentages
- Whether in stock

RETURN FORMAT - Return ONLY a valid JSON array, nothing else:
[
  {
    "name": "Product Name",
    "price": 150,
    "originalPrice": 180,
    "discount": "17%",
    "quantity": "500g",
    "inStock": true
  }
]

If no products found, return exactly: []

HTML:
${scrapedData.html.substring(0, 18000)}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log(`Gemini response for ${scrapedData.platform} (first 300 chars): ${responseText.substring(0, 300)}`);
    
    // Clean the response
    let jsonString = responseText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    
    // Extract JSON array
    const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    const products = JSON.parse(jsonString);
    const validProducts = Array.isArray(products) 
      ? products.filter(p => p.name && p.price !== undefined)
      : [];
    
    console.log(`Parsed ${validProducts.length} products from ${scrapedData.platform}`);
    
    return {
      platform: scrapedData.platform,
      success: true,
      products: validProducts
    };
    
  } catch (error) {
    const isRateLimitError = error.message?.includes('429') || error.message?.includes('quota');
    
    if (isRateLimitError && retryCount < MAX_RETRIES) {
      const waitTime = (retryCount + 1) * 10000; // 10s, 20s (reduced since we have fallback)
      console.log(`Rate limited for ${scrapedData.platform}, retrying in ${waitTime/1000}s...`);
      await sleep(waitTime);
      return parseWithGemini(scrapedData, retryCount + 1);
    }
    
    // If quota exceeded after retries, use regex fallback
    if (isRateLimitError) {
      console.log(`Gemini quota exceeded for ${scrapedData.platform}, using regex fallback...`);
      return parseWithRegex(scrapedData);
    }
    
    console.error(`Gemini parsing error for ${scrapedData.platform}:`, error.message);
    // Try regex fallback for any parsing error
    console.log(`Trying regex fallback for ${scrapedData.platform}...`);
    return parseWithRegex(scrapedData);
  }
};

/**
 * Main function to get external prices from all platforms
 */
export const getExternalPrices = async (productName, lat, lng) => {
  // Check cache first
  const cacheKey = `${productName.toLowerCase()}-${lat?.toFixed(2)}-${lng?.toFixed(2)}`;
  const cachedResult = getCachedResult(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Fetching external prices for: "${productName}" at (${lat}, ${lng})`);
  console.log(`${'='.repeat(60)}`);
  
  // Scrape all platforms in parallel
  const [swiggyData, zeptoData, blinkitData] = await Promise.all([
    scrapeSwiggy(productName, lat, lng),
    scrapeZepto(productName, lat, lng),
    scrapeBlinkit(productName, lat, lng)
  ]);

  console.log('\n--- Scraping Results ---');
  console.log(`Swiggy: ${swiggyData.success ? `✓ ${swiggyData.html?.length || 0} chars` : `✗ ${swiggyData.error}`}`);
  console.log(`Zepto: ${zeptoData.success ? `✓ ${zeptoData.html?.length || 0} chars` : `✗ ${zeptoData.error}`}`);
  console.log(`Blinkit: ${blinkitData.success ? `✓ ${blinkitData.html?.length || 0} chars` : `✗ ${blinkitData.error}`}`);

  // Parse results with Gemini SEQUENTIALLY to avoid rate limits
  console.log('\n--- Parsing with Gemini (sequential to avoid rate limits) ---');
  
  const swiggyProducts = await parseWithGemini(swiggyData);
  await sleep(2000); // Wait 2s between calls
  
  const zeptoProducts = await parseWithGemini(zeptoData);
  await sleep(2000);
  
  const blinkitProducts = await parseWithGemini(blinkitData);

  // Calculate delivery info
  const enrichWithDeliveryInfo = (result, deliveryTime, deliveryFee) => ({
    ...result,
    deliveryTime,
    deliveryFee,
    products: result.products.map(p => ({
      ...p,
      deliveryTime,
      deliveryFee
    }))
  });

  const response = {
    swiggy: enrichWithDeliveryInfo(swiggyProducts, '15-20 mins', 30),
    zepto: enrichWithDeliveryInfo(zeptoProducts, '10-15 mins', 25),
    blinkit: enrichWithDeliveryInfo(blinkitProducts, '12-18 mins', 35),
    searchedProduct: productName,
    location: { lat, lng },
    timestamp: new Date().toISOString()
  };

  console.log('\n--- Final Results ---');
  console.log(`Swiggy: ${response.swiggy.products.length} products`);
  console.log(`Zepto: ${response.zepto.products.length} products`);
  console.log(`Blinkit: ${response.blinkit.products.length} products`);
  console.log(`${'='.repeat(60)}\n`);

  // Cache the result
  setCachedResult(cacheKey, response);

  return response;
};

/**
 * Get prices from a single platform
 */
export const getPlatformPrices = async (platform, productName, lat, lng) => {
  let scrapedData;
  let deliveryTime;
  let deliveryFee;

  switch (platform.toLowerCase()) {
    case 'swiggy':
      scrapedData = await scrapeSwiggy(productName, lat, lng);
      deliveryTime = '15-20 mins';
      deliveryFee = 30;
      break;
    case 'zepto':
      scrapedData = await scrapeZepto(productName, lat, lng);
      deliveryTime = '10-15 mins';
      deliveryFee = 25;
      break;
    case 'blinkit':
      scrapedData = await scrapeBlinkit(productName, lat, lng);
      deliveryTime = '12-18 mins';
      deliveryFee = 35;
      break;
    default:
      return { success: false, error: 'Invalid platform' };
  }

  const result = await parseWithGemini(scrapedData);
  
  return {
    ...result,
    deliveryTime,
    deliveryFee,
    products: result.products.map(p => ({
      ...p,
      deliveryTime,
      deliveryFee
    }))
  };
};

export default {
  getExternalPrices,
  getPlatformPrices
};
