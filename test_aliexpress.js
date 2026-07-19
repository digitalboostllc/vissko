import { requestAliExpressApi } from './api/aliexpress.js';
import { getSetting } from './api/db.js';

async function testAliExpressConnection() {
  console.log("Testing AliExpress Open Platform API Connection...");
  
  try {
    const productId = await getSetting('ALIEXPRESS_PRODUCT_ID');
    
    if (!productId) {
      console.log("⚠️  ALIEXPRESS_PRODUCT_ID is missing from the database. Testing with a generic query instead...");
      // Just test authentication by intentionally omitting required fields to see if auth passes
      const res = await requestAliExpressApi("aliexpress.ds.product.get", { product_id: "0" });
      
      if (res.error_response && res.error_response.code === 15) {
        console.log("❌ Authentication Failed: Invalid App Key, Secret, or Access Token.");
        console.log("Response:", res);
      } else {
        console.log("✅ Authentication successful! (The product ID '0' is invalid, but the signature and token were accepted).");
      }
      return;
    }

    console.log(`Checking Product ID: ${productId}...`);
    const res = await requestAliExpressApi("aliexpress.ds.product.get", { 
      product_id: productId,
      target_currency: "EUR",
      target_language: "FR"
    });

    const result = res?.result || res?.aliexpress_ds_product_get_response?.result;
    
    if (result && result.ae_item_base_info_dto) {
      console.log("✅ Connection Successful!");
      console.log("Product Title:", result.ae_item_base_info_dto.subject);
      console.log("You are ready for Auto-Fulfillment!");
    } else {
      console.log("❌ Failed to fetch product details. Check your credentials.");
      console.log("Response:", res);
    }
  } catch (err) {
    console.error("❌ Test Script Error:", err.message);
  }
}

testAliExpressConnection();
