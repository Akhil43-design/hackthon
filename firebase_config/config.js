// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6ymLyrNqs6Qp6G9SfsukqKQaJy2neWow",
    authDomain: "dti-546a5.firebaseapp.com",
    databaseURL: "https://dti-546a5-default-rtdb.firebaseio.com",
    projectId: "dti-546a5",
    storageBucket: "dti-546a5.firebasestorage.app",
    messagingSenderId: "401729176511",
    appId: "1:401729176511:web:3742a0a5dbab8b3471970a",
    measurementId: "G-5E0GG6ZCEW"
};

let app, auth, db;

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Hardened Firestore initialization to bypass aggressive ad-blockers and connection issues
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true
    });

    console.log("✅ Firebase initialized successfully");
    console.log("🔗 Firestore connected with long-polling mode enabled");
} catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    if (error.message.includes("API is disabled")) {
        console.error("🚨 CRITICAL: Firestore API is disabled in the Google Cloud Console.");
    }
}

export { auth, db, app };
