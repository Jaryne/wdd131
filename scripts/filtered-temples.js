// Hamburger
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  hamburger.classList.toggle("active");

  if (navMenu.classList.contains("active")) {
    hamburger.textContent = "✕";
  } else {
    hamburger.textContent = "☰";
  }
});

// Temples
const temples = [
  {
    templeName: "Aba Nigeria",
    location: "Aba, Nigeria",
    dedicated: "2005, August, 7",
    area: 11500,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/aba-nigeria/400x250/aba-nigeria-temple-lds-273999-wallpaper.jpg"
  },
  {
    templeName: "Manti Utah",
    location: "Manti, Utah, United States",
    dedicated: "1888, May, 21",
    area: 74792,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/manti-utah/400x250/manti-temple-768192-wallpaper.jpg"
  },
  {
    templeName: "Payson Utah",
    location: "Payson, Utah, United States",
    dedicated: "2015, June, 7",
    area: 96630,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/payson-utah/400x225/payson-utah-temple-exterior-1416671-wallpaper.jpg"
  },
  {
    templeName: "Yigo Guam",
    location: "Yigo, Guam",
    dedicated: "2020, May, 2",
    area: 6861,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/yigo-guam/400x250/yigo_guam_temple_2.jpg"
  },
  {
    templeName: "Washington D.C.",
    location: "Kensington, Maryland, United States",
    dedicated: "1974, November, 19",
    area: 156558,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/washington-dc/400x250/washington_dc_temple-exterior-2.jpeg"
  },
  {
    templeName: "Lima Perú",
    location: "Lima, Perú",
    dedicated: "1986, January, 10",
    area: 9600,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/lima-peru/400x250/lima-peru-temple-evening-1075606-wallpaper.jpg"
  },
  {
    templeName: "Mexico City Mexico",
    location: "Mexico City, Mexico",
    dedicated: "1983, December, 2",
    area: 116642,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/mexico-city-mexico/400x250/mexico-city-temple-exterior-1518361-wallpaper.jpg"
  },
  {
    templeName: "Manila Philippines",
    location: "Manila, Philippines",
    dedicated: "1984, September, 25",
    area: 26683,
    imageUrl:
      "images/manila-temple.webp"
  },
  {
    templeName: "Hong Kong China",
    location: "Hong Kong, China",
    dedicated: "1996, May, 26",
    area: 51921,
    imageUrl:
      "images/hong-kong.webp"
  },
  {
    templeName: "San Pedro Sula Honduras",
    location: "San Pedro Sula, Honduras",
    dedicated: "2024, October, 13",
    area: 35818,
    imageUrl:
      "images/honduras-temple.webp"
  },
  {
    templeName: "Star Valley Wyoming",
    location: "Star Valley, Wyoming",
    dedicated: "2016, October, 30",
    area: 18609,
    imageUrl:
      "images/wyoming-temple.webp"
  },
  {
    templeName: "Stockholm Sweden",
    location: "Stockholm, Sweden",
    dedicated: "1985, July, 2",
    area: 31000,
    imageUrl:
      "images/sweden-temple.webp"
  }
];

// Filter
const container = document.querySelector(".album-grid");
function renderTemples(filteredTemples) {
  container.innerHTML = filteredTemples.map(temple => `
    <section>
      <img src="${temple.imageUrl}" alt="${temple.templeName} Temple" loading="lazy">
      <h3>${temple.templeName}</h3>
      <p><span class="label">Location:</span> ${temple.location}</p>
      <p><span class="label">Dedicated:</span> ${temple.dedicated}</p>
      <p><span class="label">Size:</span> ${temple.area.toLocaleString()} sq ft</p>
    </section>
  `).join("");
}

const mainHeading = document.querySelector("#heading");
document.querySelector("#nav-menu").addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!link) return;

  event.preventDefault();

  const filter = link.dataset.filter;

  if (filter === "home") {
    renderTemples(temples);
    mainHeading.textContent = "Home";
  }

  if (filter === "old") {
    const filtered = temples.filter(temple => {
      const year = parseInt(temple.dedicated.split(",")[0]);
      return year < 1900;
    });

    renderTemples(filtered);
    mainHeading.textContent = "Old Temples";
  }

  if (filter === "new") {
    const filtered = temples.filter(temple => {
      const year = parseInt(temple.dedicated.split(",")[0]);
      return year > 2000;
    });

    renderTemples(filtered);
    mainHeading.textContent = "New Temples";
  }

  if (filter === "large") {
    const filtered = temples.filter(temple => temple.area > 90000);

    renderTemples(filtered);
    mainHeading.textContent = "Large Temples";
  }

  if (filter === "small") {
    const filtered = temples.filter(temple => temple.area < 10000);

    renderTemples(filtered);
    mainHeading.textContent = "Small Temples";
  }
});

renderTemples(temples);