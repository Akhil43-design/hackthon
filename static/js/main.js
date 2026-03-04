import { auth, db } from "/firebase_config/config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
            <div class="flex flex-col min-w-[280px] bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 snap-center"
                 onclick="window.location.href='details.html?data=${encodeURIComponent(JSON.stringify(intern))}'">
                <div class="flex justify-between items-start mb-4">
                    <div class="size-12 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center p-2">
                        <img src="https://ui-avatars.com/api/?name=${intern.company}&background=random" class="w-full h-full object-contain">
                    </div>
                    <span class="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                </div>
                <h3 class="text-slate-900 dark:text-slate-100 font-bold text-lg mb-1 leading-tight">${intern.title}</h3>
                <p class="text-slate-500 text-xs mb-4">${intern.company} • ${intern.location}</p>
                
                <div class="flex flex-wrap gap-2 mb-6">
                    <span class="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">${intern.location === 'Remote' ? 'Remote' : 'On-site'}</span>
                    <span class="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">$5,000 / mo</span>
                    <span class="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">Full-time</span>
                </div>

                <a href="${intern.apply_link}" target="_blank" onclick="event.stopPropagation()" class="w-full bg-primary text-white text-center py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 transition-transform active:scale-95">
                    Apply Now
                </a>
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
            <div class="flex flex-col min-w-[280px] bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 snap-center">
                <div class="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-100">
                    <img src="https://ui-avatars.com/api/?name=${item.title}&background=random&size=300" class="w-full h-full object-cover">
                </div>
                <h3 class="text-slate-900 dark:text-slate-100 font-bold text-base mb-2 leading-tight">${item.title}</h3>
                <p class="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-2">${item.description}</p>
                <a href="${item.link}" target="_blank" class="w-full bg-slate-50 text-primary text-center py-3 rounded-full font-bold text-sm">
                    Read More
                </a>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading news:", error);
    }
}

// Bookmark Logic
export async function toggleBookmark(internship) {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Use a unique ID based on company and title
    const internId = btoa(`${internship.company}-${internship.title}`).replace(/[/+=]/g, '');
    const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks`, internId);

    try {
        const docSnap = await getDoc(bookmarkRef);
        if (docSnap.exists()) {
            await deleteDoc(bookmarkRef);
            return false; // Unbookmarked
        } else {
            await setDoc(bookmarkRef, {
                ...internship,
                savedAt: new Date().toISOString()
            });
            return true; // Bookmarked
        }
    } catch (error) {
        console.error("Error toggling bookmark:", error);
        throw error;
    }
}

export async function isBookmarked(internship) {
    if (!currentUser) return false;
    const internId = btoa(`${internship.company}-${internship.title}`).replace(/[/+=]/g, '');
    const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks`, internId);
    const docSnap = await getDoc(bookmarkRef);
    return docSnap.exists();
}

// Global Initialization
loadInternships();
loadNews();
