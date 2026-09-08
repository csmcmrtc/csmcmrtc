import externalPriceService from '../services/externalPriceService.js';

/**
 * Get prices from all external platforms (Swiggy, Zepto, Blinkit)
 */
export const getAllExternalPrices = async (req, res) => {
  try {
    const { productName, lat, lng } = req.query;

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    // Default coordinates (Delhi) if not provided
    const latitude = parseFloat(lat) || 28.6139;
    const longitude = parseFloat(lng) || 77.2090;

    console.log(`Fetching external prices for: ${productName} at (${latitude}, ${longitude})`);

    const prices = await externalPriceService.getExternalPrices(productName, latitude, longitude);

    // Calculate best deals
    const allProducts = [
      ...(prices.swiggy.products || []).map(p => ({ ...p, platform: 'Swiggy Instamart' })),
      ...(prices.zepto.products || []).map(p => ({ ...p, platform: 'Zepto' })),
      ...(prices.blinkit.products || []).map(p => ({ ...p, platform: 'Blinkit' }))
    ].filter(p => p.price && p.inStock !== false);

    const bestDeal = allProducts.length > 0
      ? allProducts.reduce((min, p) => (p.price < min.price ? p : min), allProducts[0])
      : null;

    res.json({
      success: true,
      data: {
        ...prices,
        bestDeal,
        totalProductsFound: allProducts.length
      }
    });

  } catch (error) {
    console.error('External prices controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch external prices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get prices from a specific platform
 */
export const getPlatformPrices = async (req, res) => {
  try {
    const { platform } = req.params;
    const { productName, lat, lng } = req.query;

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    const validPlatforms = ['swiggy', 'zepto', 'blinkit'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform. Valid options: swiggy, zepto, blinkit'
      });
    }

    const latitude = parseFloat(lat) || 28.6139;
    const longitude = parseFloat(lng) || 77.2090;

    const prices = await externalPriceService.getPlatformPrices(platform, productName, latitude, longitude);

    res.json({
      success: true,
      data: prices
    });

  } catch (error) {
    console.error('Platform prices controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform prices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Compare prices across all platforms for a product
 */
export const comparePrices = async (req, res) => {
  try {
    const { productName, lat, lng } = req.query;

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    const latitude = parseFloat(lat) || 28.6139;
    const longitude = parseFloat(lng) || 77.2090;

    const prices = await externalPriceService.getExternalPrices(productName, latitude, longitude);

    // Create comparison summary
    const platformSummary = [];

    // Process Swiggy
    if (prices.swiggy.success && prices.swiggy.products.length > 0) {
      const lowestPrice = Math.min(...prices.swiggy.products.map(p => p.price).filter(Boolean));
      platformSummary.push({
        platform: 'Swiggy Instamart',
        productCount: prices.swiggy.products.length,
        lowestPrice,
        deliveryTime: prices.swiggy.deliveryTime,
        deliveryFee: prices.swiggy.deliveryFee,
        totalCost: lowestPrice + prices.swiggy.deliveryFee,
        available: true
      });
    } else {
      platformSummary.push({
        platform: 'Swiggy Instamart',
        available: false,
        error: prices.swiggy.error
      });
    }

    // Process Zepto
    if (prices.zepto.success && prices.zepto.products.length > 0) {
      const lowestPrice = Math.min(...prices.zepto.products.map(p => p.price).filter(Boolean));
      platformSummary.push({
        platform: 'Zepto',
        productCount: prices.zepto.products.length,
        lowestPrice,
        deliveryTime: prices.zepto.deliveryTime,
        deliveryFee: prices.zepto.deliveryFee,
        totalCost: lowestPrice + prices.zepto.deliveryFee,
        available: true
      });
    } else {
      platformSummary.push({
        platform: 'Zepto',
        available: false,
        error: prices.zepto.error
      });
    }

    // Process Blinkit
    if (prices.blinkit.success && prices.blinkit.products.length > 0) {
      const lowestPrice = Math.min(...prices.blinkit.products.map(p => p.price).filter(Boolean));
      platformSummary.push({
        platform: 'Blinkit',
        productCount: prices.blinkit.products.length,
        lowestPrice,
        deliveryTime: prices.blinkit.deliveryTime,
        deliveryFee: prices.blinkit.deliveryFee,
        totalCost: lowestPrice + prices.blinkit.deliveryFee,
        available: true
      });
    } else {
      platformSummary.push({
        platform: 'Blinkit',
        available: false,
        error: prices.blinkit.error
      });
    }

    // Find best overall deal (lowest total cost including delivery)
    const availablePlatforms = platformSummary.filter(p => p.available);
    const bestOverallDeal = availablePlatforms.length > 0
      ? availablePlatforms.reduce((min, p) => (p.totalCost < min.totalCost ? p : min), availablePlatforms[0])
      : null;

    res.json({
      success: true,
      data: {
        searchedProduct: productName,
        location: { lat: latitude, lng: longitude },
        comparison: platformSummary,
        bestOverallDeal,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Compare prices controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare prices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  getAllExternalPrices,
  getPlatformPrices,
  comparePrices
};
