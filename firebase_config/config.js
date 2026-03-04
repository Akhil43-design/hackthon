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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use long polling for better resilience against ad-blockers/proxies
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});

console.log("✅ Firebase initialized successfully");

export { auth, db, app };
