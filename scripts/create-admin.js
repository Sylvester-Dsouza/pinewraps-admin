const admin = require('firebase-admin');
const serviceAccount = require('../src/config/firebase-admin-sdk.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const email = 'admin@pinewraps.com';
const password = 'PineWraps@2024';

async function setupAdminUser() {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Update password
    await admin.auth().updateUser(userRecord.uid, {
      password: password,
      emailVerified: true,
      displayName: 'Pinewraps Admin',
    });

    // Set admin claim
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true
    });

    console.log('Successfully set up admin user');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', userRecord.uid);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      try {
        // Create new user if not found
        const userRecord = await admin.auth().createUser({
          email: email,
          password: password,
          emailVerified: true,
          displayName: 'Pinewraps Admin',
        });

        // Set admin claim
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          admin: true
        });

        console.log('Successfully created admin user');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('User ID:', userRecord.uid);
      } catch (createError) {
        console.error('Error creating admin user:', createError);
      }
    } else {
      console.error('Error setting up admin user:', error);
    }
    process.exit(1);
  }
}

setupAdminUser();
