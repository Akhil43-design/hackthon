// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD7vjsXWM3pLbl3hiY1V2djxZ-HZAZyf2s",
    authDomain: "intern-dc6a7.firebaseapp.com",
    databaseURL: "https://intern-dc6a7-default-rtdb.firebaseio.com",
    projectId: "intern-dc6a7",
    storageBucket: "intern-dc6a7.firebasestorage.app",
    messagingSenderId: "874712769258",
    appId: "1:874712769258:web:cc45dab25669875efe2d93"
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
