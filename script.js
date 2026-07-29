/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const navigationToggle = document.getElementById("navigationToggle");
const navigationLinks = document.getElementById("navigationLinks");

function toggleNavigation() {
    if (!navigationToggle || !navigationLinks) {
        return;
    }

    const isOpen = navigationLinks.classList.toggle("active");

    navigationToggle.setAttribute("aria-expanded", String(isOpen));
    navigationToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );

    navigationToggle.textContent = isOpen ? "✕" : "☰";
}

if (navigationToggle) {
    navigationToggle.addEventListener("click", toggleNavigation);
}


/* Close the mobile menu after selecting a link */

if (navigationLinks) {
    navigationLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navigationLinks.classList.remove("active");

            if (navigationToggle) {
                navigationToggle.setAttribute("aria-expanded", "false");
                navigationToggle.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );
                navigationToggle.textContent = "☰";
            }
        });
    });
}


/* Close the mobile menu when clicking outside it */

document.addEventListener("click", (event) => {
    if (!navigationToggle || !navigationLinks) {
        return;
    }

    const clickedInsideMenu = navigationLinks.contains(event.target);
    const clickedToggle = navigationToggle.contains(event.target);

    if (
        navigationLinks.classList.contains("active") &&
        !clickedInsideMenu &&
        !clickedToggle
    ) {
        navigationLinks.classList.remove("active");
        navigationToggle.setAttribute("aria-expanded", "false");
        navigationToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );
        navigationToggle.textContent = "☰";
    }
});


/* Close the mobile menu when Escape is pressed */

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        navigationLinks?.classList.contains("active")
    ) {
        navigationLinks.classList.remove("active");

        if (navigationToggle) {
            navigationToggle.setAttribute("aria-expanded", "false");
            navigationToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );
            navigationToggle.textContent = "☰";
            navigationToggle.focus();
        }
    }
});


/* =========================================================
   ACTIVE NAVIGATION LINK
========================================================= */

function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const currentPage =
        currentPath.split("/").filter(Boolean).pop() || "index.html";

    document.querySelectorAll(".navigation-links a").forEach((link) => {
        const href = link.getAttribute("href");

        if (!href || href.startsWith("http") || href.startsWith("mailto:")) {
            return;
        }

        const normalisedHref = href
            .replace("./", "")
            .replace(/\/$/, "");

        const isHomePage =
            (currentPage === "index.html" || currentPath.endsWith("/")) &&
            normalisedHref === "index.html";

        const isCurrentPage =
            normalisedHref === currentPage ||
            currentPath.includes(`/${normalisedHref}/`) ||
            isHomePage;

        link.classList.toggle("active", isCurrentPage);
    });
}

highlightCurrentPage();


/* =========================================================
   PROFILE DATA
========================================================= */

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}


async function loadProfileData() {
    try {
        const response = await fetch("./profile-data.json", {
            cache: "no-cache"
        });

        if (!response.ok) {
            console.warn(
                `Profile data could not be loaded: ${response.status}`
            );

            setupPageAnimations();
            return;
        }

        const profile = await response.json();

        updateProfileHeader(profile);
        updateConsoleCertifications(profile);
        updateFeaturedCertifications(profile);
        updateFooter(profile);

        console.info("Profile data loaded successfully.");
    } catch (error) {
        console.error("Error loading profile data:", error);
    } finally {
        setupPageAnimations();
    }
}


/* =========================================================
   HERO PROFILE INFORMATION
========================================================= */

function updateProfileHeader(profile) {
    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    const profileDescription =
        document.getElementById("profileDescription");

    if (profileName && profile.name) {
        profileName.textContent = profile.name;
    }

    if (profileRole) {
        const primaryRole =
            profile.heroRolePrimary ||
            profile.primaryRole ||
            "Cybersecurity Enthusiast";

        const secondaryRole =
            profile.heroRoleSecondary ||
            profile.secondaryRole ||
            "Data Engineer";

        profileRole.innerHTML =
            `<span>${escapeHtml(primaryRole)}</span>` +
            ` & ${escapeHtml(secondaryRole)}`;
    }

    if (profileDescription && profile.heroDescription) {
        profileDescription.textContent = profile.heroDescription;
    }
}


/* =========================================================
   TERMINAL CERTIFICATIONS
========================================================= */

function updateConsoleCertifications(profile) {
    const consoleCertifications =
        document.getElementById("consoleCertifications");

    if (
        !consoleCertifications ||
        !Array.isArray(profile.certifications)
    ) {
        return;
    }

    const terminalCertifications = profile.certifications
        .filter((certification) => certification.featured !== false)
        .slice(0, 6);

    consoleCertifications.innerHTML = terminalCertifications
        .map((certification) => {
            const shortName =
                certification.shortName ||
                certification.name ||
                "Credential";

            const fullName =
                certification.fullName ||
                certification.name ||
                "";

            return `
                <div class="console-result console-certificate">
                    ${escapeHtml(shortName)}
                    <span>— ${escapeHtml(fullName)}</span>
                </div>
            `;
        })
        .join("");
}


/* =========================================================
   FEATURED CERTIFICATION CARDS
========================================================= */

function updateFeaturedCertifications(profile) {
    const credentialCards =
        document.querySelector(".credential-cards");

    if (
        !credentialCards ||
        !Array.isArray(profile.certifications)
    ) {
        return;
    }

    const featuredCertifications = profile.certifications
        .filter((certification) => certification.featured !== false)
        .slice(0, 4);

    if (featuredCertifications.length === 0) {
        return;
    }

    credentialCards.innerHTML = featuredCertifications
        .map((certification) => {
            const shortName =
                certification.shortName ||
                certification.name ||
                "Credential";

            const fullName =
                certification.fullName ||
                certification.name ||
                "Certification";

            const issuer =
                certification.issuer ||
                "Certification provider";

            const credentialUrl =
                certification.credentialUrl ||
                certification.certUrl ||
                "#";

            const badgeImage = certification.badgeImage
                ? `
                    <img
                        src="${escapeHtml(certification.badgeImage)}"
                        alt="${escapeHtml(shortName)} certification badge"
                        loading="lazy"
                        onerror="this.parentElement.textContent='${escapeHtml(shortName)}'"
                    >
                `
                : escapeHtml(shortName);

            const linkText =
                credentialUrl === "#"
                    ? "Add credential link"
                    : "View credential";

            return `
                <article class="credential-card">
                    <div class="credential-image-placeholder">
                        ${badgeImage}
                    </div>

                    <div class="credential-details">
                        <p class="credential-provider">
                            ${escapeHtml(issuer)}
                        </p>

                        <h3>
                            ${escapeHtml(fullName)}
                        </h3>

                        <a
                            href="${escapeHtml(credentialUrl)}"
                            class="credential-link"
                            ${credentialUrl !== "#"
                                ? 'target="_blank" rel="noopener noreferrer"'
                                : ""}
                        >
                            ${escapeHtml(linkText)}
                        </a>
                    </div>
                </article>
            `;
        })
        .join("");
}


/* =========================================================
   FOOTER YEAR
========================================================= */

function updateFooter(profile = {}) {
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    const footerName = document.querySelector(
        ".site-footer .footer-wrapper p:first-child"
    );

    if (footerName && profile.name) {
        footerName.innerHTML =
            `© <span id="currentYear">${new Date().getFullYear()}</span> ` +
            escapeHtml(profile.name);
    }
}


/* =========================================================
   SECTION REVEAL ANIMATIONS
========================================================= */

const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("section-visible");
            observer.unobserve(entry.target);
        });
    },
    {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    }
);


function setupPageAnimations() {
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const sections = document.querySelectorAll(
        "main section:not(.intro-section)"
    );

    sections.forEach((section) => {
        if (prefersReducedMotion) {
            section.classList.add("section-visible");
            return;
        }

        section.classList.add("section-hidden");
        sectionObserver.observe(section);
    });

    animateCards(
        ".focus-card, .credential-card, .info-card"
    );
}


function animateCards(selector) {
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const cards = document.querySelectorAll(selector);

    cards.forEach((card, index) => {
        if (prefersReducedMotion) {
            card.classList.add("card-visible");
            return;
        }

        card.classList.add("card-hidden");
        card.style.transitionDelay = `${index * 80}ms`;

        const cardObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("card-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12
            }
        );

        cardObserver.observe(card);
    });
}


/* =========================================================
   TERMINAL TYPING EFFECT
========================================================= */

function animateTerminalCommands() {
    const commands = document.querySelectorAll(".console-command");

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
        return;
    }

    commands.forEach((command, index) => {
        const originalText = command.textContent.trim();

        command.textContent = "";

        setTimeout(() => {
            typeText(command, originalText, 30);
        }, 400 + index * 900);
    });
}


function typeText(element, text, speed = 30) {
    let characterIndex = 0;

    function typeNextCharacter() {
        if (characterIndex >= text.length) {
            return;
        }

        element.textContent += text.charAt(characterIndex);
        characterIndex += 1;

        window.setTimeout(typeNextCharacter, speed);
    }

    typeNextCharacter();
}


/* =========================================================
   EXTERNAL LINK SAFETY
========================================================= */

function secureExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
        link.setAttribute("rel", "noopener noreferrer");
    });
}


/* =========================================================
   PAGE INITIALISATION
========================================================= */

async function initialiseWebsite() {
    secureExternalLinks();
    await loadProfileData();
    animateTerminalCommands();
}


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseWebsite);
} else {
    initialiseWebsite();
}
