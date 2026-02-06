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

function setYesSize(yesBtn, step) {
  // Increase size in a way that affects layout (so it pushes the No button)
  // and eventually dominates the screen like in the reference video.
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  // Cap sizes based on viewport so it behaves well on phones/tablets.
  const maxFont = clamp(Math.floor(Math.min(vw, vh) * 0.34), 90, 280);
  const maxPadX = clamp(Math.floor(vw * 0.45), 160, 620);
  const maxPadY = clamp(Math.floor(vh * 0.30), 110, 420);

  const fontSize = clamp(16 + step * 34, 16, maxFont);
  const padX = clamp(20 + step * 60, 20, maxPadX);
  const padY = clamp(10 + step * 38, 10, maxPadY);

  // Keep it visually centered even as it grows.
  yesBtn.style.setProperty("--scale", "1");

  yesBtn.style.fontSize = `${fontSize}px`;
  yesBtn.style.padding = `${padY}px ${padX}px`;

  // Safety: keep it within the viewport width.
  yesBtn.style.maxWidth = "96vw";
}

function main() {
  const question = document.getElementById("question");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const catImg = document.getElementById("catImg");

  let step = 0;

  const moveNoRandomly = () => {
    const bounds = noBtn.parentElement.getBoundingClientRect();
    const btn = noBtn.getBoundingClientRect();

    const pad = 10;
    const maxX = Math.max(pad, bounds.width - btn.width - pad);
    const maxY = Math.max(pad, bounds.height - btn.height - pad);

    // Keep the center area more likely so it still feels connected.
    const x = pad + Math.random() * maxX;
    const y = pad + Math.random() * maxY;

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

    // Move "No" around every time it's clicked.
    moveNoRandomly();
  });

  // Also dodge on hover/touch to make it playful.
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

    // Cute little heart celebration.
    document.body.classList.remove("celebrate");
    // Force reflow to restart animation.
    // eslint-disable-next-line no-unused-expressions
    document.body.offsetHeight;
    document.body.classList.add("celebrate");
    spawnHearts(22);

    // Navigate to the video after the click animation starts.
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

main();
