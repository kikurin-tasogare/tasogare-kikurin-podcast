const revealTargets = document.querySelectorAll(
  ".hero-copy, .sacred-visual, .section-copy, .feature-card, .quote-band p, .link-card, .about-copy, .about-card, .philosophy-card, .podcast-player, .mandala-preview, .mandala-teaser-copy"
);

const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

revealTargets.forEach((element) => {
  element.setAttribute("data-reveal", "");
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealTargets.forEach((element) => observer.observe(element));
