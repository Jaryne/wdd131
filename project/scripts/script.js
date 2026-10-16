(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const NS = "http://www.w3.org/2000/svg";

  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(`archive2099.${k}`); return v === null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(`archive2099.${k}`, v); } catch { /* storage blocked */ } },
  };

  const root = document.documentElement;
  const page = document.body.dataset.page;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- animation control (FX) ---------- */
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let fxOn = store.get("fx") ? store.get("fx") === "on" : !reduced;

  const fxBtn = $("#fxToggle");
  function applyFx() {
    root.classList.toggle("fx-off", !fxOn);
    if (fxBtn) { fxBtn.textContent = `FX:${fxOn ? "ON" : "OFF"}`; fxBtn.setAttribute("aria-pressed", String(fxOn)); }
  }
  applyFx();
  fxBtn?.addEventListener("click", () => {
    fxOn = !fxOn; store.set("fx", fxOn ? "on" : "off"); applyFx();
    document.dispatchEvent(new CustomEvent("fxchange", { detail: { on: fxOn } }));
  });

  /* ---------- profile HUD framing control (independent from FX) ---------- */
  const hudBtn = $("#hudToggle");
  let hudOn = store.get("hud") ? store.get("hud") === "on" : true;
  function applyHud() {
    root.classList.toggle("hud-off", !hudOn);
    if (hudBtn) {
      hudBtn.textContent = `HUD: ${hudOn ? "ON" : "OFF"}`;
      hudBtn.setAttribute("aria-pressed", String(hudOn));
    }
  }
  applyHud();
  hudBtn?.addEventListener("click", () => {
    hudOn = !hudOn;
    store.set("hud", hudOn ? "on" : "off");
    applyHud();
  });

  // when FX is off it'll just stop its events first
  const logoEl = $("#glitchLogo");
  ["mouseenter", "click"].forEach((ev) => logoEl?.addEventListener(ev, (e) => { if (!fxOn) e.stopImmediatePropagation(); }, true));

  /* ---------- hamburger ---------- */
  const burger = $("#hamburger"), nav = $("#nav-menu");
  function setNav(open) {
    burger.classList.toggle("active", open);
    nav.classList.toggle("active", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger?.addEventListener("click", () => setNav(!nav.classList.contains("active")));
  $$("#nav-menu a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav?.classList.contains("active")) { setNav(false); burger.focus(); } });
  matchMedia("(min-width: 769px)").addEventListener("change", (m) => { if (m.matches) setNav(false); });

  /* ---------- optional images: hide when file is missing ---------- */
  $$("img[data-optional], .watch-image").forEach((img) => {
    const hide = () => { img.style.display = "none"; };
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  /* ======================
     HUD PANEL: irregular polygons from one source
     ====================== */
  const SHAPES = {
    a: (w, h, c) => [[c * 1.5, 0], [w - c * 0.6, 0], [w, c * 0.9], [w, h - c * 1.6], [w - c * 1.1, h], [c * 0.4, h], [0, h - c * 0.7], [0, c * 1.1]],
    b: (w, h, c) => [[c * 1.2, 0], [w - c * 0.4, 0], [w, c * 0.6], [w, h - c * 1.3], [w - c * 1.6, h - c * 1.3], [w - c * 2.1, h], [c * 0.3, h], [0, h - c * 0.5], [0, c * 1.2]],
    c: (w, h, c) => [[0, 0], [w - c * 2.2, 0], [w - c * 1.4, c * 0.7], [w, c * 0.7], [w, h - c * 0.8], [w - c * 0.8, h], [c * 1.6, h], [c * 0.8, h - c * 0.7], [0, h - c * 0.7]],
    d: (w, h, c) => [[c * 0.8, 0], [w, 0], [w, h - c * 0.8], [w - c * 0.8, h], [0, h], [0, c * 0.8]],
    e: (w, h, c) => [[0, c], [c, 0], [w * 0.35, 0], [w * 0.35 + c * 0.6, c * 0.5], [w - c, c * 0.5], [w, c * 1.1], [w, h - c * 0.6], [w - c * 1.2, h], [c * 2, h], [0, h - c * 1.2]],
    f: (w, h, c) => [[c * 2, 0], [w, 0], [w, h - c * 1.8], [w - c * 0.9, h - c * 1.8], [w - c * 0.9, h - c * 0.6], [w - c * 1.5, h], [c * 0.6, h], [0, h - c * 0.9], [0, c * 1.3]],
  };

  function hudDraw(el) {
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    const c = Math.max(10, Math.min(24, Math.min(w, h) * 0.14));
    const pts = (SHAPES[el.dataset.shape] || SHAPES.a)(w, h, c).map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]);
    const str = pts.map(([x, y]) => `${x},${y}`).join(" ");
    el._fill.style.clipPath = `polygon(${pts.map((p) => `${p[0]}px ${p[1]}px`).join(",")})`;
    const svg = el._svg;
    svg.setAttribute("width", w); svg.setAttribute("height", h); svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const sx = (w - 14) / w, sy = (h - 14) / h;
    const seg = (a, b, dx, dy) => `<polyline class="seg" points="${a[0] + dx},${a[1] + dy} ${b[0] + dx},${b[1] + dy}"/>`;
    const n = pts.length;
    svg.innerHTML = [
      `<polygon class="inner" points="${str}" transform="translate(${(w * (1 - sx)) / 2} ${(h * (1 - sy)) / 2}) scale(${sx} ${sy})"/>`,
      `<polygon class="main" points="${str}"/>`,
      seg(pts[0], [pts[0][0] + c * 2.4, pts[0][1]], 0, -4),
      seg(pts[Math.floor(n / 2)], pts[Math.floor(n / 2) + 1], 4, 0),
      `<rect class="tick" x="${pts[2][0] - 2}" y="${pts[2][1] - 2}" width="5" height="5"/>`,
      `<rect class="tick" x="${pts[n - 2][0] - 2}" y="${pts[n - 2][1] - 2}" width="5" height="5"/>`,
    ].join("");
  }
  const ro = new ResizeObserver((entries) => entries.forEach((e) => hudDraw(e.target)));
  function hudBuild(el) {
    if (el._fill) return;
    const fill = document.createElement("div"); fill.className = "hud-fill";
    const body = document.createElement("div"); body.className = "hud-body";
    while (el.firstChild) body.appendChild(el.firstChild);
    const svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "hud-edge"); svg.setAttribute("aria-hidden", "true");
    el.append(fill, svg, body);
    if (el.hasAttribute("data-scan")) { const s = document.createElement("div"); s.className = "hud-scan"; el.appendChild(s); }
    el._fill = fill; el._svg = svg;
    ro.observe(el); hudDraw(el);
  }
  $$(".hud").forEach(hudBuild);

  /* ---------- reveal on scroll ---------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { threshold: 0.12 });
  $$(".reveal").forEach((el) => rio.observe(el));

  /* ---------- shared dialog close ---------- */
  $$("[data-close]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));
  $$("dialog.sheet").forEach((d) => d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));

  /* ==================
     LANDING
     ================== */
  if (page === "home") {
    /* intro */
    const intro = $("#intro");
    const finish = () => {
      intro.classList.add("done");
      document.body.classList.add("booted");
      try { sessionStorage.setItem("archive2099.intro", "1"); } catch { /* ignore */ }
    };
    let seen = false; try { seen = sessionStorage.getItem("archive2099.intro") === "1"; } catch { /* ignore */ }
    if (seen || !fxOn) finish();
    else {
      const log = $("#bootLog"), bar = $("#bootBar");
      const lines = ["> LINKING ALCHEMAX NODE 2099 ......... OK", "> DECRYPTING PERSONNEL ARCHIVE ........ OK", "> GIZMO-LINK HANDSHAKE ................ OK", "> LOADING INTERFACE PANELS ............ OK"];
      let done = false;
      const end = () => { if (!done) { done = true; finish(); } };
      $("#skipIntro").addEventListener("click", end);
      (async () => {
        for (let i = 0; i < lines.length && !done; i++) {
          const d = document.createElement("div"); d.textContent = lines[i]; log.appendChild(d);
          bar.style.width = `${((i + 1) / lines.length) * 100}%`; bar.style.transition = "width .45s";
          await sleep(520);
        }
        await sleep(350); end();
      })();
    }

    /* -------------- poster parallax ------------- */
    const hero = $(".hero"), poster = $(".hero img.poster");
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const fine = matchMedia("(pointer: fine)").matches;
    function tick() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      poster.style.transform = `translate3d(${cx * 14}px, ${cy * 8}px, 0) scale(1.05)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : null;
    }
    hero.addEventListener("pointermove", (e) => {
      if (!fxOn || !fine) return;
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * -2; ty = ((e.clientY - r.top) / r.height - 0.5) * -2;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    hero.addEventListener("pointerleave", () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(tick); });

    /* ------------ Miguel's dialogue ---------------*/
    const miguel = $("#miguel"), dlg = $("#dialogue"), dlgText = $("#dialogueText"), hint = $("#heroHint");
    const lines = [
      "You don't belong here. Leave before you compromise the system.",
      "Archive access logged. Touch nothing you can't explain.",
      "You're reading a dossier on me. Try to keep up.",
      "Dimension unknown. Clearance: provisional. Proceed.",
      "Don't test me. The stability of the multiverse is hanging by a thread, and I don't have time for games.",
      "Every second you waste here is another anomaly slipping through the cracks.",
      "You think you understand what's at stake? You don't know the half of it.",
      "What— An anomaly!?", /* I just learned how to type an em dash  => Alt + 0151 */
      "Close the file. Now."
    ];

    let li = 0, hideT;
    miguel.addEventListener("click", () => {
      hint?.remove();
      dlgText.textContent = lines[li++ % lines.length];
      dlg.classList.add("show"); clearTimeout(hideT); hideT = setTimeout(() => dlg.classList.remove("show"), 4800);
    });

    /* ----------- watch stage: panels power on in sequence when reached ----------- */
    const stage = $(".watch-stage");
    const sio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { stage.classList.add("on"); sio.disconnect(); } }), { threshold: 0.12 });
    sio.observe(stage);

    /* ----------- module dialog ------------*/
    const sheet = $("#panelSheet");
    function openPanel(p) {
      if (sheet.open) return;
      $("#sheetNum").textContent = `MODULE // ${p.dataset.num}`;
      $("#sheetTitle").textContent = p.dataset.title;
      $("#sheetInfo").textContent = p.dataset.info;
      $("#sheetGo").setAttribute("href", p.dataset.href);
      sheet.showModal();
    }
    $$(".panel-grid .hud").forEach((p) => {
      p.addEventListener("click", () => openPanel(p));
      if (p.tagName !== "BUTTON") p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPanel(p); } });
    });
  }

  /* =======================
     PROFILE
     =================== */
  if (page === "about") {
    const links = $$(".rail a");
    const cio = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${e.target.id}`));
    }), { rootMargin: "-40% 0px -55% 0px" });
    $$(".chapter").forEach((c) => cio.observe(c));
  }

  /* ===========================
     APPEARANCES
     ========================= */

  if (page === "media") {
    const ITEMS = [
      {
        id: "sm2099-1",
        type: "comic",
        title: "Spider-Man 2099 #1",
        year: "1992",
        cover: "images/covers/spider-man-2099-1.webp",
        summary: "Written by Peter David and illustrated by Rick Leonardi, this issue introduces Miguel O'Hara, a geneticist working for Alchemax in the year 2099 who becomes Spider-Man after a genetic experiment alters his DNA.",
        link: "https://www.marvel.com/comics/series/2070/spiderman_2099_1992_1996",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "sm2099-annual-1994",
        type: "comic",
        title: "Spider-Man 2099 Annual #1",
        year: "1994",
        cover: "images/covers/spider-man-2099-annual-1994.webp",
        summary: "An annual special featuring Spider-Man 2099, published during the original 1992–1996 series.",
        link: "https://www.marvel.com/comics/issue/53431/spider-man_2099_annual_1994_1",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "sm2099-meets-spiderman",
        type: "comic",
        title: "Spider-Man 2099 Meets Spider-Man",
        year: "1995",
        cover: "images/covers/spider-man-2099-meets-spider-man.webp",
        summary: "A crossover featuring Miguel O'Hara, Spider-Man of 2099, and Peter Parker, Spider-Man of the present day.",
        link: "https://www.marvel.com/comics/issue/65143/spider-man_2099_meets_spider-man_1995_1",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "sm2099-special",
        type: "comic",
        title: "Spider-Man 2099 Special",
        year: "1995",
        cover: "images/covers/spider-man-2099-special.webp",
        summary: "A special comic featuring Spider-Man 2099, published during Miguel O'Hara's original comic-book era.",
        link: "https://www.marvel.com/comics/issue/76328/spider-man_2099_special_1995_1",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "sm2099-2014",
        type: "comic",
        title: "Spider-Man 2099 (2014) #1",
        year: "2014",
        cover: "images/covers/spider-man-2099-2014.webp",
        summary: "The first issue of the 2014 series written by Peter David and illustrated by Will Sliney. Miguel O'Hara lives in the present day while attempting to protect the future.",
        link: "https://www.marvel.com/comics/issue/50890/spider-man-2099-2014-1",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "sm2099-2015",
        type: "comic",
        title: "Spider-Man 2099 (2015) #1",
        year: "2015",
        cover: "images/covers/spider-man-2099-2015-1.webp",
        summary: "The first issue of the 2015 Spider-Man 2099 series, continuing Miguel O'Hara's adventures in the present day.",
        link: "https://www.marvel.com/comics/series/20511/spiderman_2099_2015_2017",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "sm2099-2019",
        type: "comic",
        title: "Spider-Man 2099 #1",
        year: "2019",
        cover: "images/covers/spider-man-2099-2019-1.webp",
        summary: "A Spider-Man 2099 comic published as part of Marvel's 2099 publishing era.",
        link: "https://www.marvel.com/comics/issue/82599/spider-man_2099_2019_1",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "exodus-alpha",
        type: "comic",
        title: "Spider-Man 2099: Exodus Alpha #1",
        year: "2022",
        cover: "images/covers/spider-man-2099-exodus-alpha.webp",
        summary: "The opening issue of Spider-Man 2099: Exodus. The arrival of a Celestial and the appearance of a mysterious Garden of Eden set the stage for a struggle over the future of 2099.",
        link: "https://www.marvel.com/comics/issue/98308/spider-man_2099_exodus_alpha_2022_1",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "exodus",
        type: "comic",
        title: "Spider-Man 2099: Exodus #1",
        year: "2022",
        cover: "images/covers/spider-man-2099-exodus-1.webp",
        summary: "The first issue of the Spider-Man 2099: Exodus limited series, which follows the conflict surrounding the Celestial Garden and the future of the 2099 universe.",
        link: "https://www.marvel.com/comics/issue/98302/spider-man_2099_exodus_2022_1",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "dark-genesis",
        type: "comic",
        title: "Spider-Man 2099: Dark Genesis #1",
        year: "2023",
        cover: "images/covers/spider-man-2099-dark-genesis-1.webp",
        summary: "The first issue of the Dark Genesis limited series, featuring Miguel O'Hara and a new threat involving Carnage in Nueva York.",
        link: "https://www.marvel.com/comics/issue/107472/spider-man_2099_dark_genesis_2023",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "miguel-2024",
        type: "comic",
        title: "Miguel O'Hara: Spider-Man 2099 #1",
        year: "2024",
        cover: "images/covers/miguel-ohara-spider-man-2099-2024-1.webp",
        summary: "Miguel O'Hara teams up with Blade 2099 to confront a zombie outbreak threatening Nueva York.",
        link: "https://www.marvel.com/comics/issue/113510/miguel_ohara_-_spider-man_2099_2024_1",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "symbiote-2099",
        type: "comic",
        title: "Symbiote Spider-Man 2099 #1",
        year: "2024",
        cover: "images/covers/symbiote-spider-man-2099-2024-1.webp",
        summary: "The first issue of the Symbiote Spider-Man 2099 series, featuring Miguel O'Hara in a story involving the symbiote mythology of the 2099 universe.",
        link: "https://www.marvel.com/comics/issue/99321/symbiote_spider-man_2099_2024_1",
        linkLabel: "MARVEL COMICS"
      },
      {
        id: "itsv",
        type: "film",
        title: "Spider-Man: Into the Spider-Verse",
        year: "2018",
        cover: "images/covers/into-the-spider-verse.webp",
        disc: "images/covers/into-the-spider-verse.webp",
        summary: "Miles Morales becomes Spider-Man and encounters other Spider-People from different dimensions. Miguel O'Hara appears in a post-credits scene.",
        link: "https://www.themoviedb.org/movie/324857-spider-man-into-the-spider-verse",
        linkLabel: "VIEW ON TMDB"
      },
      {
        id: "atsv",
        type: "film",
        title: "Spider-Man: Across the Spider-Verse",
        year: "2023",
        cover: "images/covers/across-the-spider-verse.webp",
        disc: "images/covers/across-the-spider-verse.webp",
        summary: "Miles Morales encounters the Spider-Society, an organization led by Miguel O'Hara, and clashes with Miguel over how to protect the multiverse.",
        link: "https://www.themoviedb.org/movie/569094-spider-man-across-the-spider-verse",
        linkLabel: "VIEW ON TMDB"
      }
    ];

    const roster = $("#roster"), tabs = $$(".tab"), lastSeen = $("#lastSeen");
    const dlg = $("#mediaModal");
    let filter = store.get("mediaTab", "all");
    let opener = null;

    function render() {
      roster.innerHTML = "";
      ITEMS.filter((i) => filter === "all" || i.type === filter).forEach((it) => {
        const b = document.createElement("button");
        b.className = "card"; b.type = "button"; b.dataset.id = it.id;
        b.setAttribute("aria-label", `${it.title}, ${it.year}. Open details`);
        b.innerHTML = `<span class="tag micro">${it.type === "comic" ? "COMIC" : "FILM"}</span>
          <div class="cover"><img loading="lazy" width="300" height="450" alt="" src="${it.cover}"></div>
          <div class="meta"><b>${it.title}</b><span class="micro">${it.year}</span></div>`;
        b.querySelector("img").addEventListener("error", (e) => e.target.remove());
        b.addEventListener("click", () => open(it, b));
        roster.appendChild(b);
      });
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.filter === filter)));
      const last = ITEMS.find((i) => i.id === store.get("lastMedia"));
      lastSeen.textContent = last ? `LAST ACCESSED // ${last.title.toUpperCase()}` : "";
    }

    function open(it, from) {
      opener = from;
      store.set("lastMedia", it.id);
      const disc = document.querySelector(".disc");
      if (it.type === "film" && it.disc) {
        disc.style.backgroundImage = `url("${it.disc}")`;
      }

      $("#mmTitle").textContent = it.title;
      $("#mmMeta").textContent = `${it.type === "comic" ? "COMIC BOOK // " : "ANIMATED FILM // "}${it.year}`;
      $("#mmSummary").textContent = it.summary;

      const a = $("#mmLink"); a.href = it.link; a.textContent = `${it.linkLabel} ↗`; /* why does this turn into an emoji on some phones ? */
      const cover = $("#mmCover"); cover.innerHTML = "";
      cover.closest(".disc-wrap").classList.toggle("comic", it.type === "comic");

      const img = new Image(); img.alt = `${it.title} cover`; img.src = it.cover;
      img.addEventListener("error", () => img.remove()); cover.appendChild(img);
      dlg.showModal();
      render();
    }
    tabs.forEach((t) => t.addEventListener("click", () => { filter = t.dataset.filter; store.set("mediaTab", filter); render(); }));
    dlg.addEventListener("close", () => {
      const target = opener?.isConnected ? opener : $(".card");
      target?.focus({ preventScroll: true });
    });
    render();
  }

  /* ==========================
     JOIN FORM
     ==================== */
  if (page === "apply") {
    const form = $("#applyForm"), term = $("#terminal");
    const f = { alias: $("#alias"), dimension: $("#dimension"), ability: $("#ability"), statement: $("#statement") };
    const count = $("#count");
    const saved = store.get("alias"); if (saved) f.alias.value = saved;

    const rules = {
      alias: (v) => (v.length < 2 || v.length > 24 ? "Alias must be 2–24 characters." : !/^[\w\-. ]+$/.test(v) ? "Letters, numbers, spaces, - _ . only." : ""),
      dimension: (v) => (v.length < 3 ? "Enter a dimension, e.g. Earth-928." : v.length > 20 ? "Too long for the registry." : ""),
      ability: (v) => (v.length < 3 ? "Name at least one ability." : ""),
      statement: (v) => (v.length < 40 ? `Statement needs ${40 - v.length} more characters.` : v.length > 400 ? "Keep it under 400 characters." : ""),
    };
    function check(k) {
      const msg = rules[k](f[k].value.trim());
      const wrap = f[k].closest(".field");
      wrap.classList.toggle("invalid", !!msg);
      wrap.querySelector(".err").textContent = msg;
      f[k].setAttribute("aria-invalid", String(!!msg));
      return !msg;
    }
    Object.keys(f).forEach((k) => { f[k].addEventListener("blur", () => check(k)); f[k].addEventListener("input", () => { if (f[k].closest(".field").classList.contains("invalid")) check(k); }); });
    f.statement.addEventListener("input", () => { count.textContent = `${f.statement.value.length} / 400`; });
    count.textContent = `${f.statement.value.length} / 400`;

    const hash = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
    async function type(line, cls = "") {
      const span = document.createElement("span"); if (cls) span.className = cls; term.insertBefore(span, term.querySelector(".cursor"));
      if (!fxOn) { span.textContent = `${line}\n`; return; }
      for (const ch of line) { span.textContent = `${span.textContent}${ch}`; await sleep(10); }
      span.textContent = `${span.textContent}\n`;
    }
    let busy = false;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy) return;
      const ok = Object.keys(f).map(check).every(Boolean);
      if (!ok) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
      busy = true; const btn = $("button[type=submit]", form); btn.disabled = true;
      const alias = f.alias.value.trim(), dim = f.dimension.value.trim(), ab = f.ability.value.trim();
      store.set("alias", alias);
      term.innerHTML = '<span class="cursor"></span>';
      const h = hash(`${alias.toLowerCase()}${dim.toLowerCase()}${ab.toLowerCase()}`);
      const risk = 20 + (h % 79);
      const verdicts = [
        ["PROVISIONAL ACCEPTANCE", "ok", "Report to the nearest Society node. Do not touch the Gizmo."],
        ["UNDER REVIEW // ANOMALY FLAGGED", "warn", "Your file is interesting. That is not a compliment."],
        ["ACCEPTED WITH CONDITIONS", "ok", "You may keep the mask. You may not keep the opinions."],
      ];
      const v = verdicts[h % verdicts.length];
      await type("> OPENING SPIDER-SOCIETY INTAKE CHANNEL ...");
      await sleep(250); await type(`> OPERATOR ALIAS ........ ${alias.toUpperCase()}`);
      await type(`> HOME DIMENSION ....... ${dim.toUpperCase()}`);
      await type(`> REGISTERED ABILITY ... ${ab.toUpperCase()}`);
      await sleep(350); await type("> PARSING APPLICATION STATEMENT ...");
      await sleep(500); await type("> CROSS-CHECKING ALCHEMAX WATCHLIST ... DONE");
      await sleep(350); await type(`> CANON EVENT RISK .......... ${risk}%`, risk > 70 ? "warn" : "");
      await sleep(500); await type("");
      await type(`RESULT: ${v[0]}`, v[1]);
      await type(v[2]);
      await type("");
      await type("[ FICTIONAL INTERFACE // nothing was sent; only your alias is remembered in this browser ]");
      btn.disabled = false; busy = false;
    });
  }

  /* ================================
     REFERENCES: credit roll
     ======================== */
  if (page === "credits") {
    const stage = $("#roll"), view = $("#rollView"), inner = $("#rollInner");
    const bPlay = $("#rollPlay"), bSpeed = $("#rollSpeed"), bRestart = $("#rollRestart"), bMode = $("#rollMode");
    const SPEEDS = [1, 2, 4], BASE = 52; // px per second
    let si = 0, playing = true, finished = false, y = 0, last = 0, raf = 0, mode = "static";

    const endY = () => view.clientHeight * 0.75 - inner.offsetHeight;
    const paint = () => { inner.style.transform = `translate3d(-50%, ${y}px, 0)`; };
    const syncPlay = () => { bPlay.textContent = finished ? "REPLAY" : playing ? "PAUSE" : "PLAY"; };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(frame); };

    function frame(t) {
      raf = 0;
      if (mode !== "roll") return;
      if (playing) {
        y -= BASE * SPEEDS[si] * Math.min((t - last) / 1000, 0.1);
        if (y <= endY()) { y = endY(); playing = false; finished = true; syncPlay(); }
        paint();
      }
      last = t;
      if (!finished) schedule();
    }
    function start() {
      y = view.clientHeight; finished = false; playing = true; last = performance.now(); syncPlay(); paint(); schedule();
    }
    function setMode(m) {
      mode = m;
      stage.classList.toggle("static", m === "static");
      bMode.textContent = m === "roll" ? "READ AS LIST" : "WATCH AS ROLL";
      if (m === "roll") start(); else inner.style.transform = "";
      stage.classList.add("ready");
    }
    bPlay.addEventListener("click", () => {
      if (finished) return start();
      playing = !playing; last = performance.now(); syncPlay(); schedule();
    });
    bSpeed.addEventListener("click", () => { si = (si + 1) % SPEEDS.length; bSpeed.textContent = `SPEED ${SPEEDS[si]}×`; });
    bRestart.addEventListener("click", start);
    bMode.addEventListener("click", () => setMode(mode === "roll" ? "static" : "roll"));
    document.addEventListener("fxchange", (e) => { if (!e.detail.on) setMode("static"); });
    setMode(fxOn ? "roll" : "static");
  }
})();