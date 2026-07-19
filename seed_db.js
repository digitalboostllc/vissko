import { setSetting } from './api/db.js';

async function seed() {
  try {
    // We don't have the App Key or App Secret from the dump, so we leave them empty for the user to fill in the Admin panel
    await setSetting('ALIEXPRESS_ACCESS_TOKEN', '50000901146ze6cXzh0DhTErRf6gbygMuulglJJ3IrxDfWHPwjgpqA2aRA1b06d79fov');
    
    // Storing refresh token for future use if we build a cron
    await setSetting('ALIEXPRESS_REFRESH_TOKEN', '50001901846xUysYsqj7bEU3NuThgmwIyeztHcZGTpfNrVyMu4I5jwXOB8125903c4SN');
    
    console.log("Successfully added AliExpress Tokens to Vissko Database!");
  } catch (err) {
    console.error("Error seeding DB:", err);
  }
}
seed();
