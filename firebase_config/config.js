// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAKt0sWnICDIHnZNPHUd5RbskXMM2XGbEE",
    authDomain: "internhub-db72e.firebaseapp.com",
    databaseURL: "https://internhub-db72e-default-rtdb.firebaseio.com",
    projectId: "internhub-db72e",
    storageBucket: "internhub-db72e.firebasestorage.app",
    messagingSenderId: "20092896820",
    appId: "1:20092896820:web:0e3799a9aea39e88a1ac61",
    measurementId: "G-270XX2Y3VG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
