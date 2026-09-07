document.documentElement.classList.add("js");

const root = document.documentElement;
const themeButton = document.querySelector("[data-theme-toggle]");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

function effectiveTheme() {
  const selected = root.dataset.theme;
  return selected === "system" ? (systemDark.matches ? "dark" : "light") : selected;
}

function updateThemeLabel() {
  if (!themeButton) return;
  const selected = root.dataset.theme;
  const labels = root.lang === "fr"
    ? { light: "Thème clair. Activer le thème sombre", dark: "Thème sombre. Suivre le système", system: "Thème système. Activer le thème clair" }
    : { light: "Light theme. Switch to dark", dark: "Dark theme. Follow system theme", system: "System theme. Switch to light" };
  themeButton.setAttribute("aria-label", labels[selected] ?? labels[effectiveTheme()]);
  themeButton.dataset.effectiveTheme = effectiveTheme();
}

themeButton?.addEventListener("click", () => {
  const current = root.dataset.theme;
  const next = current === "system" ? "light" : current === "light" ? "dark" : "system";
  root.dataset.theme = next;
  try { localStorage.setItem("agentstration-theme", next); } catch {}
  updateThemeLabel();
});
systemDark.addEventListener?.("change", updateThemeLabel);
updateThemeLabel();

const menuButton = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  mobileMenu.hidden = open;
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 780 && mobileMenu && !mobileMenu.hidden) {
    mobileMenu.hidden = true;
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

const header = document.querySelector("[data-header]");
const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
