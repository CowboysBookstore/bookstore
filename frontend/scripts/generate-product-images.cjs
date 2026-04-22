const fs = require("fs");
const path = require("path");

const catalogPath = path.join(__dirname, "..", "src", "storefront", "catalog.json");
const outputDir = path.join(__dirname, "..", "public", "product-images");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

fs.mkdirSync(outputDir, { recursive: true });

const variants = {
  "eng-101-writing-handbook": { type: "book", label: "ENG 101", kicker: "Writing" },
  "math-231-calculus-pack": { type: "book", label: "MATH 231", kicker: "Calculus" },
  "bio-214-lab-kit": { type: "kit", label: "BIO 214", kicker: "Lab Kit" },
  "cowboy-study-planner": { type: "planner", label: "Semester", kicker: "Planner" },
  "graphing-calculator-pro": { type: "calculator", label: "Graphing", kicker: "Calculator" },
  "laptop-sleeve-14": { type: "sleeve", label: "14 Inch", kicker: "Laptop Sleeve" },
  "cowboy-hoodie-navy": { type: "hoodie", label: "Navy", kicker: "Cowboy Hoodie" },
  "mcneese-tumbler-gold": { type: "tumbler", label: "Gold", kicker: "McNeese Tumbler" },
  "hist-210-civil-war-reader": { type: "book", label: "HIST 210", kicker: "Civil War" },
  "psyc-201-study-guide": { type: "book", label: "PSYC 201", kicker: "Study Guide" },
  "chem-121-lab-manual": { type: "book", label: "CHEM 121", kicker: "Lab Manual" },
  "bus-310-marketing-casebook": { type: "book", label: "BUS 310", kicker: "Marketing" },
  "nurs-205-clinical-skills-handbook": { type: "book", label: "NURS 205", kicker: "Clinical" },
  "cs-150-python-starter-text": { type: "book", label: "CS 150", kicker: "Python" },
  "acct-220-financial-accounting-set": { type: "book", label: "ACCT 220", kicker: "Accounting" },
  "art-130-design-foundations-reader": { type: "book", label: "ART 130", kicker: "Design" },
  "college-ruled-notebook-5pk": { type: "notebooks", label: "5 Pack", kicker: "Notebooks" },
  "black-gel-pen-pack": { type: "pens", label: "12 Pack", kicker: "Gel Pens" },
  "pastel-highlighter-set": { type: "highlighters", label: "Pastel", kicker: "Highlighters" },
  "engineering-graph-pad": { type: "graphpad", label: "Grid", kicker: "Graph Pad" },
  "binder-starter-kit": { type: "binder", label: "Starter", kicker: "Binder Kit" },
  "index-card-study-pack": { type: "cards", label: "Study", kicker: "Index Cards" },
  "usb-c-flash-drive-128": { type: "flashdrive", label: "128 GB", kicker: "USB-C Drive" },
  "noise-cancel-earbuds": { type: "earbuds", label: "Noise", kicker: "Cancel" },
  "wireless-mouse-slim": { type: "mouse", label: "Wireless", kicker: "Mouse" },
  "portable-charger-10000": { type: "powerbank", label: "10K", kicker: "Power Bank" },
  "webcam-hd-study": { type: "webcam", label: "HD", kicker: "Study Webcam" },
  "laptop-stand-folding": { type: "stand", label: "Folding", kicker: "Laptop Stand" },
  "usb-c-hub-6in1": { type: "hub", label: "6 in 1", kicker: "USB-C Hub" },
  "cowboy-cap-white": { type: "cap", label: "White", kicker: "Cowboy Cap" },
  "mcneese-lanyard-classic": { type: "lanyard", label: "Classic", kicker: "Lanyard" },
  "bookstore-tote-canvas": { type: "tote", label: "Canvas", kicker: "Bookstore Tote" },
  "cowboy-crewneck-heather": { type: "crewneck", label: "Heather", kicker: "Crewneck" },
  "stadium-blanket-blue": { type: "blanket", label: "Blue", kicker: "Stadium Blanket" },
  "cowboy-athletics-tee": { type: "tee", label: "Athletics", kicker: "Cowboy Tee" },
  "cowboy-socks-2pk": { type: "socks", label: "2 Pack", kicker: "Cowboy Socks" },
};

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function colorsFromGradient(gradient) {
  const matches = String(gradient).match(/#[0-9a-fA-F]{6}/g) || [];
  const fallback = ["#0f172a", "#1d4ed8", "#60a5fa"];
  return [matches[0] || fallback[0], matches[1] || fallback[1], matches[2] || fallback[2]];
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const int = Number.parseInt(clean, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function patternFor(category, color) {
  if (category === "Textbooks") {
    return `
      <g opacity="0.18" stroke="${rgba(color, 0.35)}" stroke-width="8" stroke-linecap="round">
        <path d="M120 250 L520 80" />
        <path d="M180 360 L640 120" />
        <path d="M220 500 L780 160" />
        <path d="M380 1120 L960 710" />
      </g>`;
  }

  if (category === "Office Supplies") {
    return `
      <g opacity="0.18" fill="${rgba(color, 0.35)}">
        ${Array.from({ length: 6 }, (_, row) =>
          Array.from(
            { length: 8 },
            (_, col) =>
              `<circle cx="${170 + col * 170}" cy="${180 + row * 150}" r="10" />`,
          ).join(""),
        ).join("")}
      </g>`;
  }

  if (category === "Tech Accessories") {
    return `
      <g opacity="0.18" stroke="${rgba(color, 0.4)}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M160 230 H360 V430 H560" />
        <path d="M1040 220 H1320 V380 H1160" />
        <path d="M260 930 H520 V760 H780" />
        <path d="M980 980 H1290 V800 H1120" />
        <circle cx="360" cy="430" r="18" fill="${rgba(color, 0.4)}" stroke="none" />
        <circle cx="560" cy="430" r="18" fill="${rgba(color, 0.4)}" stroke="none" />
        <circle cx="1160" cy="380" r="18" fill="${rgba(color, 0.4)}" stroke="none" />
        <circle cx="780" cy="760" r="18" fill="${rgba(color, 0.4)}" stroke="none" />
      </g>`;
  }

  return `
    <g opacity="0.18" stroke="${rgba(color, 0.4)}" stroke-width="12" stroke-linecap="round" fill="none">
      <path d="M100 900 C280 760, 420 760, 620 900" />
      <path d="M520 180 C720 40, 960 40, 1180 220" />
      <path d="M980 960 C1130 840, 1300 860, 1460 1000" />
    </g>`;
}

function labelBlock(tertiary, label, kicker, category) {
  return `
    <g transform="translate(110 960)">
      <rect width="540" height="150" rx="32" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.28)" stroke-width="3" />
      <text x="34" y="58" fill="rgba(255,255,255,0.72)" font-size="22" font-family="Arial, sans-serif" font-weight="700" letter-spacing="3">${escapeXml(category.toUpperCase())}</text>
      <text x="34" y="110" fill="#ffffff" font-size="54" font-family="Arial, sans-serif" font-weight="800">${escapeXml(label)}</text>
      <text x="34" y="138" fill="${escapeXml(tertiary)}" font-size="24" font-family="Arial, sans-serif" font-weight="700" letter-spacing="1.6">${escapeXml(kicker.toUpperCase())}</text>
    </g>`;
}

function chip(text, x, y, fill) {
  const width = Math.max(140, text.length * 18 + 44);
  return `
    <g transform="translate(${x} ${y})">
      <rect width="${width}" height="50" rx="25" fill="${fill}" />
      <text x="22" y="33" fill="#ffffff" font-size="22" font-family="Arial, sans-serif" font-weight="700" letter-spacing="1.4">${escapeXml(text.toUpperCase())}</text>
    </g>`;
}

function renderBook(primary, tertiary, label, kicker) {
  return `
    <g transform="translate(470 180)">
      <ellipse cx="320" cy="615" rx="245" ry="44" fill="rgba(15,23,42,0.20)" />
      <g transform="rotate(-11 320 300)">
        <rect x="120" y="28" width="420" height="560" rx="34" fill="${rgba("#ffffff", 0.9)}" />
        <rect x="92" y="62" width="420" height="560" rx="34" fill="url(#objectGradient)" />
        <rect x="146" y="126" width="312" height="330" rx="28" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.28)" stroke-width="4" />
        <path d="M170 170 H430 M170 214 H386 M170 258 H344" stroke="rgba(255,255,255,0.28)" stroke-width="12" stroke-linecap="round" />
        <text x="172" y="362" fill="#ffffff" font-size="62" font-family="Arial, sans-serif" font-weight="800" letter-spacing="2">${escapeXml(label)}</text>
        <text x="172" y="420" fill="${escapeXml(tertiary)}" font-size="28" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2.4">${escapeXml(kicker.toUpperCase())}</text>
        <rect x="116" y="82" width="48" height="522" rx="16" fill="${rgba(primary, 0.42)}" />
      </g>
      <path d="M132 528 C196 502, 250 506, 314 528" stroke="rgba(255,255,255,0.9)" stroke-width="16" stroke-linecap="round" />
    </g>`;
}

function renderPlanner() {
  return `
    <g transform="translate(470 170)">
      <ellipse cx="330" cy="645" rx="250" ry="46" fill="rgba(15,23,42,0.20)" />
      <rect x="115" y="70" width="430" height="560" rx="38" fill="rgba(255,255,255,0.92)" />
      <rect x="115" y="70" width="430" height="128" rx="38" fill="url(#objectGradient)" />
      <rect x="170" y="170" width="320" height="400" rx="30" fill="rgba(15,23,42,0.05)" />
      ${[0, 1, 2, 3, 4]
        .map(
          (i) =>
            `<circle cx="${195 + i * 70}" cy="138" r="22" fill="${rgba("#0f172a", 0.5)}" />`,
        )
        .join("")}
      ${[0, 1, 2, 3, 4, 5]
        .map(
          (i) =>
            `<line x1="198" y1="${250 + i * 52}" x2="460" y2="${250 + i * 52}" stroke="rgba(15,23,42,0.18)" stroke-width="10" stroke-linecap="round" />`,
        )
        .join("")}
      <rect x="206" y="278" width="110" height="92" rx="18" fill="rgba(255,255,255,0.6)" />
      <rect x="338" y="278" width="110" height="92" rx="18" fill="rgba(255,255,255,0.36)" />
      <rect x="206" y="392" width="242" height="118" rx="22" fill="rgba(255,255,255,0.42)" />
    </g>`;
}

function renderKit(secondary, tertiary) {
  return `
    <g transform="translate(400 220)">
      <ellipse cx="380" cy="560" rx="280" ry="48" fill="rgba(15,23,42,0.20)" />
      <rect x="170" y="180" width="400" height="250" rx="34" fill="rgba(255,255,255,0.92)" />
      <rect x="150" y="210" width="400" height="250" rx="34" fill="url(#objectGradient)" />
      <path d="M210 250 H490" stroke="rgba(255,255,255,0.32)" stroke-width="12" stroke-linecap="round" />
      <rect x="260" y="80" width="120" height="180" rx="26" fill="rgba(255,255,255,0.92)" />
      <rect x="286" y="50" width="68" height="44" rx="16" fill="rgba(15,23,42,0.22)" />
      <path d="M610 188 L690 188 L658 360 Q650 392 618 392 Q586 392 578 360 Z" fill="rgba(255,255,255,0.92)" />
      <path d="M632 172 C632 126 680 124 680 172" stroke="${rgba(secondary, 0.95)}" stroke-width="14" fill="none" stroke-linecap="round" />
      <circle cx="645" cy="268" r="24" fill="${rgba(tertiary, 0.58)}" />
      <circle cx="702" cy="344" r="18" fill="rgba(255,255,255,0.92)" />
    </g>`;
}

function renderCalculator() {
  return `
    <g transform="translate(500 170)">
      <ellipse cx="290" cy="660" rx="220" ry="40" fill="rgba(15,23,42,0.20)" />
      <rect x="100" y="50" width="380" height="600" rx="44" fill="rgba(255,255,255,0.92)" />
      <rect x="100" y="50" width="380" height="600" rx="44" fill="url(#objectGradient)" opacity="0.94" />
      <rect x="148" y="110" width="284" height="130" rx="24" fill="rgba(15,23,42,0.28)" />
      <path d="M180 178 H342" stroke="rgba(255,255,255,0.68)" stroke-width="18" stroke-linecap="round" />
      ${Array.from({ length: 4 }, (_, row) =>
        Array.from(
          { length: 4 },
          (_, col) =>
            `<rect x="${148 + col * 70}" y="${290 + row * 78}" width="54" height="54" rx="16" fill="${col === 3 ? "rgba(255,255,255,0.36)" : "rgba(255,255,255,0.88)"}" />`,
        ).join(""),
      ).join("")}
    </g>`;
}

function renderSleeve(primary) {
  return `
    <g transform="translate(420 250)">
      <ellipse cx="360" cy="510" rx="260" ry="42" fill="rgba(15,23,42,0.20)" />
      <g transform="rotate(-7 360 270)">
        <rect x="150" y="130" width="430" height="280" rx="46" fill="rgba(255,255,255,0.88)" />
        <rect x="130" y="154" width="430" height="280" rx="46" fill="url(#objectGradient)" />
        <rect x="190" y="192" width="312" height="172" rx="26" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.24)" stroke-width="5" />
        <path d="M210 222 H450" stroke="rgba(255,255,255,0.34)" stroke-width="12" stroke-linecap="round" />
      </g>
      <g transform="translate(46 36)">
        <rect x="260" y="64" width="320" height="220" rx="24" fill="rgba(255,255,255,0.82)" />
        <rect x="286" y="88" width="268" height="154" rx="18" fill="${rgba(primary, 0.3)}" />
      </g>
    </g>`;
}

function renderHoodie() {
  return `
    <g transform="translate(430 180)">
      <ellipse cx="340" cy="640" rx="255" ry="46" fill="rgba(15,23,42,0.20)" />
      <path d="M260 118 C300 52 382 52 420 118 L482 162 L540 286 L476 324 L450 560 Q446 604 404 604 H276 Q234 604 230 560 L204 324 L140 286 L198 162 Z" fill="rgba(255,255,255,0.92)" />
      <path d="M260 118 C300 52 382 52 420 118 L482 162 L540 286 L476 324 L450 560 Q446 604 404 604 H276 Q234 604 230 560 L204 324 L140 286 L198 162 Z" fill="url(#objectGradient)" opacity="0.96" />
      <path d="M284 156 C316 122 364 122 396 156" stroke="rgba(255,255,255,0.85)" stroke-width="14" stroke-linecap="round" fill="none" />
      <rect x="246" y="350" width="188" height="126" rx="32" fill="rgba(255,255,255,0.16)" />
      <path d="M296 438 H384" stroke="rgba(255,255,255,0.46)" stroke-width="12" stroke-linecap="round" />
    </g>`;
}

function renderTumbler(primary) {
  return `
    <g transform="translate(570 170)">
      <ellipse cx="220" cy="660" rx="160" ry="34" fill="rgba(15,23,42,0.20)" />
      <path d="M110 110 H330 L288 596 Q282 650 220 650 Q158 650 152 596 Z" fill="rgba(255,255,255,0.92)" />
      <path d="M110 110 H330 L288 596 Q282 650 220 650 Q158 650 152 596 Z" fill="url(#objectGradient)" opacity="0.95" />
      <rect x="130" y="74" width="180" height="56" rx="20" fill="${rgba(primary, 0.96)}" />
      <path d="M168 228 H272" stroke="rgba(255,255,255,0.34)" stroke-width="14" stroke-linecap="round" />
      <circle cx="220" cy="352" r="74" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.28)" stroke-width="4" />
      <path d="M188 352 H252" stroke="rgba(255,255,255,0.48)" stroke-width="12" stroke-linecap="round" />
    </g>`;
}

function renderNotebooks() {
  return `
    <g transform="translate(380 250)">
      <ellipse cx="380" cy="560" rx="280" ry="48" fill="rgba(15,23,42,0.20)" />
      <g transform="rotate(-8 370 280)">
        <rect x="210" y="180" width="350" height="290" rx="30" fill="rgba(255,255,255,0.42)" />
        <rect x="180" y="150" width="350" height="290" rx="30" fill="rgba(255,255,255,0.66)" />
        <rect x="150" y="120" width="350" height="290" rx="30" fill="rgba(255,255,255,0.92)" />
        <rect x="150" y="120" width="350" height="290" rx="30" fill="url(#objectGradient)" opacity="0.96" />
      </g>
      ${[0, 1, 2, 3, 4, 5]
        .map(
          (i) =>
            `<line x1="250" y1="${270 + i * 30}" x2="670" y2="${270 + i * 30}" stroke="rgba(255,255,255,0.34)" stroke-width="10" stroke-linecap="round" />`,
        )
        .join("")}
    </g>`;
}

function renderPens() {
  return `
    <g transform="translate(360 230)">
      <ellipse cx="420" cy="580" rx="300" ry="42" fill="rgba(15,23,42,0.20)" />
      ${[0, 90, 180]
        .map(
          (offset, index) => `
        <g transform="translate(${200 + offset} ${160 + index * 10}) rotate(${18 - index * 7} 120 220)">
          <rect x="70" y="120" width="100" height="300" rx="34" fill="rgba(255,255,255,0.92)" />
          <rect x="70" y="120" width="100" height="300" rx="34" fill="${index === 1 ? "rgba(255,255,255,0.68)" : index === 2 ? "rgba(255,255,255,0.46)" : "url(#objectGradient)"}" />
          <rect x="70" y="100" width="100" height="44" rx="20" fill="rgba(15,23,42,0.28)" />
          <path d="M120 430 L94 486 H146 Z" fill="rgba(255,255,255,0.88)" />
        </g>`,
        )
        .join("")}
    </g>`;
}

function renderHighlighters() {
  return `
    <g transform="translate(360 240)">
      <ellipse cx="430" cy="560" rx="300" ry="42" fill="rgba(15,23,42,0.20)" />
      ${[
        { x: 200, y: 170, fill: "rgba(255,255,255,0.56)" },
        { x: 320, y: 150, fill: "rgba(255,255,255,0.72)" },
        { x: 440, y: 178, fill: "url(#objectGradient)" },
      ]
        .map(
          (item, index) => `
        <g transform="translate(${item.x} ${item.y}) rotate(${index === 1 ? 6 : -6} 90 230)">
          <rect x="40" y="110" width="120" height="280" rx="30" fill="rgba(255,255,255,0.9)" />
          <rect x="40" y="110" width="120" height="280" rx="30" fill="${item.fill}" />
          <rect x="40" y="330" width="120" height="60" rx="16" fill="rgba(255,255,255,0.48)" />
          <rect x="70" y="68" width="60" height="60" rx="12" fill="rgba(15,23,42,0.22)" />
        </g>`,
        )
        .join("")}
    </g>`;
}

function renderGraphPad(primary) {
  return `
    <g transform="translate(470 180)">
      <ellipse cx="320" cy="640" rx="240" ry="42" fill="rgba(15,23,42,0.20)" />
      <rect x="100" y="70" width="420" height="560" rx="34" fill="rgba(255,255,255,0.92)" />
      <rect x="100" y="70" width="420" height="560" rx="34" fill="url(#objectGradient)" opacity="0.96" />
      <rect x="142" y="130" width="336" height="428" rx="20" fill="rgba(255,255,255,0.18)" />
      ${Array.from(
        { length: 8 },
        (_, i) =>
          `<line x1="170" y1="${174 + i * 48}" x2="450" y2="${174 + i * 48}" stroke="rgba(255,255,255,0.28)" stroke-width="6" />`,
      ).join("")}
      ${Array.from(
        { length: 6 },
        (_, i) =>
          `<line x1="${192 + i * 48}" y1="154" x2="${192 + i * 48}" y2="540" stroke="rgba(255,255,255,0.28)" stroke-width="6" />`,
      ).join("")}
      ${[0, 1, 2, 3, 4]
        .map(
          (i) =>
            `<circle cx="${160 + i * 64}" cy="104" r="12" fill="${rgba(primary, 0.92)}" />`,
        )
        .join("")}
    </g>`;
}

function renderBinder(primary) {
  return `
    <g transform="translate(380 210)">
      <ellipse cx="380" cy="600" rx="280" ry="42" fill="rgba(15,23,42,0.20)" />
      <rect x="200" y="110" width="390" height="470" rx="34" fill="rgba(255,255,255,0.92)" />
      <rect x="200" y="110" width="390" height="470" rx="34" fill="url(#objectGradient)" opacity="0.95" />
      <rect x="154" y="150" width="110" height="386" rx="26" fill="${rgba(primary, 0.88)}" />
      ${[0, 1, 2]
        .map(
          (i) =>
            `<circle cx="258" cy="${220 + i * 110}" r="28" fill="rgba(255,255,255,0.9)" /><circle cx="258" cy="${220 + i * 110}" r="16" fill="${rgba(primary, 0.92)}" />`,
        )
        .join("")}
      <rect x="340" y="190" width="186" height="280" rx="20" fill="rgba(255,255,255,0.16)" />
      ${[0, 1, 2, 3, 4]
        .map(
          (i) =>
            `<line x1="360" y1="${242 + i * 40}" x2="500" y2="${242 + i * 40}" stroke="rgba(255,255,255,0.32)" stroke-width="8" stroke-linecap="round" />`,
        )
        .join("")}
    </g>`;
}

function renderCards() {
  return `
    <g transform="translate(390 250)">
      <ellipse cx="390" cy="520" rx="280" ry="40" fill="rgba(15,23,42,0.20)" />
      <g transform="rotate(-9 360 260)">
        <rect x="220" y="200" width="360" height="240" rx="28" fill="rgba(255,255,255,0.42)" />
        <rect x="185" y="168" width="360" height="240" rx="28" fill="rgba(255,255,255,0.62)" />
        <rect x="150" y="136" width="360" height="240" rx="28" fill="rgba(255,255,255,0.92)" />
        <rect x="150" y="136" width="360" height="240" rx="28" fill="url(#objectGradient)" opacity="0.96" />
      </g>
      <rect x="536" y="182" width="92" height="126" rx="20" fill="rgba(255,255,255,0.88)" />
      <rect x="556" y="208" width="52" height="14" rx="7" fill="rgba(15,23,42,0.25)" />
    </g>`;
}

function renderFlashDrive(primary) {
  return `
    <g transform="translate(480 300)">
      <ellipse cx="300" cy="420" rx="230" ry="36" fill="rgba(15,23,42,0.20)" />
      <g transform="rotate(-8 300 210)">
        <rect x="120" y="120" width="300" height="180" rx="40" fill="rgba(255,255,255,0.92)" />
        <rect x="120" y="120" width="300" height="180" rx="40" fill="url(#objectGradient)" opacity="0.96" />
        <rect x="414" y="158" width="120" height="104" rx="20" fill="rgba(255,255,255,0.88)" />
        <rect x="450" y="174" width="20" height="72" rx="10" fill="${rgba(primary, 0.9)}" />
        <rect x="482" y="174" width="20" height="72" rx="10" fill="${rgba(primary, 0.9)}" />
      </g>
      <circle cx="188" cy="214" r="34" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.28)" stroke-width="6" />
    </g>`;
}

function renderEarbuds(secondary, tertiary) {
  return `
    <g transform="translate(420 220)">
      <ellipse cx="370" cy="560" rx="260" ry="42" fill="rgba(15,23,42,0.20)" />
      <rect x="220" y="260" width="300" height="230" rx="90" fill="rgba(255,255,255,0.92)" />
      <rect x="220" y="260" width="300" height="230" rx="90" fill="url(#objectGradient)" opacity="0.96" />
      <path d="M220 372 H520" stroke="rgba(255,255,255,0.24)" stroke-width="10" />
      <g>
        <rect x="150" y="120" width="90" height="170" rx="44" fill="rgba(255,255,255,0.92)" />
        <rect x="150" y="120" width="90" height="170" rx="44" fill="${rgba(secondary, 0.92)}" />
        <rect x="174" y="262" width="42" height="120" rx="20" fill="rgba(255,255,255,0.88)" />
      </g>
      <g transform="translate(540 0)">
        <rect x="150" y="120" width="90" height="170" rx="44" fill="rgba(255,255,255,0.92)" />
        <rect x="150" y="120" width="90" height="170" rx="44" fill="${rgba(tertiary, 0.88)}" />
        <rect x="174" y="262" width="42" height="120" rx="20" fill="rgba(255,255,255,0.88)" />
      </g>
    </g>`;
}

function renderMouse() {
  return `
    <g transform="translate(540 170)">
      <ellipse cx="230" cy="650" rx="180" ry="36" fill="rgba(15,23,42,0.20)" />
      <path d="M230 96 C334 96 398 182 398 330 V446 C398 564 324 652 230 652 C136 652 62 564 62 446 V330 C62 182 126 96 230 96 Z" fill="rgba(255,255,255,0.92)" />
      <path d="M230 96 C334 96 398 182 398 330 V446 C398 564 324 652 230 652 C136 652 62 564 62 446 V330 C62 182 126 96 230 96 Z" fill="url(#objectGradient)" opacity="0.96" />
      <path d="M230 112 V284" stroke="rgba(255,255,255,0.32)" stroke-width="10" stroke-linecap="round" />
      <rect x="198" y="152" width="64" height="102" rx="28" fill="rgba(255,255,255,0.16)" />
    </g>`;
}

function renderPowerBank(secondary) {
  return `
    <g transform="translate(450 260)">
      <ellipse cx="330" cy="500" rx="250" ry="40" fill="rgba(15,23,42,0.20)" />
      <rect x="140" y="150" width="430" height="250" rx="40" fill="rgba(255,255,255,0.92)" />
      <rect x="140" y="150" width="430" height="250" rx="40" fill="url(#objectGradient)" opacity="0.96" />
      <rect x="570" y="232" width="26" height="86" rx="10" fill="rgba(15,23,42,0.32)" />
      <rect x="208" y="226" width="190" height="96" rx="22" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.28)" stroke-width="4" />
      <rect x="226" y="244" width="140" height="60" rx="18" fill="rgba(255,255,255,0.88)" />
      <rect x="270" y="196" width="86" height="16" rx="8" fill="rgba(255,255,255,0.56)" />
      <path d="M108 256 C70 256 70 188 126 188 H170" stroke="${rgba(secondary, 0.92)}" stroke-width="16" stroke-linecap="round" fill="none" />
    </g>`;
}

function renderWebcam(tertiary, primary) {
  return `
    <g transform="translate(440 210)">
      <ellipse cx="350" cy="590" rx="250" ry="40" fill="rgba(15,23,42,0.20)" />
      <rect x="170" y="140" width="360" height="240" rx="56" fill="rgba(255,255,255,0.92)" />
      <rect x="170" y="140" width="360" height="240" rx="56" fill="url(#objectGradient)" opacity="0.96" />
      <circle cx="350" cy="260" r="84" fill="rgba(15,23,42,0.26)" />
      <circle cx="350" cy="260" r="52" fill="${rgba(tertiary, 0.78)}" />
      <circle cx="350" cy="260" r="22" fill="rgba(255,255,255,0.68)" />
      <rect x="320" y="380" width="60" height="120" rx="18" fill="rgba(255,255,255,0.82)" />
      <rect x="240" y="490" width="220" height="36" rx="18" fill="${rgba(primary, 0.9)}" />
    </g>`;
}

function renderStand(primary) {
  return `
    <g transform="translate(390 200)">
      <ellipse cx="390" cy="620" rx="280" ry="42" fill="rgba(15,23,42,0.20)" />
      <rect x="190" y="140" width="380" height="230" rx="28" fill="rgba(255,255,255,0.92)" />
      <rect x="190" y="140" width="380" height="230" rx="28" fill="url(#objectGradient)" opacity="0.96" />
      <rect x="226" y="174" width="308" height="160" rx="18" fill="rgba(255,255,255,0.18)" />
      <path d="M280 400 L390 580 H520" stroke="rgba(255,255,255,0.88)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <path d="M220 624 H554" stroke="${rgba(primary, 0.92)}" stroke-width="24" stroke-linecap="round" />
    </g>`;
}

function renderHub(secondary) {
  return `
    <g transform="translate(440 270)">
      <ellipse cx="360" cy="460" rx="260" ry="36" fill="rgba(15,23,42,0.20)" />
      <g transform="rotate(-8 360 200)">
        <rect x="190" y="160" width="340" height="170" rx="44" fill="rgba(255,255,255,0.92)" />
        <rect x="190" y="160" width="340" height="170" rx="44" fill="url(#objectGradient)" opacity="0.96" />
        ${[0, 1, 2]
          .map(
            (i) =>
              `<rect x="${250 + i * 82}" y="214" width="52" height="62" rx="14" fill="rgba(255,255,255,0.8)" />`,
          )
          .join("")}
        <rect x="504" y="214" width="28" height="62" rx="12" fill="rgba(255,255,255,0.8)" />
      </g>
      <path d="M540 250 C650 250 670 150 730 150" stroke="${rgba(secondary, 0.92)}" stroke-width="18" stroke-linecap="round" fill="none" />
      <rect x="720" y="126" width="72" height="46" rx="16" fill="rgba(255,255,255,0.88)" />
    </g>`;
}

function renderCap(secondary) {
  return `
    <g transform="translate(420 260)">
      <ellipse cx="370" cy="490" rx="270" ry="36" fill="rgba(15,23,42,0.20)" />
      <path d="M180 332 C220 218 338 148 464 182 C564 210 628 284 634 366 H190 C186 354 182 344 180 332 Z" fill="rgba(255,255,255,0.92)" />
      <path d="M180 332 C220 218 338 148 464 182 C564 210 628 284 634 366 H190 C186 354 182 344 180 332 Z" fill="url(#objectGradient)" opacity="0.96" />
      <path d="M628 360 C728 368 772 408 790 468 C640 482 542 462 430 404" fill="rgba(255,255,255,0.82)" />
      <path d="M628 360 C728 368 772 408 790 468 C640 482 542 462 430 404" fill="${rgba(secondary, 0.9)}" />
      <path d="M306 314 H520" stroke="rgba(255,255,255,0.34)" stroke-width="12" stroke-linecap="round" />
    </g>`;
}

function renderLanyard(secondary) {
  return `
    <g transform="translate(520 140)">
      <ellipse cx="240" cy="700" rx="170" ry="34" fill="rgba(15,23,42,0.20)" />
      <path d="M120 160 C120 46 360 46 360 160 C360 258 322 332 286 410 L246 498 H234 L194 410 C158 332 120 258 120 160 Z" stroke="rgba(255,255,255,0.9)" stroke-width="26" fill="none" stroke-linecap="round" />
      <path d="M120 160 C120 46 360 46 360 160" stroke="${rgba(secondary, 0.96)}" stroke-width="12" fill="none" stroke-linecap="round" />
      <rect x="134" y="474" width="212" height="236" rx="30" fill="rgba(255,255,255,0.92)" />
      <rect x="134" y="474" width="212" height="236" rx="30" fill="url(#objectGradient)" opacity="0.96" />
      <rect x="186" y="524" width="108" height="72" rx="20" fill="rgba(255,255,255,0.18)" />
      <path d="M184 632 H296" stroke="rgba(255,255,255,0.34)" stroke-width="12" stroke-linecap="round" />
    </g>`;
}

function renderTote() {
  return `
    <g transform="translate(450 220)">
      <ellipse cx="330" cy="560" rx="250" ry="40" fill="rgba(15,23,42,0.20)" />
      <path d="M170 220 H490 L450 620 H210 Z" fill="rgba(255,255,255,0.92)" />
      <path d="M170 220 H490 L450 620 H210 Z" fill="url(#objectGradient)" opacity="0.96" />
      <path d="M230 224 C230 136 302 88 330 88 C358 88 430 136 430 224" stroke="rgba(255,255,255,0.9)" stroke-width="16" fill="none" stroke-linecap="round" />
      <rect x="248" y="320" width="164" height="154" rx="28" fill="rgba(255,255,255,0.16)" />
      <path d="M280 382 H380" stroke="rgba(255,255,255,0.38)" stroke-width="14" stroke-linecap="round" />
    </g>`;
}

function renderCrewneck() {
  return `
    <g transform="translate(430 210)">
      <ellipse cx="340" cy="610" rx="250" ry="42" fill="rgba(15,23,42,0.20)" />
      <path d="M236 148 C278 106 402 106 444 148 L552 214 L506 326 L472 298 L450 572 Q446 616 404 616 H276 Q234 616 230 572 L208 298 L174 326 L128 214 Z" fill="rgba(255,255,255,0.92)" />
      <path d="M236 148 C278 106 402 106 444 148 L552 214 L506 326 L472 298 L450 572 Q446 616 404 616 H276 Q234 616 230 572 L208 298 L174 326 L128 214 Z" fill="url(#objectGradient)" opacity="0.96" />
      <path d="M284 152 C318 190 364 190 396 152" stroke="rgba(255,255,255,0.84)" stroke-width="14" fill="none" stroke-linecap="round" />
      <path d="M274 374 H406" stroke="rgba(255,255,255,0.34)" stroke-width="16" stroke-linecap="round" />
    </g>`;
}

function renderBlanket(primary) {
  return `
    <g transform="translate(360 280)">
      <ellipse cx="420" cy="450" rx="300" ry="36" fill="rgba(15,23,42,0.20)" />
      <path d="M140 220 H520 Q612 220 654 300 L714 418 H312 Q236 418 192 364 Z" fill="rgba(255,255,255,0.92)" />
      <path d="M140 220 H520 Q612 220 654 300 L714 418 H312 Q236 418 192 364 Z" fill="url(#objectGradient)" opacity="0.96" />
      <path d="M224 262 H538 M212 318 H600 M248 374 H644" stroke="rgba(255,255,255,0.32)" stroke-width="12" stroke-linecap="round" />
      <path d="M664 418 C698 388 722 334 716 278" stroke="${rgba(primary, 0.94)}" stroke-width="18" fill="none" stroke-linecap="round" />
    </g>`;
}

function renderTee() {
  return `
    <g transform="translate(430 210)">
      <ellipse cx="340" cy="610" rx="250" ry="42" fill="rgba(15,23,42,0.20)" />
      <path d="M246 154 C282 120 398 120 434 154 L548 214 L498 316 L446 284 L430 568 Q426 604 390 604 H290 Q254 604 250 568 L234 284 L182 316 L132 214 Z" fill="rgba(255,255,255,0.92)" />
      <path d="M246 154 C282 120 398 120 434 154 L548 214 L498 316 L446 284 L430 568 Q426 604 390 604 H290 Q254 604 250 568 L234 284 L182 316 L132 214 Z" fill="url(#objectGradient)" opacity="0.96" />
      <circle cx="340" cy="364" r="82" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.26)" stroke-width="6" />
      <path d="M292 364 H388" stroke="rgba(255,255,255,0.42)" stroke-width="14" stroke-linecap="round" />
    </g>`;
}

function renderSocks(secondary) {
  return `
    <g transform="translate(420 250)">
      <ellipse cx="360" cy="520" rx="260" ry="38" fill="rgba(15,23,42,0.20)" />
      <g transform="rotate(-10 230 260)">
        <path d="M170 120 H270 V360 C270 442 222 478 138 478 H102 V390 H148 C180 390 190 378 190 348 Z" fill="rgba(255,255,255,0.92)" />
        <path d="M170 120 H270 V360 C270 442 222 478 138 478 H102 V390 H148 C180 390 190 378 190 348 Z" fill="url(#objectGradient)" opacity="0.96" />
      </g>
      <g transform="translate(260 20) rotate(10 230 260)">
        <path d="M170 120 H270 V360 C270 442 222 478 138 478 H102 V390 H148 C180 390 190 378 190 348 Z" fill="rgba(255,255,255,0.92)" />
        <path d="M170 120 H270 V360 C270 442 222 478 138 478 H102 V390 H148 C180 390 190 378 190 348 Z" fill="${rgba(secondary, 0.92)}" />
      </g>
      ${[0, 1, 2]
        .map(
          (i) =>
            `<path d="M510 ${260 + i * 54} H640" stroke="rgba(255,255,255,0.38)" stroke-width="12" stroke-linecap="round" />`,
        )
        .join("")}
    </g>`;
}

function renderGraphic(type, primary, secondary, tertiary, label, kicker) {
  switch (type) {
    case "book":
      return renderBook(primary, tertiary, label, kicker);
    case "kit":
      return renderKit(secondary, tertiary);
    case "planner":
      return renderPlanner();
    case "calculator":
      return renderCalculator();
    case "sleeve":
      return renderSleeve(primary);
    case "hoodie":
      return renderHoodie();
    case "tumbler":
      return renderTumbler(primary);
    case "notebooks":
      return renderNotebooks();
    case "pens":
      return renderPens();
    case "highlighters":
      return renderHighlighters();
    case "graphpad":
      return renderGraphPad(primary);
    case "binder":
      return renderBinder(primary);
    case "cards":
      return renderCards();
    case "flashdrive":
      return renderFlashDrive(primary);
    case "earbuds":
      return renderEarbuds(secondary, tertiary);
    case "mouse":
      return renderMouse();
    case "powerbank":
      return renderPowerBank(secondary);
    case "webcam":
      return renderWebcam(tertiary, primary);
    case "stand":
      return renderStand(primary);
    case "hub":
      return renderHub(secondary);
    case "cap":
      return renderCap(secondary);
    case "lanyard":
      return renderLanyard(secondary);
    case "tote":
      return renderTote();
    case "crewneck":
      return renderCrewneck();
    case "blanket":
      return renderBlanket(primary);
    case "tee":
      return renderTee();
    case "socks":
      return renderSocks(secondary);
    default:
      return renderBook(primary, tertiary, label, kicker);
  }
}

function buildSvg(product) {
  const variant = variants[product.slug] || {
    type: "book",
    label: product.course || product.badge || product.format,
    kicker: product.category,
  };
  const [primary, secondary, tertiary] = colorsFromGradient(product.cover_gradient);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(product.title)}</title>
  <desc id="desc">Illustrated catalog artwork for ${escapeXml(product.title)}</desc>
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${escapeXml(primary)}" />
      <stop offset="55%" stop-color="${escapeXml(secondary)}" />
      <stop offset="100%" stop-color="${escapeXml(tertiary)}" />
    </linearGradient>
    <linearGradient id="objectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${escapeXml(rgba(primary, 0.96))}" />
      <stop offset="100%" stop-color="${escapeXml(rgba(secondary, 0.88))}" />
    </linearGradient>
    <radialGradient id="glowA" cx="20%" cy="15%" r="70%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.38)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
    <radialGradient id="glowB" cx="85%" cy="18%" r="60%">
      <stop offset="0%" stop-color="${escapeXml(rgba(tertiary, 0.36))}" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
  </defs>
  <rect width="1600" height="1200" fill="url(#bgGradient)" />
  <rect width="1600" height="1200" fill="url(#glowA)" />
  <rect width="1600" height="1200" fill="url(#glowB)" />
  <rect x="60" y="60" width="1480" height="1080" rx="48" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
  ${patternFor(product.category, tertiary)}
  ${chip(product.badge || product.category, 110, 92, rgba(primary, 0.42))}
  ${chip(
    product.format || product.category,
    1320 - Math.max(140, (product.format || product.category).length * 18 + 44),
    92,
    rgba("#0f172a", 0.22),
  )}
  ${renderGraphic(variant.type, primary, secondary, tertiary, variant.label, variant.kicker)}
  ${labelBlock(tertiary, variant.label, variant.kicker, product.category)}
</svg>`;
}

for (const product of catalog) {
  const fileName = `${product.slug}.svg`;
  fs.writeFileSync(path.join(outputDir, fileName), buildSvg(product), "utf8");
  product.image_url = `/product-images/${fileName}`;
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");

console.log(`generated ${catalog.length} product images in ${outputDir}`);
