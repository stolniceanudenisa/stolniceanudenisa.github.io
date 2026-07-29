function toggleMenu() { document.getElementById('navLinks').classList.toggle('active'); }

// IntersectionObserver for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

function setupSectionAnimations() {
    document.querySelectorAll('section').forEach(section => {
        // Skip the hero section — it's already visible in the viewport on load,
        // so animating it causes a flash where it disappears then fades back in
        if (section.classList.contains('hero')) return;
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (scrollY >= section.offsetTop - 200) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.style.color = link.getAttribute('href').slice(1) === current ? 'var(--accent-green)' : '';
    });
});

function showTab(category) {
    document.querySelectorAll('.writeup-card').forEach(card => {
        card.style.display = (category === 'all' || card.dataset.category === category) ? 'block' : 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    let bgColor = 'var(--accent-green)';
    if (type === 'error') bgColor = 'var(--accent-red)';
    if (type === 'info') bgColor = 'var(--accent-cyan)';

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: var(--bg-primary);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, type === 'info' ? 5000 : 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load profile data from JSON and populate all sections
async function loadProfileData() {
    try {
        const response = await fetch('/profile-data.json', { cache: 'no-cache' });
        if (!response.ok) {
            console.warn('Could not load profile data:', response.status);
            return;
        }
        const data = await response.json();

        // Hero section
        const heroName = document.getElementById('heroName');
        if (heroName && data.name) heroName.textContent = data.name;

        const heroRole = document.getElementById('heroRole');
        if (heroRole && data.heroRole) {
            const parts = data.heroRole.split(' & ');
            heroRole.innerHTML = '<span>' + escapeHtml(parts[0]) + '</span>' + (parts.length > 1 ? ' & ' + escapeHtml(parts.slice(1).join(' & ')) : '');
        }

        const heroDesc = document.getElementById('heroDescription');
        if (heroDesc && data.heroDescription) heroDesc.textContent = data.heroDescription;

        // About section
        if (data.about) {
            const aboutText = document.getElementById('aboutText');
            if (aboutText) {
                aboutText.innerHTML = data.about
                    .map(function(p) { return '<p>' + escapeHtml(p) + '</p>'; })
                    .join('');
            }
        }

        // Links section
        if (data.links) {
            const linksGrid = document.getElementById('linksGrid');
            if (linksGrid) {
                linksGrid.innerHTML = data.links.map(function(link) {
                    return '<a href="' + escapeHtml(link.url) + '" class="link-card" target="_blank" rel="noopener noreferrer">' +
                        '<div class="link-icon">' + link.icon + '</div>' +
                        '<div class="link-content">' +
                            '<h3 class="link-title">' + escapeHtml(link.title) + '</h3>' +
                            '<p class="link-description">' + escapeHtml(link.description) + '</p>' +
                        '</div>' +
                    '</a>';
                }).join('');
            }
        }

        // Skills section
        if (data.skills) {
            const skillsGrid = document.getElementById('skillsGrid');
            if (skillsGrid) {
                skillsGrid.innerHTML = data.skills.map(function(skill) {
                    var tagsHtml = skill.tags.map(function(tag) {
                        return '<span class="skill-tag">' + escapeHtml(tag) + '</span>';
                    }).join('');
                    return '<div class="skill-category">' +
                        '<h3>' + escapeHtml(skill.category) + '</h3>' +
                        '<div class="skill-tags">' + tagsHtml + '</div>' +
                    '</div>';
                }).join('');
            }
        }

        // Certifications section
        if (data.certifications) {
            const certsGrid = document.getElementById('certsGrid');
            if (certsGrid) {
                var issuerLogos = data.issuerLogos || {};
                certsGrid.innerHTML = data.certifications.map(function(cert) {
                    var logo = issuerLogos[cert.issuer] || {};
                    var badgeSrc = cert.badgeImage || logo.src;
                    var badgeHtml = badgeSrc
                        ? '<div class="cert-badge-wrap"><img class="cert-badge' + (cert.badgeImage ? '' : ' cert-badge--brand') + '" src="' + escapeHtml(badgeSrc) + '" alt="' + escapeHtml(cert.shortName) + ' badge" loading="lazy" onerror="this.style.display=\'none\'"></div>'
                        : '';
                    var logoHtml = logo.src
                        ? '<img class="issuer-logo" src="' + escapeHtml(logo.src) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
                        : '';
                    return '<div class="cert-card">' + badgeHtml +
                        '<h4>' + escapeHtml(cert.shortName) + ' - ' + escapeHtml(cert.fullName) + '</h4>' +
                        '<div class="cert-buttons">' +
                            '<a href="' + escapeHtml(cert.certUrl) + '" target="_blank" rel="noopener noreferrer" class="cert-btn cert-personal" title="My ' + escapeHtml(cert.shortName) + ' Certificate">My Cert</a>' +
                            '<a href="' + escapeHtml(cert.examUrl) + '" target="_blank" rel="noopener noreferrer" class="cert-btn cert-official" title="' + escapeHtml(cert.issuerFull) + ' ' + escapeHtml(cert.shortName) + ' Exam">Exam Info</a>' +
                        '</div>' +
                        '<div class="issuer">' + logoHtml + escapeHtml(cert.issuerFull) + '</div>' +
                    '</div>';
                }).join('');
            }
        }

        // Experience section
        if (data.experience && data.experience.length > 0) {
            const timeline = document.querySelector('#experience .timeline');
            if (timeline) {
                timeline.innerHTML = '';
                data.experience.forEach(function(exp) {
                    var timelineItem = document.createElement('div');
                    timelineItem.className = 'timeline-item';

                    var dateRange = exp.current ?
                        exp.startDate + ' - Present' :
                        exp.startDate + ' - ' + exp.endDate;

                    var responsibilities = exp.responsibilities
                        .map(function(resp) { return '&bull; ' + escapeHtml(resp); })
                        .join('<br>');

                    timelineItem.innerHTML =
                        '<div class="timeline-date">' + escapeHtml(dateRange) + '</div>' +
                        '<div class="timeline-title">' + escapeHtml(exp.title) + '</div>' +
                        '<div class="timeline-company">' + escapeHtml(exp.company) + ' &bull; ' + escapeHtml(exp.location) + '</div>' +
                        '<div class="timeline-description">' + responsibilities + '</div>';

                    timeline.appendChild(timelineItem);
                });
            }
        }

        // Contact section
        var contactLinks = document.getElementById('contactLinks');
        if (contactLinks) {
            var html = '';
            if (data.email) {
                html += '<a href="mailto:' + escapeHtml(data.email) + '" class="contact-link"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><span>' + escapeHtml(data.email) + '</span></a>';
            }
            if (data.linkedin) {
                html += '<a href="' + escapeHtml(data.linkedin) + '" class="contact-link" target="_blank"><svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg><span>LinkedIn</span></a>';
            }
            contactLinks.innerHTML = html;
        }

        // Terminal certifications
        if (data.certifications) {
            var terminalCerts = document.getElementById('terminalCerts');
            if (terminalCerts) {
                terminalCerts.innerHTML = data.certifications.map(function(cert) {
                    var padded = (cert.shortName + '                ').slice(0, 16);
                    return '<div class="terminal-line output-cert">' + padded + '- ' + escapeHtml(cert.fullName) + '</div>';
                }).join('');
            }
        }

        console.log('Profile data loaded successfully');
    } catch (error) {
        console.error('Error loading profile data:', error);
    }

    // After content is loaded, set up fade-in animations on all sections
    // This ensures the observer fires AFTER sections have content and real height
    setupSectionAnimations();
}

// Load profile data when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProfileData);
} else {
    loadProfileData();
}
