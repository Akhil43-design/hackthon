const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    loadInternships();
    loadNews();
});

async function loadInternships() {
    const container = document.getElementById('internshipContainer');
    try {
        const response = await fetch(`${API_BASE_URL}/internships`);
        const data = await response.json();

        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = '<p>No internships found.</p>';
            return;
        }

        data.forEach(intern => {
            container.innerHTML += createInternshipCard(intern);
        });
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

function createInternshipCard(intern) {
    const daysRemaining = calculateDeadline(intern.deadline);
    let deadlineBadge = '';

    if (daysRemaining !== null) {
        if (daysRemaining <= 5 && daysRemaining >= 0) {
            deadlineBadge = `<span class="deadline-tag">Deadline in ${daysRemaining} days</span>`;
        } else if (daysRemaining < 0) {
            deadlineBadge = `<span class="deadline-tag" style="background: #e2e8f0; color: #64748b;">Closed</span>`;
        }
    }

    return `
        <div class="card internship-card">
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
                <a href="${intern.apply_link}" class="apply-btn" target="_blank">Apply Now</a>
            </div>
        </div>
    `;
}

function calculateDeadline(deadlineStr) {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
