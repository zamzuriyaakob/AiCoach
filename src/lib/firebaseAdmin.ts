import "server-only";
import { cert, getApps, initializeApp, App, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Helper to handle the private key newlines in Vercel/Env
const formatPrivateKey = (key: string) => {
    return key.replace(/\\n/g, "\n");
};

const getServiceAccount = (): ServiceAccount => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } catch (error) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY", error);
        }
    }

    return {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY)
            : undefined,
    };
};

const serviceAccount = getServiceAccount();

let app: App;

if (getApps().length === 0) {
    // If we have credentials, use them (Production)
    if (serviceAccount.projectId && serviceAccount.privateKey) {
        app = initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        // Fallback for local if no admin SDK keys (Might fail if not auth'd context)
        // Or if using Cloud Functions emulator
        app = initializeApp();
    }
} else {
    app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
