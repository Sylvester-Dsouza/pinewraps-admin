const { initializeApp: initializeAdminApp } = require('firebase-admin/app');
const { getAuth: getAdminAuth } = require('firebase-admin/auth');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin SDK
const serviceAccount = require('../../pinewraps-api/firebase-service-account.json');
const adminApp = initializeAdminApp({
  credential: require('firebase-admin/app').cert(serviceAccount)
});
const adminAuth = getAdminAuth(adminApp);

async function createAdmin() {
  try {
    const email = 'admin@pinewraps.com';
    const password = 'admin123';

    // Create user directly with Firebase Admin SDK
    try {
      const userRecord = await adminAuth.createUser({
        email,
        password,
        emailVerified: true
      });
      console.log('Admin user created successfully:', userRecord.email);

      // Set admin claims immediately
      await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });
      console.log('Admin claims set for user:', email);

      console.log('\nAdmin user setup complete!');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('\nPlease change the password after first login.');

    } catch (error: any) {
      if (error?.code === 'auth/email-already-exists') {
        console.log('Admin user already exists');
        const userRecord = await adminAuth.getUserByEmail(email);
        
        // Ensure admin claims are set
        await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });
        console.log('Admin claims verified for existing user:', email);
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
