import { auth, db } from "/firebase_config/config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const API_URL = "https://intern-hub-orcin.vercel.app/api";

// DOM Elements
const internshipContainer = document.getElementById('internshipContainer');
const newsContainer = document.getElementById('newsContainer');
const authBtn = document.getElementById('authBtn');

// Initialize State
let currentUser = null;

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        if (authBtn) {
            authBtn.innerText = "Sign Out";
            authBtn.onclick = () => signOut(auth).then(() => window.location.reload());
        }
    } else {
        currentUser = null;
        if (authBtn) {
            authBtn.innerText = "Sign In";
            authBtn.onclick = () => window.location.href = 'login.html';
        }
    }
});

// Load All Internships
async function loadInternships() {
    if (!internshipContainer) return;
    try {
        const response = await fetch(`${API_URL}/internships`);
        const internships = await response.json();

        internshipContainer.innerHTML = internships.map(intern => `
            <div class="flex-none w-[320px] bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-all cursor-pointer snap-center group"
                 onclick="window.location.href='details.html?data=${encodeURIComponent(JSON.stringify(intern))}'">
                <div class="flex items-start justify-between mb-8">
                    <div class="size-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-3 shadow-inner">
                        <img src="https://ui-avatars.com/api/?name=${intern.company}&background=random" class="w-full h-full object-contain">
                    </div>
                    <div class="flex flex-col gap-2 items-end">
                        <span class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Paid</span>
                        <span class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">${intern.location === 'Remote' ? 'Remote' : 'On-site'}</span>
                    </div>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">${intern.title}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">${intern.company} • ${intern.location}</p>
                <div class="flex items-center justify-between mt-auto">
                    <span class="text-xs font-semibold text-slate-400">Posted 2d ago</span>
                    <button class="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Apply Now <span class="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading internships:", error);
        internshipContainer.innerHTML = '<p class="text-red-500 p-8">Failed to load internships.</p>';
    }
}

// Load News
async function loadNews() {
    if (!newsContainer) return;
    try {
        const response = await fetch(`${API_URL}/news`);
        const news = await response.json();

        newsContainer.innerHTML = news.map(item => `
            <div class="group bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 flex flex-col">
                <div class="aspect-video w-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=random&size=400" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                    <p class="text-[10px] font-bold text-primary mb-3 uppercase tracking-widest">Tech Update</p>
                    <h3 class="text-lg font-bold leading-tight text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">${item.title}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 flex-1">${item.description}</p>
                    <a href="${item.link}" target="_blank" class="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                        Read Story <span class="material-symbols-outlined text-sm">arrow_right_alt</span>
                    </a>
                </div>
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

    const internId = btoa(`${internship.company}-${internship.title}`).replace(/[/+=]/g, '');
    const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks`, internId);

    try {
        const docSnap = await getDoc(bookmarkRef);
        if (docSnap.exists()) {
            await deleteDoc(bookmarkRef);
            return false;
        } else {
            await setDoc(bookmarkRef, {
                ...internship,
                savedAt: new Date().toISOString()
            });
            return true;
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

// Auto-Scroll Logic
function initAutoScroll(container) {
    let scrollInterval;
    let isPaused = false;

    const startScrolling = () => {
        scrollInterval = setInterval(() => {
            if (isPaused) return;

            const maxScroll = container.scrollWidth - container.clientWidth;
            if (container.scrollLeft >= maxScroll - 1) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: 300, behavior: 'smooth' });
            }
        }, 4000);
    };

    container.addEventListener('mouseenter', () => isPaused = true);
    container.addEventListener('mouseleave', () => isPaused = false);
    container.addEventListener('touchstart', () => isPaused = true);
    container.addEventListener('touchend', () => isPaused = false);

    startScrolling();
}

// Global Initialization
loadInternships().then(() => {
    const internContainer = document.getElementById('internshipContainer');
    if (internContainer) initAutoScroll(internContainer);
});

loadNews().then(() => {
    const nContainer = document.getElementById('newsContainer');
    // For the news grid, we don't necessarily want auto-scroll if it's not a flex-row anymore.
    // However, the requested index.html has news in a grid.
    // If the grid becomes a carousel on mobile, we might want it.
    // For now, I'll only enable it if it's a horizontal container.
    if (nContainer && nContainer.classList.contains('overflow-x-auto')) {
        initAutoScroll(nContainer);
    }
});
