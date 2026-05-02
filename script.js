let arr = [];
let steps = [];
let currentStep = 0;

// 🔊 SOUND SETUP
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(value, type = "compare") {
  let oscillator = audioCtx.createOscillator();
  let gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = 200 + value * 5;

  oscillator.type = (type === "swap") ? "square" : "sine";

  gainNode.gain.value = 0.1;

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
}

// GENERATE ARRAY
function generateArray() {
  arr = [];
  steps = [];
  currentStep = 0;

  for (let i = 0; i < 20; i++) {
    arr.push(Math.floor(Math.random() * 100) + 10);
  }

  render(arr);
}

// RENDER
function render(array, highlight = {}) {
  const container = document.getElementById("array");
  container.innerHTML = "";

  array.forEach((value, index) => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = value + "px";
    bar.innerText = value;
    if (highlight.compare?.includes(index)) {
      bar.classList.add("compare");
    }

    if (highlight.swap?.includes(index)) {
      bar.classList.add("swap");
    }

    if (highlight.sorted?.includes(index)) {
      bar.classList.add("sorted");
    }

    container.appendChild(bar);
  });
}

// SAVE STEP
function saveStep(array, highlight = {}) {
  steps.push({
    array: [...array],
    highlight: highlight
  });
}

// BUBBLE SORT
function bubbleSort(array) {
  let a = [...array];
  saveStep(a);

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {

      saveStep(a, { compare: [j, j + 1] });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        saveStep(a, { swap: [j, j + 1] });
      }
    }

    saveStep(a, { sorted: [a.length - i - 1] });
  }
}

// SELECTION SORT
function selectionSort(array) {
  let a = [...array];
  saveStep(a);

  for (let i = 0; i < a.length; i++) {
    let min = i;

    for (let j = i + 1; j < a.length; j++) {
      saveStep(a, { compare: [min, j] });

      if (a[j] < a[min]) min = j;
    }

    [a[i], a[min]] = [a[min], a[i]];
    saveStep(a, { swap: [i, min] });

    saveStep(a, { sorted: [i] });
  }
}

// INSERTION SORT
function insertionSort(array) {
  let a = [...array];
  saveStep(a);

  for (let i = 1; i < a.length; i++) {
    let key = a[i];
    let j = i - 1;

    while (j >= 0 && a[j] > key) {
      saveStep(a, { compare: [j, i] });

      a[j + 1] = a[j];
      j--;

      saveStep(a, { swap: [j + 1, j + 2] });
    }

    a[j + 1] = key;
    saveStep(a);
  }
}

// START
function start() {
  audioCtx.resume(); // 🔊 enable sound

  steps = [];
  currentStep = 0;

  let algo = document.getElementById("algo").value;

  if (algo === "bubble") bubbleSort(arr);
  if (algo === "selection") selectionSort(arr);
  if (algo === "insertion") insertionSort(arr);

  play();
}

// PLAY ANIMATION
function play() {
  let speed = document.getElementById("speed").value;

  function run() {
    if (currentStep >= steps.length) return;

    let step = steps[currentStep];
    render(step.array, step.highlight);

    // 🔊 SOUND
    if (step.highlight?.compare) {
      let i = step.highlight.compare[0];
      playSound(step.array[i], "compare");
    }

    if (step.highlight?.swap) {
      let i = step.highlight.swap[0];
      playSound(step.array[i], "swap");
    }

    currentStep++;
    setTimeout(run, speed);
  }

  run();
}

// NEXT
function nextStep() {
  if (currentStep < steps.length) {
    let step = steps[currentStep];
    render(step.array, step.highlight);
    currentStep++;
  }
}

// PREV
function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    let step = steps[currentStep];
    render(step.array, step.highlight);
  }
}
