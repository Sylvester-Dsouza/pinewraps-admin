const admin = require('firebase-admin');
const serviceAccount = require('../src/config/firebase-admin-sdk.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function setAdminClaim(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`Successfully set admin claim for user: ${email}`);
    
    // Get the user's ID token so we can check the claim
    const userRecord = await admin.auth().getUser(user.uid);
    console.log('User custom claims:', userRecord.customClaims);
    
  } catch (error) {
    console.error('Error setting admin claim:', error);
  } finally {
    process.exit();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

setAdminClaim(email);
