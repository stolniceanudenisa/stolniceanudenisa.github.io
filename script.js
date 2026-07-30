(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const list = (value) => (Array.isArray(value) ? value : []);
  const clean = (value) => (value == null ? "" : String(value));
  const escapeHtml = (value) =>
    clean(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const validUrl = (url) => {
    const value = clean(url);
    return (
      value &&
      value !== "#" &&
      !value.startsWith("ADD_") &&
      !value.includes("PLACEHOLDER")
    );
  };
  const publicValue = (value) =>
    clean(value).startsWith("ADD_") || clean(value).includes("PLACEHOLDER")
      ? ""
      : clean(value);
  function resolveAssetPath(path) {
    if (!path) return "";
    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("data:")
    )
      return path;
    return path.replace(/^\.?\//, "");
  }
  window.resolveAssetPath = resolveAssetPath;
  const external = (url) => {
    const value = clean(url);
    return value.startsWith("http") ? value : `https://${value}`;
  };
  const range = (item) =>
    `${clean(item.startDate)}${item.startDate || item.endDate || item.current ? " – " : ""}${item.current ? "Present" : clean(item.endDate)}`;
  function initializeParticles() {
    const container = document.getElementById("particles-js");
    if (!container || typeof particlesJS !== "function") return;
    particlesJS("particles-js", {
      particles: {
        number: { value: 100, density: { enable: true, value_area: 800 } },
        color: { value: "#a3d7f7" },
        shape: { type: "circle" },
        opacity: {
          value: 0.75,
          random: true,
          anim: { enable: true, speed: 0.6, opacity_min: 0.25, sync: false },
        },
        size: {
          value: 4,
          random: true,
          anim: { enable: true, speed: 3, size_min: 2, sync: false },
        },
        line_linked: {
          enable: true,
          distance: 160,
          color: "#52627a",
          opacity: 0.3,
          width: 1,
        },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          grab: { distance: 150, line_linked: { opacity: 0.7 } },
          push: { particles_nb: 4 },
        },
      },
      retina_detect: true,
    });
  }
  function initializeRadarDetection() {
    const radar = document.querySelector(".cyber-radar");
    const blips = [...document.querySelectorAll(".radar-blip")];
    if (!radar || !blips.length) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = 5000;
    blips.forEach((blip) => {
      const x = parseFloat(blip.style.left) / 100 - 0.5;
      const y = parseFloat(blip.style.top) / 100 - 0.5;
      const angle = (Math.atan2(-y, -x) * 180) / Math.PI;
      blip.dataset.angle = String((angle + 360) % 360);
    });
    if (reducedMotion) return;
    const start = performance.now();
    let previousAngle = 0;
    const reveal = (blip) => {
      if (blip.dataset.timer) window.clearTimeout(Number(blip.dataset.timer));
      blip.classList.add("is-detected");
      blip.dataset.timer = String(
        window.setTimeout(() => {
          blip.classList.remove("is-detected");
          delete blip.dataset.timer;
        }, 1900),
      );
    };
    const animate = (now) => {
      const currentAngle = (((now - start) % duration) / duration) * 360;
      const wrapped = currentAngle < previousAngle;
      blips.forEach((blip) => {
        const targetAngle = Number(blip.dataset.angle);
        const passed = wrapped
          ? targetAngle >= previousAngle || targetAngle <= currentAngle
          : targetAngle >= previousAngle && targetAngle <= currentAngle;
        if (passed) reveal(blip);
      });
      previousAngle = currentAngle;
      window.requestAnimationFrame(animate);
    };
    window.requestAnimationFrame(animate);
  }
  const render = (profile) => {
    window._profileData = profile;
    $("#profileName").textContent = profile.name || "Your Name";
    $("#profileRole").textContent =
      [profile.heroRolePrimary, profile.heroRoleSecondary]
        .filter(Boolean)
        .join(" & ") ||
      profile.title ||
      "";
    $("#profileDescription").textContent =
      profile.heroDescription || profile.summary || "";
    $("#terminalOutput").textContent =
      `$ whoami\n${profile.name || "profile"}\n\n$ focus --list\n${[
        ...(profile.focusAreas || []).map((f) => f.title),
        "AI for Cybersecurity",
      ]
        .filter(Boolean)
        .map((x) => `> ${x}`)
        .join("\n")}\n\n$ status\nOPEN TO MEANINGFUL WORK`;
    $("#aboutContent").innerHTML =
      list(profile.about)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("") || `<p>${escapeHtml(profile.summary || "")}</p>`;
    $("#focusCards").innerHTML = list(profile.focusAreas)
      .map(
        (focus) =>
          `<div class="focus-card"><strong>${escapeHtml(focus.title || "")}</strong><span>${escapeHtml(focus.description || "")}</span></div>`,
      )
      .join("");
    $("#educationPreview").innerHTML = list(profile.education)
      .filter((item) => publicValue(item.degree) || publicValue(item.school))
      .map(
        (item) =>
          `<div class="preview-item"><strong>${escapeHtml(publicValue(item.degree))}</strong><br>${escapeHtml(publicValue(item.school))}</div>`,
      )
      .join("");
    $("#languagesPreview").innerHTML = list(profile.languages)
      .map(
        (item) =>
          `<div class="language">${escapeHtml(item.name || "")} · ${escapeHtml(item.level || "")}</div>`,
      )
      .join("");
    $("#skillsGrid").innerHTML = list(profile.skills)
      .map(
        (skill) =>
          `<article class="skill-category"><h3>${escapeHtml(skill.category || "")}</h3><div>${list(
            skill.tags,
          )
            .map((tag) => `<span class="skill-tag">${escapeHtml(tag)}</span>`)
            .join("")}</div></article>`,
      )
      .join("");
    // Certification cards remain editable placeholders until their final data is supplied.
    $("#experienceTimeline").innerHTML = list(profile.experience)
      .filter((item) => publicValue(item.title) || publicValue(item.company))
      .map(
        (item) =>
          `<article class="experience-item"><h3>${escapeHtml(publicValue(item.title))}</h3><div class="meta">${escapeHtml(publicValue(item.company))}${publicValue(item.location) ? ` · ${escapeHtml(publicValue(item.location))}` : ""}${range(item) ? ` · ${escapeHtml(range(item))}` : ""}</div>${
            list(item.responsibilities).filter((r) => publicValue(r)).length
              ? `<ul>${list(item.responsibilities)
                  .filter((r) => publicValue(r))
                  .map((r) => `<li>${escapeHtml(publicValue(r))}</li>`)
                  .join("")}</ul>`
              : ""
          }</article>`,
      )
      .join("");
    // Project cards remain editable placeholders until their final data is supplied.
    const contacts = [
      ["Email", profile.email, profile.email && `mailto:${profile.email}`],
      ["LinkedIn", profile.linkedin, profile.linkedin],
      ["GitHub", profile.github, profile.github],
      ["Location", profile.location, ""],
      [
        "Website",
        profile.website,
        profile.website && external(profile.website),
      ],
    ];
    const contactDetails = $("#contactDetails");
    if (contactDetails) contactDetails.innerHTML = contacts
      .filter(
        ([, value]) =>
          validUrl(value) || (value && !clean(value).startsWith("ADD_")),
      )
      .map(
        ([label, value, href]) =>
          `<div class="contact-card"><strong>${label}</strong>${href ? `<a href="${escapeHtml(label === "Email" ? href : external(href))}" ${label !== "Email" ? 'target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(value)}</a>` : `<span>${escapeHtml(value)}</span>`}</div>`,
      )
      .join("");
  };
  const setupNavigation = () => {
    const toggle = $("#navigationToggle"),
      menu = $("#navigationLinks"),
      links = [...document.querySelectorAll('.navigation-links a[href^="#"]')],
      sections = links
        .map((link) => $(link.getAttribute("href")))
        .filter(Boolean);
    const close = () => {
      menu.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    };
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "×" : "☰";
    });
    links.forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
    document.addEventListener("click", (event) => {
      if (
        menu.classList.contains("menu-open") &&
        !menu.contains(event.target) &&
        !toggle.contains(event.target)
      )
        close();
    });
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((link) =>
              link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${entry.target.id}`,
              ),
            );
            if (entry.target.id === "interests") {
              entry.target
                .querySelectorAll(".interest-card")
                .forEach((card) => card.classList.add("is-visible"));
            }
            if (entry.target.id === "certifications") {
              entry.target
                .querySelectorAll(".certification-card")
                .forEach((card) => card.classList.add("is-visible"));
            }
            if (entry.target.id === "projects") {
              entry.target
                .querySelectorAll(".project-card")
                .forEach((card) => card.classList.add("is-visible"));
            }
            if (entry.target.id === "education") {
              entry.target
                .querySelectorAll(".education-item")
                .forEach((item) => item.classList.add("is-visible"));
            }
          }
        }),
      { rootMargin: "-25% 0px -60% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
  };
  document.addEventListener("DOMContentLoaded", async () => {
    initializeParticles();
    initializeRadarDetection();
    setupNavigation();
    document
      .querySelectorAll('.certification-link[aria-disabled="true"]')
      .forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
    document
      .querySelectorAll('.project-link[aria-disabled="true"]')
      .forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
    const currentYear = $("#currentYear");
    if (currentYear) currentYear.textContent = new Date().getFullYear();
    const brandLink = document.querySelector(".brand-name");
    brandLink?.addEventListener("click", (event) => {
      if (brandLink.getAttribute("href") === "./") {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        history.replaceState(null, "", window.location.pathname);
      }
    });
    try {
      const response = await fetch("./profile-data.json", {
        cache: "no-cache",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      render(await response.json());
    } catch (error) {
      console.error("Unable to load profile-data.json", error);
      render({ name: "Denisa-Elena Stolniceanu" });
    }
  });
})();
