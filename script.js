const PASSWORD = "17/06/2024";
const SESSION_KEY = "valentine_unlocked_v1";

const noTexts = [
  "មិនព្រម",
  "ប្រាកដទេ អូន?",
  "គិតម្តងទៀតបានទេ?",
  "បងសុំទេ… 🥺",
  "បងនឹងសោកស្តាយណាស់…",
  "សោកស្តាយខ្លាំងណាស់…",
  "អូខេ… បងឈប់សួរហើយ…",
  "លេងទេ… សូមអូនព្រម ❤️",
];

const YES_URL = "https://youtu.be/TsCXMRVAnVE?si=w5cNQgpcz8HjmkIl";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeDateLike(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";

  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }

  return raw
    .replace(/\s+/g, "")
    .replace(/[.\-]/g, "/")
    .replace(/\/{2,}/g, "/");
}

function setYesSize(yesBtn, step) {
  // Grow the Yes button, but cap based on viewport so it behaves on phones/tablets.
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  const maxFont = clamp(Math.floor(Math.min(vw, vh) * 0.34), 90, 280);
  const maxPadX = clamp(Math.floor(vw * 0.45), 160, 620);
  const maxPadY = clamp(Math.floor(vh * 0.30), 110, 420);

  const fontSize = clamp(16 + step * 34, 16, maxFont);
  const padX = clamp(20 + step * 60, 20, maxPadX);
  const padY = clamp(10 + step * 38, 10, maxPadY);

  yesBtn.style.setProperty("--scale", "1");
  yesBtn.style.fontSize = `${fontSize}px`;
  yesBtn.style.padding = `${padY}px ${padX}px`;
  yesBtn.style.maxWidth = "96vw";
}

function initValentine() {
  const question = document.getElementById("question");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const catImg = document.getElementById("catImg");

  let step = 0;

  const moveNoRandomly = () => {
    const bounds = noBtn.parentElement.getBoundingClientRect();
    const btn = noBtn.getBoundingClientRect();

    const pad = 10;
    const halfW = btn.width / 2;
    const halfH = btn.height / 2;

    // We keep translate(-50%, -50%) in CSS, so left/top represent the button center.
    const minX = pad + halfW;
    const maxX = Math.max(minX, bounds.width - pad - halfW);
    const minY = pad + halfH;
    const maxY = Math.max(minY, bounds.height - pad - halfH);

    // Slight bias towards the middle so it feels connected to the "Yes" button.
    const rx = (Math.random() + Math.random()) / 2;
    const ry = (Math.random() + Math.random()) / 2;
    const x = minX + rx * (maxX - minX);
    const y = minY + ry * (maxY - minY);

    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
  };

  noBtn.addEventListener("click", () => {
    step += 1;

    // After the first click, switch into "dodging" layout
    // where Yes stays centered and No can move anywhere.
    if (step === 1) {
      document.body.classList.add("dodging");
    }

    const idx = clamp(step, 0, noTexts.length - 1);
    noBtn.textContent = noTexts[idx];
    catImg.src = "assets/one.gif";
    setYesSize(yesBtn, step);

    moveNoRandomly();
  });

  // Dodge on hover/touch too.
  noBtn.addEventListener("mouseenter", () => {
    if (step > 0) moveNoRandomly();
  });

  noBtn.addEventListener(
    "touchstart",
    () => {
      if (step > 0) moveNoRandomly();
    },
    { passive: true }
  );

  yesBtn.addEventListener("click", () => {
    question.textContent = "ដឹងហើយថា អូននឹងព្រម ❤️";
    catImg.src = "assets/two.gif";
    yesBtn.style.display = "none";
    noBtn.style.display = "none";

    document.body.classList.remove("celebrate");
    // Force reflow to restart animation.
    // eslint-disable-next-line no-unused-expressions
    document.body.offsetHeight;
    document.body.classList.add("celebrate");
    spawnHearts(22);

    window.setTimeout(() => {
      window.location.href = YES_URL;
    }, 650);
  });
}

function spawnHearts(count) {
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart";

    const x = Math.random() * vw;
    const y = vh * (0.55 + Math.random() * 0.35);
    const s = 14 + Math.random() * 26;
    const d = 900 + Math.random() * 900;

    heart.style.setProperty("--x", `${x}px`);
    heart.style.setProperty("--y", `${y}px`);
    heart.style.setProperty("--s", `${s}px`);
    heart.style.setProperty("--d", `${d}ms`);
    document.body.appendChild(heart);

    window.setTimeout(() => heart.remove(), d + 50);
  }
}

function unlockGate(gateEl) {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch (_) {
    // Ignore storage failures (private mode etc).
  }

  document.body.classList.remove("gate-open");
  document.body.classList.add("intro");

  if (!gateEl) return;
  gateEl.classList.add("gate--out");

  window.setTimeout(() => {
    gateEl.remove();
  }, 280);
}

function setupGateThenStart() {
  const gateEl = document.getElementById("gate");
  if (!gateEl) {
    document.body.classList.add("intro");
    initValentine();
    return;
  }

  const alreadyUnlocked = (() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (_) {
      return false;
    }
  })();

  if (alreadyUnlocked) {
    gateEl.remove();
    document.body.classList.add("intro");
    initValentine();
    return;
  }

  document.body.classList.add("gate-open");

  const form = document.getElementById("gateForm");
  const input = document.getElementById("gateInput");
  const error = document.getElementById("gateError");
  const card = gateEl.querySelector(".gateCard");

  const showError = (msg) => {
    if (error) error.textContent = msg;
    if (card) {
      card.classList.remove("gateShake");
      // Force reflow to restart animation.
      // eslint-disable-next-line no-unused-expressions
      card.offsetHeight;
      card.classList.add("gateShake");
    }
  };

  if (input) {
    // Focus after paint so mobile keyboards behave better.
    window.setTimeout(() => input.focus(), 50);
  }

  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = normalizeDateLike(input ? input.value : "");

    if (val === PASSWORD) {
      unlockGate(gateEl);
      initValentine();
      return;
    }

    showError("Password ខុស។ សូមព្យាយាមម្ដងទៀត។");
    if (input) input.select();
  });
}

setupGateThenStart();
