const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

const closeMenu = () => {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
};

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
}

const projectRows = document.querySelectorAll("[data-project-reveal]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealSections = document.querySelectorAll("[data-section-reveal]");
if (revealSections.length && !prefersReducedMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("has-section-motion");
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

  revealSections.forEach((section) => sectionObserver.observe(section));
}

if (projectRows.length && !prefersReducedMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("has-project-motion");
  const projectObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, threshold: 0.12 });

  projectRows.forEach((row) => projectObserver.observe(row));
}


/* Independent expandable project collections and horizontal card tracks */
document.querySelectorAll(".collection-toggle").forEach((toggle) => {
  const panelId = toggle.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;
  if (!panel) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const nextExpanded = !expanded;
    toggle.setAttribute("aria-expanded", String(nextExpanded));
    panel.classList.toggle("is-expanded", nextExpanded);
    panel.setAttribute("aria-hidden", String(!nextExpanded));
    panel.inert = !nextExpanded;
    if (nextExpanded) {
      requestAnimationFrame(() => {
        panel.querySelectorAll("[data-project-reveal]").forEach((card) => card.classList.add("is-visible"));
        panel.querySelectorAll(".projects").forEach((track) => {
          track.dispatchEvent(new Event("scroll"));
        });
      });
    }
  });
});

document.querySelectorAll(".collection-panel").forEach((panel) => {
  const track = panel.querySelector(".projects");
  const previous = panel.querySelector("[data-scroll-prev]");
  const next = panel.querySelector("[data-scroll-next]");
  if (!track || !previous || !next) return;

  const updateArrows = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const canScroll = maxScroll > 2;
    previous.disabled = !canScroll || track.scrollLeft <= 2;
    next.disabled = !canScroll || track.scrollLeft >= maxScroll - 2;
  };

  previous.addEventListener("click", () => {
    track.scrollBy({ left: -Math.max(track.clientWidth * 0.82, 260), behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
  next.addEventListener("click", () => {
    track.scrollBy({ left: Math.max(track.clientWidth * 0.82, 260), behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  track.addEventListener("scroll", updateArrows, { passive: true });
  track.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && track.scrollWidth > track.clientWidth) {
      const atStart = track.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1 && event.deltaY > 0;
      if (!atStart && !atEnd) {
        track.scrollLeft += event.deltaY;
        event.preventDefault();
      }
    }
  }, { passive: false });

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(updateArrows);
    resizeObserver.observe(track);
  } else {
    window.addEventListener("resize", updateArrows, { passive: true });
  }
  updateArrows();
});

document.querySelectorAll("[data-subject]").forEach((link) => {
  link.addEventListener("click", () => {
    const subjectInput = document.querySelector('#contactForm [name="subject"]');
    if (subjectInput) subjectInput.value = link.dataset.subject || "";
  });
});

const yearElement = document.querySelector("#year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

const backTop = document.querySelector("#backTop");
if (backTop) {
  const updateBackTop = () => {
    backTop.classList.toggle("visible", window.scrollY > 600);
  };
  window.addEventListener("scroll", updateBackTop, { passive: true });
  updateBackTop();
  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

const copyEmail = document.querySelector("#copyEmail");
const copyStatus = document.querySelector("#copyStatus");
const emailAddress = "wbmlauzi@gmail.com";
let copyStatusTimer;
if (copyEmail && copyStatus) copyEmail.addEventListener("click", async () => {
  let copied = false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(emailAddress);
      copied = true;
    } catch {
      copied = false;
    }
  }

  if (!copied) {
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = emailAddress;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.append(temporaryInput);
    temporaryInput.select();
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    } finally {
      temporaryInput.remove();
    }
  }

  copyStatus.textContent = copied ? "Email copied!" : "Copy failed; select the email above.";
  window.clearTimeout(copyStatusTimer);
  copyStatusTimer = window.setTimeout(() => { copyStatus.textContent = ""; }, 3000);
});

const contactForm = document.querySelector("#contactForm");
if (contactForm) contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = String(data.get("name")).trim();
  const email = String(data.get("email")).trim();
  const subject = String(data.get("subject")).trim();
  const message = String(data.get("message")).trim();

  if (!name || !email || !subject || !message) {
    document.querySelector("#formStatus").textContent = "Please complete all fields.";
    return;
  }

  const body = `${message}\n\n— ${name} (${email})`;
  document.querySelector("#formStatus").textContent = "Opening your email application. If it does not open, use the direct email link below.";
  window.location.href = `mailto:wbmlauzi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
