// --- Formulas ---
function z(s, b, i) {
  return Math.floor((s - b) / i);
}
function f(x, b, i, h, s) {
  const zVal = z(s, b, i);
  if (x <= zVal) {
    return b + i * x;
  } else {
    const delta = x - zVal;
    return b + i * x + h * ((delta ** 2 + delta) / 2);
  }
}
function gc(x, i) {
  const b = ((i - 1) ** 2 + i - 1) / 2;
  const inc = Math.floor(3 + (i ** 2) / 4);
  const h = 1;
  const s = 1024 * Math.log10(2);
  const floorX10 = Math.floor(x / 10);
  return Math.pow(10, f(floorX10, b, inc, h, s));
}
// --- Game State ---
let mainNumber = new MegaNumber(1, 0, 0); // Start at 1

// Generator 1 state
let gen1 = {
  amount: new MegaNumber(0, 0, 0), // Amount owned (MegaNumber)
  ab: 0, // Amount bought (integer)
  multiplier: new MegaNumber(1, 0, 0)
};

// --- DOM references ---
const newsMessages = [
  "Welcome to the incremental game!",
  "Tip: Unlock new menus by progressing!",
  "Did you know? The numbers can become astronomical!",
  "Try to reach 10^100 next!",
  "Check out the Statistics menu for your progress.",
];
let newsIndex = 0;

function updateNewsTicker() {
  const newsElem = document.getElementById("news-message");
  newsElem.textContent = newsMessages[newsIndex];
  newsIndex = (newsIndex + 1) % newsMessages.length;
}
setInterval(updateNewsTicker, 3500);
updateNewsTicker();

const leftStringElem = document.getElementById("left-string");
const mainNumberElem = document.getElementById("main-number");

function updateMainNumber() {
  mainNumberElem.textContent = mainNumber.toString();
}

// --- Menu logic ---
const menuButtons = document.querySelectorAll("#menu-selection .menu-btn:not(.locked)");
const menuContent = document.getElementById("menu-content");

let currentMenu = "Generators";
menuButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector("#menu-selection .menu-btn.selected").classList.remove("selected");
    btn.classList.add("selected");
    currentMenu = btn.textContent;
    if (currentMenu === "Generators") {
      renderGeneratorsMenu();
    } else {
      menuContent.innerHTML = "";
    }
  });
});

// --- Generator 1 UI and logic ---
function getGen1Cost() {
  const costValue = gc(gen1.ab, 1);
  // Round to avoid floating-point precision issues
  const roundedCost = Math.round(costValue * 1e12) / 1e12;
  if (roundedCost < 1e9) {
    return new MegaNumber(roundedCost, 0, 0);
  } else {
    return new MegaNumber(Math.log10(roundedCost), 0, 1);
  }
}
function getGen1Multiplier() {
  // Multiplier is 2^floor(ab/10)
  return new MegaNumber(Math.pow(2, Math.floor(gen1.ab / 10)), 0, 0);
}
function canBuyGen1() {
  const cost = getGen1Cost();
  return mainNumber.compareTo(cost) >= 0;
}
function buyGen1() {
  const cost = getGen1Cost();
  if (!canBuyGen1()) return;
  mainNumber = mainNumber.sub(cost);
  gen1.amount = gen1.amount.add(new MegaNumber(1, 0, 0));
  gen1.ab += 1;
  gen1.multiplier = getGen1Multiplier();
  updateMainNumber();
  renderGeneratorsMenu();
}

// Keep track of last render for menu content to support live updates
let lastGeneratorsMenuHTML = "";

// Render generator(s)
function renderGeneratorsMenu() {
  const cost = getGen1Cost();
  let html = `
    <div style="display:flex;align-items:center;gap:1em;">
      <span>
        Generator 1: 
        <strong>${gen1.amount.toString()}</strong>
        x
        <strong>${gen1.multiplier.toString()}</strong>
      </span>
      <button id="buy-gen1" style="margin-left:2em;">
        Buy - ${cost.toString()}
      </button>
    </div>
  `;
  // Only replace innerHTML if changed for efficiency
  if (menuContent.innerHTML !== html) {
    menuContent.innerHTML = html;
  }
  const buyBtn = document.getElementById("buy-gen1");
  if (buyBtn) {
    buyBtn.onclick = () => buyGen1();
    buyBtn.disabled = !canBuyGen1();
  }
  lastGeneratorsMenuHTML = html;
}

// --- Production loop ---
function productionTick(dt) {
  // Amount * Multiplier / 10 per second
  const prod = gen1.amount.mul(gen1.multiplier).div(new MegaNumber(10, 0, 0)).mul(new MegaNumber(dt, 0, 0));
  mainNumber = mainNumber.add(prod);
  updateMainNumber();
}

// --- UI update loop for generator buttons ---
function uiUpdateLoop() {
  if (currentMenu === "Generators") {
    renderGeneratorsMenu();
  }
  requestAnimationFrame(uiUpdateLoop);
}
uiUpdateLoop();

// --- Main game loop ---
let lastTime = Date.now();
function gameLoop() {
  const now = Date.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  productionTick(dt);
  requestAnimationFrame(gameLoop);
}
gameLoop();

// --- Initial UI ---
updateMainNumber();
renderGeneratorsMenu();
