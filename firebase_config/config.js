// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAKt0sWnICDIHnZNPHUd5RbskXMM2XGbEE",
    authDomain: "internhub-db72e.firebaseapp.com",
    databaseURL: "https://internhub-db72e-default-rtdb.firebaseio.com",
    projectId: "internhub-db72e",
    storageBucket: "internhub-db72e.firebasestorage.app",
    messagingSenderId: "20092896820",
    appId: "1:20092896820:web:0e3799a9aea39e88a1ac61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("🔥 Firebase Config: Initializing Firestore with Long Polling fix...");

// Hardened Firestore initialization to bypass aggressive ad-blockers
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});

export { auth, db };
