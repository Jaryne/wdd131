const hero = document.querySelector(".hero");

if (hero) {
  const layers = hero.querySelectorAll(".layer");

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 1);

      layer.style.transform = `
        translate(${x * depth * -40}px, ${y * depth * -40}px)
      `;
    });
  });

  hero.addEventListener("mouseleave", () => {
    layers.forEach((layer) => {
      layer.style.transform = "translate(0, 0)";
    });
  });
}