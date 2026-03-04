import { auth, db } from "../firebase_config/config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const API_BASE_URL = '/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    // Monitor Auth State
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            updateAuthUI(true);
            loadRecommendations(user.uid);
        } else {
            currentUser = null;
            updateAuthUI(false);
        }
    });

    loadInternships();
    loadNews();
});

function updateAuthUI(isLoggedIn) {
    const authActions = document.querySelector('.auth-actions');
    if (!authActions) return;

    if (isLoggedIn) {
        authActions.innerHTML = `
            <span style="margin-right: 1rem; font-weight: 600; color: var(--secondary);">Welcome Back</span>
            <button class="auth-btn" id="logoutBtn" style="background-color: var(--secondary);">Sign Out</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
    } else {
        authActions.innerHTML = `
            <a href="login.html" class="auth-btn">Sign In</a>
            <a href="signup.html" class="auth-btn" style="background-color: var(--secondary); margin-left: 0.5rem;">Sign Up</a>
        `;
    }
}

async function loadRecommendations(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const response = await fetch(`${API_BASE_URL}/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const recommendations = await response.json();

            if (recommendations.length > 0) {
                const container = document.getElementById('internshipContainer');

                // Remove existing recommendation section if any
                const existingRec = document.getElementById('recommendationSection');
                if (existingRec) existingRec.remove();

                const recSection = document.createElement('div');
                recSection.id = 'recommendationSection';
                recSection.innerHTML = `
                    <h2 style="color: var(--accent); margin-top: 2rem;">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                         Recommended for You
                    </h2>
                    <div id="recommendationList"></div>
                `;
                container.prepend(recSection);

                const list = document.getElementById('recommendationList');
                recommendations.forEach(intern => {
                    list.innerHTML += createInternshipCard(intern, true);
                });
            }
        }
    } catch (error) {
        console.error("Error loading recommendations:", error);
    }
}

async function bookmarkInternship(internId, internData) {
    if (!currentUser) {
        alert("Please sign in to bookmark internships.");
        window.location.href = "login.html";
        return;
    }

    try {
        await addDoc(collection(db, "bookmarks"), {
            user_id: currentUser.uid,
            internship_id: internId,
            internship_data: internData,
            saved_at: serverTimestamp()
        });
        alert("Internship bookmarked!");
    } catch (error) {
        console.error("Error saving bookmark:", error);
    }
}

async function loadInternships() {
    const container = document.getElementById('internshipContainer');
    try {
        const response = await fetch(`${API_BASE_URL}/internships`);
        const data = await response.json();

        // Don't clear if recommendations are there
        const listContainer = document.createElement('div');
        listContainer.id = 'allInternshipsList';

        if (data.length === 0) {
            listContainer.innerHTML = '<p>No internships found.</p>';
        } else {
            data.forEach(intern => {
                listContainer.innerHTML += createInternshipCard(intern);
            });
        }

        const existingList = document.getElementById('allInternshipsList');
        if (existingList) existingList.replaceWith(listContainer);
        else container.appendChild(listContainer);

    } catch (error) {
        console.error('Error loading internships:', error);
        container.innerHTML = '<p>Error loading internships. Please try again later.</p>';
    }
}

async function loadNews() {
    const container = document.getElementById('newsContainer');
    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const data = await response.json();

        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = '<p>No news available.</p>';
            return;
        }

        data.forEach(item => {
            container.innerHTML += `
                <div class="card news-card">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <a href="${item.link}" target="_blank">Read more &rarr;</a>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = '<p>Error loading news.</p>';
    }
}

function createInternshipCard(intern, isRecommended = false) {
    const daysRemaining = calculateDeadline(intern.deadline);
    let deadlineBadge = '';

    if (daysRemaining !== null) {
        if (daysRemaining <= 5 && daysRemaining >= 0) {
            deadlineBadge = `<span class="deadline-tag">Deadline in ${daysRemaining} days</span>`;
        } else if (daysRemaining < 0) {
            deadlineBadge = `<span class="deadline-tag" style="background: #e2e8f0; color: #64748b;">Closed</span>`;
        }
    }

    const cardClass = isRecommended ? 'card internship-card recommended' : 'card internship-card';

    return `
        <div class="${cardClass}" style="${isRecommended ? 'border-left-color: var(--accent);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h3>${intern.title}</h3>
                    <span class="company-name">${intern.company}</span>
                </div>
                ${deadlineBadge}
            </div>
            <div class="meta-info">
                <span>📍 ${intern.location}</span>
                <span>💼 ${intern.domain}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--secondary);">Source: ${intern.source}</span>
                <div>
                    <button onclick="bookmarkInternship('${intern.id || Math.random()}', ${JSON.stringify(intern).replace(/"/g, '&quot;')})" style="background: none; border: none; cursor: pointer; color: var(--secondary); margin-right: 0.5rem;" title="Bookmark">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                    <a href="${intern.apply_link}" class="apply-btn" target="_blank">Apply Now</a>
                </div>
            </div>
        </div>
    `;
}

// Global scope for onclick
window.bookmarkInternship = bookmarkInternship;

function calculateDeadline(deadlineStr) {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
