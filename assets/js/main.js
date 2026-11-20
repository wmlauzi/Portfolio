const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

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

document.querySelectorAll("[data-subject]").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector('#contactForm [name="subject"]').value = link.dataset.subject;
  });
});

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();

const backTop = document.querySelector("#backTop");
const updateBackTop = () => {
  backTop.classList.toggle("visible", window.scrollY > 600);
};
window.addEventListener("scroll", updateBackTop, { passive: true });
updateBackTop();
backTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

const copyEmail = document.querySelector("#copyEmail");
const copyStatus = document.querySelector("#copyStatus");
const emailAddress = "wbmlauzi@gmail.com";
let copyStatusTimer;
copyEmail.addEventListener("click", async () => {
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

document.querySelector("#contactForm").addEventListener("submit", (event) => {
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
