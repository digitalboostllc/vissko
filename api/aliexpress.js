import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

import { getSetting } from './db.js';

const HOST = "https://api-sg.aliexpress.com";

/**
 * Pure HMAC-SHA256 signature generator for AliExpress Open Platform API
 */
function signOpRequest(apiPath, params, appSecret) {
  if (!appSecret) throw new Error("Missing ALIEXPRESS_APP_SECRET");

  const sortedKeys = Object.keys(params).sort();
  let signString = apiPath.includes("/") ? apiPath : "";
  
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += `${key}${params[key]}`;
    }
  }
  
  return crypto.createHmac("sha256", appSecret).update(signString, "utf8").digest("hex").toUpperCase();
}

/**
 * Global API Request Helper
 */
export async function requestAliExpressApi(apiMethod, params = {}) {
  const APP_KEY = await getSetting('ALIEXPRESS_APP_KEY');
  const APP_SECRET = await getSetting('ALIEXPRESS_APP_SECRET');
  const ACCESS_TOKEN = await getSetting('ALIEXPRESS_ACCESS_TOKEN');

  if (!APP_KEY || !APP_SECRET || !ACCESS_TOKEN) {
    throw new Error("Missing AliExpress credentials in database (APP_KEY, APP_SECRET, or ACCESS_TOKEN)");
  }

  const allParams = {
    app_key: APP_KEY,
    access_token: ACCESS_TOKEN,
    sign_method: "sha256",
    timestamp: Date.now().toString(),
    method: apiMethod,
    simplify: "false",
    format: "json",
  };

  for (const key in params) {
    allParams[key] = String(params[key]);
  }

  allParams.sign = signOpRequest(apiMethod, allParams, APP_SECRET);

  try {
    const endpoint = apiMethod.includes("/") ? `${HOST}/rest` : `${HOST}/sync`;
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams(allParams).toString(),
    });

    return await res.json();
  } catch (err) {
    console.error(`AliExpress API Error (${apiMethod}):`, err);
    throw new Error(`AliExpress API Error: ${err.message || "Unknown error"}`);
  }
}

/**
 * Place a Dropshipping Order on AliExpress
 */
export async function placeAliExpressOrder(orderId, shippingAddress, customerName, phone, quantity) {
  try {
    const productId = await getSetting('ALIEXPRESS_PRODUCT_ID');
    const skuId = await getSetting('ALIEXPRESS_SKU_ID') || ""; 

    if (!productId) {
      throw new Error("ALIEXPRESS_PRODUCT_ID is missing from .env");
    }

    // Ensure phone exists, AliExpress requires it. Provide a dummy one if customer didn't provide it
    const safePhone = phone ? phone : "0000000000";
    // Strip international code if we need to split it, but AliExpress accepts full strings in phone_number
    
    const logisticsAddress = {
      address: shippingAddress.line1 || "",
      address2: shippingAddress.line2 || "",
      city: shippingAddress.city || "",
      country: shippingAddress.country || "FR",
      contact_person: customerName || "Customer",
      phone_number: safePhone, 
      zip: shippingAddress.postal_code || "",
      province: shippingAddress.state || shippingAddress.city || ""
    };

    const payload = {
      logistics_address: JSON.stringify(logisticsAddress),
      product_items: JSON.stringify([
        {
          product_count: quantity,
          product_id: productId,
          sku_attr: skuId, 
          logistics_service_name: "AliExpress Standard Shipping"
        }
      ]),
      out_order_id: orderId // Prevents duplicate orders
    };

    console.log(`[AliExpress] Placing order ${orderId}...`);
    
    const res = await requestAliExpressApi("aliexpress.trade.buy.placeorder", payload);
    const result = res.result || res.aliexpress_trade_buy_placeorder_response?.result;

    if (result && result.is_success) {
      console.log(`✅ [AliExpress] Successfully placed order ${orderId}. AE Order IDs:`, result.order_list);
      return { success: true, aliexpressOrderIds: result.order_list };
    } else {
      console.error(`❌ [AliExpress] Fulfillment Error payload:`, res);
      return { success: false, error: result?.error_msg || "AliExpress rejected the order." };
    }
  } catch (err) {
    console.error(`❌ [AliExpress] Execution Exception:`, err);
    return { success: false, error: err.message };
  }
}
