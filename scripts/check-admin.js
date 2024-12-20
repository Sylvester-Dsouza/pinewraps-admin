const admin = require('firebase-admin');
const serviceAccount = require('../src/config/firebase-admin-sdk.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const email = 'admin@pinewraps.com';

async function checkAdminUser() {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log('User found:', {
      uid: user.uid,
      email: user.email,
      customClaims: user.customClaims
    });

    // Set admin claim if not set
    if (!user.customClaims?.admin) {
      console.log('Setting admin claim...');
      await admin.auth().setCustomUserClaims(user.uid, {
        admin: true
      });
      
      // Verify the claims were set
      const updatedUser = await admin.auth().getUser(user.uid);
      console.log('Updated claims:', updatedUser.customClaims);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdminUser();
