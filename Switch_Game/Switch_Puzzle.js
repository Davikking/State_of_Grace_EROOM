// switch-puzzle.js
window.renderSwitchPuzzle = function (container) {
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Puzzle 1: Switch Matrix";
  container.appendChild(title);

  const desc = document.createElement("p");
  desc.innerHTML =
    "Each button cycles through three colors. Match the correct combination to unlock the code.";
  container.appendChild(desc);

  const hint = document.createElement("p");
  hint.className = "puzzle-hint";
  hint.textContent =
    "Hint: these colors line up with the later memory puzzle.";
  container.appendChild(hint);

  // 🔐 secret pattern (0,1,2 per button)
  const targetPattern = [1, 0, 1, 0, 1, 0, 1, 0];
  const current = Array(targetPattern.length).fill(0);

  // 🎨 Use arcade-ish colors like the image you sent
  // red, green, yellow, blue, white — we only need 3 states, so pick 3
  const colorStates = [
    { name: "Red", color: "#ef4444" },
    { name: "Yellow", color: "#facc15" },
    { name: "Green", color: "#22c55e" }, // if you want 4th, add: { name: "Blue", color: "#38bdf8" },
  ];

  const grid = document.createElement("div");
  grid.className = "switch-grid";
  container.appendChild(grid);

  const result = document.createElement("div");
  container.appendChild(result);

  function checkSolved() {
    for (let i = 0; i < targetPattern.length; i++) {
      if (current[i] !== targetPattern[i]) return false;
    }
    return true;
  }

  for (let i = 0; i < targetPattern.length; i++) {
    const card = document.createElement("div");
    card.className = "switch-card";

    const label = document.createElement("h3");
    label.textContent = `Button ${i + 1}`;
    card.appendChild(label);

    const btn = document.createElement("button");
    btn.className = "arcade-button";
    btn.dataset.index = i;
    // set initial color
    btn.style.setProperty("--btn-color", colorStates[current[i]].color);
    btn.title = colorStates[current[i]].name;

    btn.addEventListener("click", () => {
      current[i] = (current[i] + 1) % colorStates.length;
      const state = colorStates[current[i]];
      btn.style.setProperty("--btn-color", state.color);
      btn.title = state.name;

      if (checkSolved()) {
        solved();
      }
    });

    card.appendChild(btn);
    grid.appendChild(card);
  }

  function solved() {
    result.innerHTML = `
      <div class="puzzle-done">
        ✅ Puzzle 1 solved!<br/>
        Show this to the next station:<br/>
        <strong>CODE: AI-3175</strong>
      </div>
    `;
  }
};