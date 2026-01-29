function initStickyHeader() {
  const header = document.querySelector("header");

  if (!header) return;

  const stickyThreshold = header.offsetHeight;

  const stickyClasses = ["sticky", "top-0"];

  function onScroll() {
    if (window.scrollY >= stickyThreshold) {
      header.classList.add(...stickyClasses);
    } else {
      header.classList.remove(...stickyClasses);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStickyHeader);
} else {
  initStickyHeader();
}
