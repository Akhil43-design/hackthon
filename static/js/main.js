import { auth, db } from "../firebase_config/config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const API_URL = "https://intern-hub-orcin.vercel.app/api";

// DOM Elements
const internshipContainer = document.getElementById('internshipContainer');
const newsContainer = document.getElementById('newsContainer');
const recommendationContainer = document.getElementById('recommendationContainer');
const userNameEl = document.getElementById('userName');
const authBtn = document.getElementById('authBtn');

// Initialize State
let currentUser = null;

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        authBtn.innerText = "Sign Out";
        authBtn.onclick = () => signOut(auth).then(() => window.location.reload());

        // Fetch profile
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            userNameEl.innerText = `Hi, ${data.name || 'User'}`;
            document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${data.name}&background=random`;
            loadRecommendations(data);
        }
    } else {
        authBtn.innerText = "Sign In";
        authBtn.onclick = () => window.location.href = 'login.html';
        userNameEl.innerText = "Welcome";
        recommendationContainer.innerHTML = '<p class="text-slate-400 text-xs p-4 italic">Sign in to see personalized recommendations!</p>';
    }
});

// Load All Internships
async function loadInternships() {
    try {
        const response = await fetch(`${API_URL}/internships`);
        const internships = await response.json();

        internshipContainer.innerHTML = internships.map(intern => `
            <div class="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-all cursor-pointer" 
                 onclick="window.location.href='details.html?data=${encodeURIComponent(JSON.stringify(intern))}'">
                <div class="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=${intern.company}&background=random" class="w-8 h-8 object-contain">
                </div>
                <div class="flex-1">
                    <h4 class="text-slate-900 dark:text-slate-100 font-bold text-sm uppercase">${intern.title}</h4>
                    <p class="text-slate-500 dark:text-slate-400 text-xs">${intern.company} • ${intern.location}</p>
                </div>
                <div class="text-right">
                    <p class="text-primary font-bold text-[10px] uppercase">${intern.domain}</p>
                    <p class="text-slate-400 text-[10px]">Active</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading internships:", error);
        internshipContainer.innerHTML = '<p class="text-red-500">Failed to load internships.</p>';
    }
}

// Load Recommendations
async function loadRecommendations(profile) {
    try {
        const response = await fetch(`${API_URL}/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: profile.skills || '', domain: profile.domain || '' })
        });
        const recommendations = await response.json();

        if (recommendations.length === 0) {
            recommendationContainer.innerHTML = '<p class="text-slate-400 text-xs p-4">Add skills to your profile for matches!</p>';
            return;
        }

        recommendationContainer.innerHTML = recommendations.slice(0, 5).map(intern => `
            <div class="flex flex-col min-w-[280px] bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary transition-all cursor-pointer"
                 onclick="window.location.href='details.html?data=${encodeURIComponent(JSON.stringify(intern))}'">
                <div class="relative w-full aspect-[16/9] mb-4 overflow-hidden rounded-lg bg-slate-100">
                    <img src="https://ui-avatars.com/api/?name=${intern.company}&background=random&size=200" class="w-full h-full object-cover">
                    <div class="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        ${intern.recommendation_score} Match
                    </div>
                </div>
                <div>
                    <h3 class="text-slate-900 dark:text-slate-100 font-bold text-base line-clamp-1">${intern.title}</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mb-3">${intern.company} • ${intern.location}</p>
                    <div class="flex flex-wrap gap-2">
                        <span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-semibold rounded">${intern.domain}</span>
                        <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-semibold rounded">${intern.deadline}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading recommendations:", error);
    }
}

// Load News
async function loadNews() {
    try {
        const response = await fetch(`${API_URL}/news`);
        const news = await response.json();

        newsContainer.innerHTML = news.map(item => `
            <div class="group relative flex flex-col gap-2">
                <div class="w-full h-40 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img src="https://ui-avatars.com/api/?name=News&background=random" class="w-full h-full object-cover">
                </div>
                <p class="text-[10px] font-bold text-primary uppercase tracking-widest">Tech Update</p>
                <h3 class="text-slate-900 dark:text-slate-100 font-bold text-lg leading-snug">${item.title}</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">${item.description}</p>
                <a href="${item.link}" target="_blank" class="text-primary text-xs font-bold hover:underline">Read Story</a>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading news:", error);
    }
}

// Global Initialization
loadInternships();
loadNews();
