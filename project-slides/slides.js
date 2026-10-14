(() => {
  "use strict";

  const SLIDE_WIDTH = 1600;
  const SLIDE_HEIGHT = 900;
  const deck = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const progressFill = document.getElementById("progress-fill");
  const total = slides.length;

  let currentSlide = 0;
  let wheelLocked = false;

  const pad = (n) => String(n).padStart(2, "0");

  // Stage attributes:
  //   data-step="n"     shown from stage n onward (cumulative reveal)
  //   data-only="a b"   shown only at the listed stages (swapped content)
  //   data-hl="a b"     gets .is-hl at the listed stages (highlight)
  //   data-done="n"     gets .is-done once the stage is past n
  const stageList = (value) => value.trim().split(/\s+/).map(Number);

  // Each slide's final stage is the largest stage any of these attributes names.
  slides.forEach((slide, index) => {
    const steps = [];
    slide.querySelectorAll("[data-step]").forEach((el) => steps.push(Number(el.dataset.step)));
    slide.querySelectorAll("[data-only]").forEach((el) => steps.push(...stageList(el.dataset.only)));
    slide.querySelectorAll("[data-hl]").forEach((el) => steps.push(...stageList(el.dataset.hl)));
    slide.dataset.finalStage = String(steps.length ? Math.max(...steps) : 0);
    slide.querySelectorAll(".page-number").forEach((el) => {
      el.textContent = `${pad(index + 1)}  /  ${pad(total)}`;
    });
  });

  function fitDeck() {
    const scale = Math.min(window.innerWidth / SLIDE_WIDTH, window.innerHeight / SLIDE_HEIGHT);
    deck.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  function stageOf(slide) {
    return Number(slide.dataset.stage || 0);
  }

  function finalStageOf(slide) {
    return Number(slide.dataset.finalStage || 0);
  }

  function setStage(slide, stage) {
    const next = Math.max(0, Math.min(stage, finalStageOf(slide)));
    slide.dataset.stage = String(next);
    slide.querySelectorAll("[data-step]").forEach((el) => {
      const shown = next >= Number(el.dataset.step);
      el.classList.toggle("is-shown", shown);
      el.setAttribute("aria-hidden", String(!shown));
    });
    slide.querySelectorAll("[data-only]").forEach((el) => {
      const shown = stageList(el.dataset.only).includes(next);
      el.classList.toggle("is-shown", shown);
      el.setAttribute("aria-hidden", String(!shown));
    });
    slide.querySelectorAll("[data-hl]").forEach((el) => {
      el.classList.toggle("is-hl", stageList(el.dataset.hl).includes(next));
    });
    slide.querySelectorAll("[data-done]").forEach((el) => {
      el.classList.toggle("is-done", next > Number(el.dataset.done));
    });
  }

  function showSlide(index, stage = 0) {
    const next = Math.max(0, Math.min(index, total - 1));
    setStage(slides[next], stage);
    slides.forEach((slide, i) => {
      const active = i === next;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    currentSlide = next;
    progressFill.style.width = `${((next + 1) / total) * 100}%`;
    history.replaceState(null, "", `#${next + 1}`);
  }

  function advance() {
    const slide = slides[currentSlide];
    if (stageOf(slide) < finalStageOf(slide)) {
      setStage(slide, stageOf(slide) + 1);
      return;
    }
    if (currentSlide < total - 1) showSlide(currentSlide + 1, 0);
  }

  function retreat() {
    const slide = slides[currentSlide];
    if (stageOf(slide) > 0) {
      setStage(slide, stageOf(slide) - 1);
      return;
    }
    if (currentSlide > 0) showSlide(currentSlide - 1, finalStageOf(slides[currentSlide - 1]));
  }

  function jump(offset) {
    const next = currentSlide + offset;
    if (next < 0 || next >= total) return;
    showSlide(next, 0);
  }

  // Sparse-diff grid: deterministic pseudo-random "changed" cells.
  function buildSparseGrids() {
    document.querySelectorAll(".sparse-grid").forEach((grid) => {
      const cols = Number(grid.dataset.cols);
      const rows = Number(grid.dataset.rows);
      const changed = Number(grid.dataset.changed);
      const cells = cols * rows;
      let seed = 20260920;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const picked = new Set();
      while (picked.size < changed) picked.add(Math.floor(rand() * cells));
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < cells; i += 1) {
        const cell = document.createElement("i");
        if (picked.has(i)) {
          cell.className = "is-changed";
          cell.style.setProperty("--d", `${300 + Math.floor(rand() * 900)}ms`);
        }
        fragment.appendChild(cell);
      }
      grid.appendChild(fragment);
    });
  }

  function handleKeydown(event) {
    const key = event.key;
    if (key === "ArrowRight") {
      event.preventDefault();
      jump(1);
    } else if (key === "ArrowLeft") {
      event.preventDefault();
      jump(-1);
    } else if (["ArrowDown", "PageDown", " ", "Enter"].includes(key)) {
      event.preventDefault();
      advance();
    } else if (["ArrowUp", "PageUp", "Backspace"].includes(key)) {
      event.preventDefault();
      retreat();
    } else if (key === "Home") {
      event.preventDefault();
      showSlide(0, 0);
    } else if (key === "End") {
      event.preventDefault();
      showSlide(total - 1, finalStageOf(slides[total - 1]));
    } else if (key.toLowerCase() === "r") {
      event.preventDefault();
      setStage(slides[currentSlide], 0);
    } else if (key.toLowerCase() === "a") {
      // Reveal everything on the current slide.
      event.preventDefault();
      setStage(slides[currentSlide], finalStageOf(slides[currentSlide]));
    }
  }

  function handlePointer(event) {
    if (event.target.closest("a, button, input, textarea, select")) return;
    const rect = deck.getBoundingClientRect();
    event.clientX < rect.left + rect.width / 2 ? retreat() : advance();
  }

  function handleWheel(event) {
    if (wheelLocked || Math.abs(event.deltaY) < 18) return;
    wheelLocked = true;
    event.deltaY > 0 ? advance() : retreat();
    window.setTimeout(() => {
      wheelLocked = false;
    }, 520);
  }

  window.addEventListener("resize", fitDeck);
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("pointerup", handlePointer);
  window.addEventListener("wheel", handleWheel, { passive: true });

  buildSparseGrids();
  fitDeck();
  const fromHash = Number.parseInt(location.hash.slice(1), 10);
  const startSlide = Number.isFinite(fromHash) ? Math.max(0, Math.min(fromHash - 1, total - 1)) : 0;
  // ?reveal opens the slide fully built; ?stage=N opens it at stage N (handy for review).
  const params = new URLSearchParams(location.search);
  const stageParam = Number.parseInt(params.get("stage"), 10);
  const startStage = Number.isFinite(stageParam)
    ? stageParam
    : params.has("reveal")
      ? finalStageOf(slides[startSlide])
      : 0;
  // Jump straight to the start slide without cross-fading from the cover.
  deck.classList.add("is-booting");
  showSlide(startSlide, startStage);
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => deck.classList.remove("is-booting"));
  });
})();
