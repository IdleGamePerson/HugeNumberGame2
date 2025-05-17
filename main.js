// News messages for the ticker
const newsMessages = [
    "Welcome to the incremental game!",
    "Tip: Unlock new menus by progressing!",
    "Did you know? The numbers can become astronomical!",
    "Try to reach 10^100 next!",
    "Check out the Statistics menu for your progress.",
  ];
  let newsIndex = 0;
  
  // News ticker logic
  function updateNewsTicker() {
    const newsElem = document.getElementById("news-message");
    newsElem.textContent = newsMessages[newsIndex];
    newsIndex = (newsIndex + 1) % newsMessages.length;
  }
  setInterval(updateNewsTicker, 3500);
  updateNewsTicker();
  
  // Left string box (initially empty, can be updated dynamically)
  const leftStringElem = document.getElementById("left-string");
  // leftStringElem.textContent = "Your string here"; // Default is empty
  
  // MegaNumber display
  const mainNumberElem = document.getElementById("main-number");
  let mainNumber = new MegaNumber(1, 0, 0); // Start at 1
  
  function updateMainNumber() {
    mainNumberElem.textContent = mainNumber.toString();
  }
  updateMainNumber();
  
  // Menu selection logic
  const menuButtons = document.querySelectorAll("#menu-selection .menu-btn:not(.locked)");
  const menuContent = document.getElementById("menu-content");
  menuButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector("#menu-selection .menu-btn.selected").classList.remove("selected");
      btn.classList.add("selected");
      // For now, menus are empty
      menuContent.innerHTML = "";
    });
  });