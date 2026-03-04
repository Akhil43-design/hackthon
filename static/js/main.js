import { db } from "/firebase_config/config.js";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { API_URL } from "/static/js/config.js";

// DOM Elements
const internshipContainer = document.getElementById('internshipContainer');
const newsContainer = document.getElementById('newsContainer');
const authBtn = document.getElementById('authBtn');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize State
let currentUser = null;
let allInternships = [];
let allNews = [];
let currentFilter = 'all';

// Manual Session Check (instead of onAuthStateChanged)
function checkAuth() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (authBtn) {
            authBtn.innerText = "Sign Out";
            authBtn.onclick = () => {
                localStorage.removeItem('user');
                window.location.reload();
            };
        }
    } else {
        currentUser = null;
        if (authBtn) {
            authBtn.innerText = "Sign In";
            authBtn.onclick = () => window.location.href = 'login.html';
        }
    }
}

checkAuth();

// Skeleton Loader HTML
const getSkeletonHTML = (count = 4) => {
    return Array(count).fill(0).map(() => `
        <div class="flex-none w-[320px] bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-pulse">
            <div class="flex items-start justify-between mb-8">
                <div class="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800"></div>
                <div class="flex flex-col gap-2 items-end">
                    <div class="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                    <div class="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
            </div>
            <div class="h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4"></div>
            <div class="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-lg mb-8"></div>
            <div class="flex justify-between items-center">
                <div class="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                <div class="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
            </div>
        </div>
    `).join('');
};

// Render Functions
function renderInternships(internships) {
    if (!internshipContainer) return;
    if (internships.length === 0) {
        internshipContainer.innerHTML = `
            <div class="w-full py-12 text-center">
                <p class="text-slate-400">No internships found matching your search.</p>
                <button onclick="window.location.reload()" class="text-primary font-bold mt-2">Clear search</button>
            </div>`;
        return;
    }

    internshipContainer.innerHTML = internships.map(intern => {
        const companyMap = {
            'google': 'google.com',
            'microsoft': 'microsoft.com',
            'amazon': 'amazon.com',
            'apple': 'apple.com',
            'meta': 'meta.com',
            'netflix': 'netflix.com'
        };
        const domain = companyMap[intern.company.toLowerCase()] || `${intern.company.split(' ')[0].toLowerCase().replace(/[^a-z0-z]/g, '')}.com`;
        const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(intern.company)}&background=random&color=fff`;

        return `
            <div class="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full"
                 onclick="window.location.href='details.html?data=${encodeURIComponent(JSON.stringify(intern))}'">
                <div class="flex items-start justify-between mb-8">
                    <div class="size-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center p-2 shadow-sm border border-slate-50 dark:border-slate-700">
                        <img src="${logoUrl}" 
                             onerror="this.src='${fallbackUrl}'" 
                             class="w-full h-full object-contain rounded-xl">
                    </div>
                    <div class="flex flex-col gap-2 items-end">
                        <span class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Paid</span>
                        <span class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">${intern.location === 'Remote' ? 'Remote' : 'On-site'}</span>
                    </div>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">${intern.title}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">${intern.company} • ${intern.location}</p>
                <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                    <span class="text-xs font-semibold text-slate-400">Apply Today</span>
                    <button class="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Apply Now <span class="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter and Search Logic
function handleSearchAndFilter() {
    const searchTerm = searchInput?.value.toLowerCase() || '';

    const filtered = allInternships.filter(intern => {
        const matchesSearch =
            intern.title.toLowerCase().includes(searchTerm) ||
            intern.company.toLowerCase().includes(searchTerm) ||
            (intern.domain && intern.domain.toLowerCase().includes(searchTerm));

        const matchesFilter = currentFilter === 'all' ||
            (intern.domain && intern.domain.toLowerCase().includes(currentFilter.toLowerCase()));

        return matchesSearch && matchesFilter;
    });

    renderInternships(filtered);
}

// Load Data
async function loadInternships() {
    if (!internshipContainer) return;

    // Use more skeletons for the dedicated board
    const skeletonCount = window.location.pathname.includes('internships.html') ? 6 : 4;
    internshipContainer.innerHTML = getSkeletonHTML(skeletonCount);

    try {
        const response = await fetch(`${API_URL}/internships`);
        allInternships = await response.json();
        renderInternships(allInternships);
        console.log("✅ Internships loaded successfully from all sources");
    } catch (error) {
        console.error("Error loading internships:", error);
        internshipContainer.innerHTML = '<p class="text-red-500 p-8 col-span-full text-center">Failed to load internships. Please try again.</p>';
    }
}

async function loadNews() {
    if (!newsContainer) return;
    try {
        const response = await fetch(`${API_URL}/news`);
        allNews = await response.json();

        newsContainer.innerHTML = allNews.map(item => `
            <div class="flex-none w-[280px] group bg-white dark:bg-slate-900 rounded-[1.25rem] overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800 flex flex-col snap-center">
                <div class="aspect-[16/10] w-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                    <img src="${item.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000'}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <p class="absolute bottom-3 left-4 text-[9px] font-black text-white uppercase tracking-widest opacity-90">Insights</p>
                </div>
                <div class="p-5 flex-1 flex flex-col">
                    <h3 class="text-base font-bold leading-tight text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">${item.title}</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">${item.description}</p>
                    <a href="${item.link}" target="_blank" class="text-primary text-[11px] font-black flex items-center gap-1 hover:gap-2 transition-all mt-auto uppercase tracking-wider">
                        Quick Read <span class="material-symbols-outlined text-xs">arrow_forward</span>
                    </a>
                </div>
            </div>
        `).join('');

        // Wire up news scroll buttons
        const newsLeft = document.getElementById('newsScrollLeft');
        const newsRight = document.getElementById('newsScrollRight');
        if (newsLeft && newsRight) {
            newsLeft.onclick = () => newsContainer.scrollBy({ left: -300, behavior: 'smooth' });
            newsRight.onclick = () => newsContainer.scrollBy({ left: 300, behavior: 'smooth' });
        }
    } catch (error) {
        console.error("Error loading news:", error);
    }
}

// Event Listeners
searchInput?.addEventListener('input', handleSearchAndFilter);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
            b.classList.remove('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/20');
            b.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-400', 'border');
        });

        btn.classList.add('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/20');
        btn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-400', 'border');

        currentFilter = btn.dataset.domain;
        handleSearchAndFilter();
    });
});

// Bookmark Functions
export async function toggleBookmark(id) {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const starBtn = document.querySelector(`[onclick^="toggleBookmark"]`);
    // Note: Since the ID is passed directly, we'll find the button by ID in a real scenario
    // For now, let's just use the Firestore logic

    try {
        const bookmarkRef = doc(db, "users", currentUser.id, "bookmarks", id);
        // Checking if already bookmarked requires state or a query
        // For simplicity, let's just toggle or use a check function
        const isBookmarked = await checkIsBookmarked(id);

        if (isBookmarked) {
            await deleteDoc(bookmarkRef);
            console.log("✅ Bookmark removed");
        } else {
            await setDoc(bookmarkRef, {
                internshipId: id,
                savedAt: serverTimestamp()
            });
            console.log("✅ Bookmark added");
        }
        return !isBookmarked;
    } catch (error) {
        console.error("Error toggling bookmark:", error);
        throw error;
    }
}

async function checkIsBookmarked(id) {
    if (!currentUser) return false;
    try {
        const docSnap = await getDoc(doc(db, "users", currentUser.id, "bookmarks", id));
        return docSnap.exists();
    } catch (error) {
        return false;
    }
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
async function init() {
    await loadInternships();
    await loadNews();

    const nContainer = document.getElementById('newsContainer');
    if (nContainer) initAutoScroll(nContainer);
}

init();
