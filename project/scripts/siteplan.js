const logo = document.getElementById("glitchLogo");
const a = document.getElementById("normalImage");
const b = document.getElementById("hoverImage");
const c = document.getElementById("glitchCanvas");
const x = c.getContext("2d");

let running = false;
let frame, start;
let blackTrails = [];

// Set canvas size to match the image
function setup() {
    c.width = a.naturalWidth;
    c.height = a.naturalHeight;
}

a.onload = setup;
if (a.complete) setup();

// Glitch color layers
const layers = [
    { color: "#00ffff", dx: -5, dy: 0, alpha: 0.7 },   // Cyan
    { color: "#ff00ff", dx: 5, dy: 0, alpha: 0.75 },   // Magenta
    { color: "#00aaff", dx: -2, dy: 2, alpha: 0.3 },   // Blue
    { color: "#ff1493", dx: 3, dy: -2, alpha: 0.3 },   // Pink
    { color: "#ffff00", dx: 0, dy: -3, alpha: 0.55 },  // Yellow
    { color: "#000000", dx: 3, dy: 1, alpha: 0.42 }   // Black
];

// Draw a colored version of the image
function layer(img, l, s) {
    const q = document.createElement("canvas");
    const z = q.getContext("2d");

    q.width = c.width;
    q.height = c.height;

    z.drawImage(img, l.dx * s, l.dy * s, c.width, c.height);

    z.globalCompositeOperation = "source-in";
    z.fillStyle = l.color;
    z.fillRect(0, 0, c.width, c.height);

    x.save();
    x.globalAlpha = l.alpha;
    x.globalCompositeOperation =
        l.color === "#000000" ? "multiply" : "screen";

    x.drawImage(q, 0, 0);
    x.restore();

    halftone(img, l, s);
}

// Add colored dots
function halftone(img, l, s) {
    const q = document.createElement("canvas");
    const z = q.getContext("2d");

    q.width = c.width;
    q.height = c.height;
    z.drawImage(img, l.dx * s, l.dy * s, c.width, c.height);

    const d = z.getImageData(0, 0, q.width, q.height).data;
    const black = l.color === "#000000";
    const spacing = black
        ? 5 + Math.random() * 3
        : 4 + Math.random() * 2;

    x.save();
    x.globalCompositeOperation = black ? "multiply" : "screen";
    x.fillStyle = l.color;

    for (let y = 0; y < c.height; y += spacing) {
        for (let xx = 0; xx < c.width; xx += spacing) {

            const sx = Math.floor(xx - l.dx * s);
            const sy = Math.floor(y - l.dy * s);

            if (sx < 0 || sy < 0 || sx >= q.width || sy >= q.height)
                continue;

            const i = (sy * q.width + sx) * 4;

            if (d[i + 3] < 70) continue;

            const brightness =
                (d[i] + d[i + 1] + d[i + 2]) / 765;

            let radius;

            if (black) {
                radius = 0.35 + (1 - brightness) * (1 + s * 1.5);

                if (Math.random() < 0.45) continue;
            } else {
                radius = 0.25 + (1 - brightness) * (0.7 + s * 0.9);

                if (Math.random() < 0.12 + s * 0.15)
                    continue;
            }

            x.beginPath();
            x.arc(
                xx + l.dx * s,
                y + l.dy * s,
                radius,
                0,
                Math.PI * 2
            );
            x.fill();
        }
    }

    x.restore();
}

// Random horizontal image slices
function slices(img, s) {
    const amount = 2 + Math.floor(Math.random() * (7 + s * 3));

    for (let i = 0; i < amount; i++) {
        const y = Math.random() * c.height;
        const h = 1 + Math.random() * (3 + s * 10);

        const shift =
            (Math.random() < 0.5 ? -1 : 1) *
            (2 + Math.random() * (8 + s * 16));

        const oy = (Math.random() - 0.5) * (3 + s * 5);

        x.save();
        x.globalAlpha = 0.25 + Math.random() * 0.5;

        x.drawImage(
            img,
            0, y, c.width, h,
            shift, y + oy, c.width, h
        );

        x.restore();
    }
}

// Random rectangular glitches
function blocks(img, s) {
    const amount = 2 + Math.floor(Math.random() * (5 + s * 8));

    for (let i = 0; i < amount; i++) {
        const w = c.width * (0.025 + Math.random() * 0.14);
        const h = c.height * (0.012 + Math.random() * 0.08);

        const sx = Math.random() * (c.width - w);
        const sy = Math.random() * (c.height - h);

        const ox = (Math.random() - 0.5) * (10 + s * 30);
        const oy = (Math.random() - 0.5) * (4 + s * 10);

        x.save();
        x.globalAlpha = 0.35 + Math.random() * 0.5;

        x.drawImage(
            img,
            sx, sy, w, h,
            sx + ox, sy + oy, w, h
        );

        x.restore();
    }
}

// RGB/YELLOW shifted blocks
function rgbBlocks(img, s) {
    const amount = 1 + Math.floor(Math.random() * (3 + s * 5));

    for (let i = 0; i < amount; i++) {
        const w = c.width * (0.02 + Math.random() * 0.1);
        const h = c.height * (0.01 + Math.random() * 0.05);

        const sx = Math.random() * (c.width - w);
        const sy = Math.random() * (c.height - h);

        // Cyan, magenta, or yellow
        const colorLayers = [0, 1, 4];
        const l = layers[
            colorLayers[Math.floor(Math.random() * colorLayers.length)]
        ];

        x.save();
        x.globalAlpha = 0.3 + Math.random() * 0.45;
        x.globalCompositeOperation = "screen";

        x.drawImage(
            img,
            sx, sy, w, h,
            sx + l.dx * (1 + s * 2),
            sy + l.dy,
            w, h
        );

        x.restore();
    }
}

// Black image trails
function blackDrag(img, s) {
    if (Math.random() < 0.35) {
        const w = c.width * (0.02 + Math.random() * 0.16);
        const h = c.height * (0.01 + Math.random() * 0.07);

        blackTrails.push({
            sx: Math.random() * (c.width - w),
            sy: Math.random() * (c.height - h),
            w,
            h,
            ox: (Math.random() - 0.5) * (15 + s * 35),
            oy: (Math.random() - 0.5) * (4 + s * 12),
            life: 3 + Math.floor(Math.random() * 8),
            max: 10
        });
    }

    for (let i = blackTrails.length - 1; i >= 0; i--) {
        const q = blackTrails[i];
        q.life--;
        if (q.life <= 0) {
            blackTrails.splice(i, 1);
            continue;
        }
        x.save();
        x.globalAlpha = 0.15 + (q.life / q.max) * 0.45;
        x.globalCompositeOperation = "multiply";
        x.drawImage(
            img,
            q.sx, q.sy, q.w, q.h,
            q.sx + q.ox,
            q.sy + q.oy,
            q.w, q.h
        );

        x.restore();
    }
}

// Black dotted trails
function blackHalftoneDrag(img, s) {
    if (Math.random() < 0.2) {
        blackTrails.push({
            sx: Math.random() * c.width,
            sy: Math.random() * c.height,
            w: c.width * (0.03 + Math.random() * 0.12),
            h: c.height * (0.015 + Math.random() * 0.06),
            ox: (Math.random() - 0.5) * 25,
            oy: (Math.random() - 0.5) * 8,
            life: 5 + Math.floor(Math.random() * 10),
            max: 14,
            dots: true
        });
    }

    for (let i = blackTrails.length - 1; i >= 0; i--) {
        const q = blackTrails[i];
        if (!q.dots) continue;
        q.life--;
        if (q.life <= 0) {
            blackTrails.splice(i, 1);
            continue;
        }

        x.save();
        x.globalAlpha = 0.08 + (q.life / q.max) * 0.25;
        x.fillStyle = "#000";
        x.globalCompositeOperation = "multiply";

        for (let py = q.sy; py < q.sy + q.h; py += 5) {
            for (let px = q.sx; px < q.sx + q.w; px += 5) {

                x.beginPath();

                x.arc(
                    px + q.ox,
                    py + q.oy,
                    0.4 + Math.random() * 1.1,
                    0,
                    Math.PI * 2
                );

                x.fill();
            }
        }

        x.restore();
    }
}

// Small colored noise blocks
function noise() {
    if (Math.random() > 0.35) return;
    const colors = [
        "#000000",
        "#00ffff",
        "#ff00ff",
        "#ffff00"
    ];

    const amount = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < amount; i++) {
        const w = c.width * (0.01 + Math.random() * 0.06);
        const h = c.height * (0.005 + Math.random() * 0.025);

        const sx = Math.random() * (c.width - w);
        const sy = Math.random() * (c.height - h);

        x.save();
        x.globalAlpha = 0.2 + Math.random() * 0.35;

        x.fillStyle =
            colors[Math.floor(Math.random() * colors.length)];

        x.fillRect(sx, sy, w, h);
        x.restore();
    }
}

// Main glitch animation
function glitch(t) {
    if (!running) return;
    const p = Math.min((t - start) / 1400, 1);
    const w = c.width;
    const h = c.height;

    x.clearRect(0, 0, w, h);

    // Start: mostly normal image
    if (p < 0.1) {
        x.drawImage(a, 0, 0, w, h);

        if (Math.random() < 0.65)
            blocks(a, 0.4);

        // First glitch stage
    } else if (p < 0.38) {
        x.drawImage(a, 0, 0, w, h);
        layer(a, layers[0], 0.8); // Cyan
        layer(a, layers[1], 0.8); // Magenta
        if (Math.random() < 0.9) slices(a, 1);
        if (Math.random() < 0.85) blocks(a, 1);
        if (Math.random() < 0.6) rgbBlocks(a, 1);
        if (Math.random() < 0.35)
            layer(a, layers[5], 0.7); // Black
        if (Math.random() < 0.5)
            blackDrag(a, 1);
        if (Math.random() < 0.3)
            blackHalftoneDrag(a, 1);
        noise();

        // Heavy glitch stage
    } else if (p < 0.7) {
        x.drawImage(a, 0, 0, w, h);
        layer(a, layers[0], 1); // Cyan
        layer(a, layers[1], 1); // Magenta

        if (Math.random() < 0.75)
            layer(a, layers[2], 0.7); // Blue

        if (Math.random() < 0.75)
            layer(a, layers[3], 0.7); // Pink

        if (Math.random() < 0.7)
            layer(a, layers[4], 0.75); // Yellow

        if (Math.random() < 0.55)
            layer(a, layers[5], 0.8); // Black

        if (Math.random() < 0.95) slices(a, 1);
        if (Math.random() < 0.9) blocks(a, 1);
        if (Math.random() < 0.65) rgbBlocks(a, 1);

        if (Math.random() < 0.7)
            blackDrag(a, 1);

        if (Math.random() < 0.4)
            blackHalftoneDrag(a, 1);

        noise();

        // Transition to hover image
    } else if (p < 0.9) {
        const img = Math.random() < 0.5 ? a : b;
        x.drawImage(img, 0, 0, w, h);

        if (Math.random() < 0.9) slices(img, 1);
        if (Math.random() < 0.95) blocks(img, 1);
        if (Math.random() < 0.7) rgbBlocks(img, 1);

        if (Math.random() < 0.7) {
            const colors = [0, 1, 4];
            const index =
                colors[Math.floor(Math.random() * colors.length)];

            layer(img, layers[index], 0.8);
        }

        if (Math.random() < 0.4)
            layer(img, layers[5], 0.7);

        if (Math.random() < 0.7)
            blackDrag(img, 1);

        if (Math.random() < 0.45)
            blackHalftoneDrag(img, 1);

        noise();

        // Finish with hover image
    } else {
        x.drawImage(b, 0, 0, w, h);

        if (Math.random() < 0.8)
            blocks(b, 0.7);

        if (Math.random() < 0.6)
            slices(b, 0.6);

        if (Math.random() < 0.45)
            rgbBlocks(b, 0.55);

        if (Math.random() < 0.3) {
            const colors = [0, 1, 4];
            const index =
                colors[Math.floor(Math.random() * colors.length)];

            layer(b, layers[index], 0.5);
        }

        if (Math.random() < 0.35)
            blackDrag(b, 0.7);

        if (Math.random() < 0.2)
            blackHalftoneDrag(b, 0.6);

        noise();
    }

    // Keep animating until glitch is finished
    if (p < 1) {
        frame = requestAnimationFrame(glitch);

    } else {
        running = false;
        x.clearRect(0, 0, w, h);
        x.drawImage(b, 0, 0, w, h);

        blackTrails = [];
        logo.classList.add("done");
    }
}

// Start glitch when mouse enters
logo.addEventListener("mouseenter", () => {
    if (running) return;
    running = true;
    logo.classList.remove("done");
    blackTrails = [];

    start = performance.now();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(glitch);
});

// Stop when mouse leaves
logo.addEventListener("mouseleave", () => {
    running = false;
    cancelAnimationFrame(frame);
    blackTrails = [];

    x.clearRect(0, 0, c.width, c.height);
    logo.classList.remove("done");
});

// Touchscreen
logo.addEventListener("click", () => {
    if (window.matchMedia("(hover: none)").matches) {
        if (!running && !logo.classList.contains("done")) {
            running = true;
            blackTrails = [];
            start = performance.now();
            frame = requestAnimationFrame(glitch);
        }
    }
});