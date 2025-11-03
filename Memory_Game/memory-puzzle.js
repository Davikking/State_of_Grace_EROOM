// memory-puzzle.js
window.renderMemoryPuzzle = function (container) {
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Puzzle 2: Memory Notes";
  container.appendChild(title);

  const desc = document.createElement("p");
  desc.innerHTML =
    "Listen to (well, in this case: watch + hear) the sequence and repeat it. Each round gets longer. On the final round, <strong>no pattern will play</strong> — use what you learned.";
  container.appendChild(desc);

  const status = document.createElement("div");
  status.className = "memory-status";
  status.textContent = "Press “Start Round” to begin.";
  container.appendChild(status);

  const btnStart = document.createElement("button");
  btnStart.textContent = "Start Round";
  btnStart.style.marginTop = "0.5rem";
  container.appendChild(btnStart);

  // buttons
  const btnWrap = document.createElement("div");
  btnWrap.className = "memory-buttons";
  container.appendChild(btnWrap);

  // Our 4 pads (like Simon)
  const pads = [
    { id: 0, label: "Red", color: "#f43f5e", freq: 261.63 }, // C4
    { id: 1, label: "Blue", color: "#38bdf8", freq: 293.66 }, // D4
    { id: 2, label: "Green", color: "#22c55e", freq: 329.63 }, // E4
    { id: 3, label: "Yellow", color: "#eab308", freq: 392.0 }, // G4
  ];

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function playNote(freq, duration = 350) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    osc.start();
    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(
        0.00001,
        audioCtx.currentTime + 0.03
      );
      osc.stop(audioCtx.currentTime + 0.04);
    }, duration);
  }

  let sequence = [];
  let userStep = 0;
  let round = 0;
  const TOTAL_ROUNDS = 5; // 4 normal + 1 final silent
  let acceptingInput = false;
  let lastFullSequence = [];

  // make buttons
  pads.forEach((pad) => {
    const b = document.createElement("button");
    b.className = "memory-btn";
    b.textContent = pad.label;
    b.style.background = pad.color;
    b.dataset.id = pad.id;
    b.addEventListener("click", () => handleUserInput(pad.id, b, pad.freq));
    btnWrap.appendChild(b);
  });

  function flashButton(id) {
    const btn = btnWrap.querySelector(`[data-id="${id}"]`);
    if (!btn) return;
    const original = btn.style.filter;
    btn.style.filter = "brightness(1.15)";
    setTimeout(() => {
      btn.style.filter = original;
    }, 250);
  }

  function handleUserInput(id, btn, freq) {
    if (!acceptingInput) return;
    playNote(freq);
    flashButton(id);

    const expected = sequence[userStep];
    if (id === expected) {
      userStep++;
      if (userStep === sequence.length) {
        // round passed
        acceptingInput = false;
        if (round >= TOTAL_ROUNDS) {
          status.innerHTML =
            "✅ You remembered the final pattern with no help.<br/>Give this to the game master: <strong>PHRASE: SWITCHES-SING-NOW</strong>";
        } else {
          status.textContent = "Good! Start the next round.";
        }
      }
    } else {
      // wrong
      acceptingInput = false;
      status.innerHTML =
        "<span style='color:#f43f5e'>Wrong pattern.</span> Try this round again.";
    }
  }

  async function playSequence(seq) {
    acceptingInput = false;
    for (let i = 0; i < seq.length; i++) {
      const id = seq[i];
      const pad = pads.find((p) => p.id === id);
      if (!pad) continue;
      flashButton(id);
      playNote(pad.freq);
      await new Promise((res) => setTimeout(res, 520));
    }
    acceptingInput = true;
    userStep = 0;
    status.textContent = "Your turn.";
  }

  btnStart.addEventListener("click", async () => {
    round++;

    // final round behavior
    if (round > TOTAL_ROUNDS) {
      status.textContent = "You've already completed all rounds 🎉";
      return;
    }

    if (round < TOTAL_ROUNDS) {
      // normal rounds: extend sequence by 1
      sequence.push(Math.floor(Math.random() * pads.length));
      lastFullSequence = [...sequence];
      status.textContent = `Round ${round} – watch carefully...`;
      await playSequence(sequence);
    } else {
      // FINAL ROUND: no pattern plays
      // player must re-enter *lastFullSequence*
      sequence = [...lastFullSequence];
      userStep = 0;
      acceptingInput = true;
      status.innerHTML =
        "<strong>Final challenge:</strong> No pattern will play this time.<br/>Use the previous puzzle’s state and the sounds you heard to recall the last sequence.";
      // 👇 this is your “less on the nose” hint
      const hint = document.createElement("p");
      hint.className = "puzzle-hint";
      hint.textContent =
        "Hint: sometimes the order of earlier switches helps anchor the musical order.";
      container.appendChild(hint);
    }
  });
};