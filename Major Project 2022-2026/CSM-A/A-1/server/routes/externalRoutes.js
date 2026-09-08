import express from 'express';
import {
  getAllExternalPrices,
  getPlatformPrices,
  comparePrices
} from '../controllers/ExternalPriceController.js';

const router = express.Router();

/**
 * @route   GET /api/external/prices
 * @desc    Get prices from all external platforms (Swiggy, Zepto, Blinkit)
 * @query   productName (required) - Name of the product to search
 * @query   lat (optional) - Latitude for location-based results
 * @query   lng (optional) - Longitude for location-based results
 * @access  Public
 */
router.get('/prices', getAllExternalPrices);

/**
 * @route   GET /api/external/prices/:platform
 * @desc    Get prices from a specific platform
 * @params  platform - swiggy, zepto, or blinkit
 * @query   productName (required) - Name of the product to search
 * @query   lat (optional) - Latitude for location-based results
 * @query   lng (optional) - Longitude for location-based results
 * @access  Public
 */
router.get('/prices/:platform', getPlatformPrices);

/**
 * @route   GET /api/external/compare
 * @desc    Compare prices across all platforms
 * @query   productName (required) - Name of the product to search
 * @query   lat (optional) - Latitude for location-based results
 * @query   lng (optional) - Longitude for location-based results
 * @access  Public
 */
router.get('/compare', comparePrices);

export default router;
