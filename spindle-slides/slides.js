(() => {
  "use strict";

  const SLIDE_WIDTH = 1600;
  const SLIDE_HEIGHT = 900;
  const TOTAL_DECK_SLIDES = 9;
  const MOTIVATION_FINAL_STAGE = 8;
  const ARCHITECTURE_FINAL_STAGE = 8;
  const AGENT_SERVER_FINAL_STAGE = 5;
  const PROXY_SERVER_FINAL_STAGE = 7;
  const TRAJECTORY_FINAL_STAGE = 4;
  const PREFIX_TRIE_FINAL_STAGE = 5;
  const TITO_FINAL_STAGE = 5;
  const deck = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const progressFill = document.getElementById("progress-fill");

  let currentSlide = 0;
  let wheelLocked = false;
  let transitionLocked = false;

  function fitDeck() {
    const scale = Math.min(window.innerWidth / SLIDE_WIDTH, window.innerHeight / SLIDE_HEIGHT);
    deck.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  function updateProgress() {
    const visiblePage = currentSlide + 1;
    progressFill.style.width = `${(visiblePage / TOTAL_DECK_SLIDES) * 100}%`;
  }

  function showSlide(index) {
    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === nextIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    currentSlide = nextIndex;
    updateProgress();
  }

  function deckRelativeRect(element) {
    const deckRect = deck.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const scale = deckRect.width / SLIDE_WIDTH;
    return {
      left: (elementRect.left - deckRect.left) / scale,
      top: (elementRect.top - deckRect.top) / scale,
      width: elementRect.width / scale,
      height: elementRect.height / scale,
    };
  }

  function playAgentServerMagicMove() {
    const source = document.querySelector(".architecture-agent-server-anchor");
    const target = document.querySelector(".agent-server-magic-target");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setAgentServerStage(0);

    if (!source || !target || reducedMotion) {
      showSlide(3);
      return;
    }

    transitionLocked = true;
    const from = deckRelativeRect(source);
    const to = deckRelativeRect(target);
    const ghost = document.createElement("div");
    ghost.className = "magic-agent-server";
    ghost.setAttribute("aria-hidden", "true");
    ghost.innerHTML = "<strong>Agent Server</strong><span>control plane</span>";
    Object.assign(ghost.style, {
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
    });

    deck.appendChild(ghost);
    deck.classList.add("is-agent-server-magic");
    ghost.getBoundingClientRect();
    showSlide(3);

    window.requestAnimationFrame(() => {
      ghost.classList.add("is-moving");
      Object.assign(ghost.style, {
        left: `${to.left}px`,
        top: `${to.top}px`,
        width: `${to.width}px`,
        height: `${to.height}px`,
      });
    });

    window.setTimeout(() => {
      ghost.remove();
      deck.classList.remove("is-agent-server-magic");
      transitionLocked = false;
    }, 720);
  }

  function motivationStage() {
    const slide = slides[1];
    return Number(slide?.dataset.stage || 0);
  }

  function setMotivationStage(stage) {
    const slide = slides[1];
    if (!slide) return;
    const nextStage = Math.max(0, Math.min(stage, MOTIVATION_FINAL_STAGE));
    slide.dataset.stage = String(nextStage);
    slide.querySelectorAll(".motivation-rl-primer").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage >= 3));
    });
    slide.querySelectorAll(".motivation-stage-transfer").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 1 || nextStage > 2));
    });
    slide.querySelectorAll(".motivation-stage-spindle").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage !== 2));
    });
    slide.querySelectorAll(".motivation-stage-reasoning").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage !== 3));
    });
    slide.querySelectorAll(".motivation-stage-agentic").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 4));
    });
    slide.querySelectorAll(".agentic-step-runtime").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 4));
    });
    slide.querySelectorAll(".agentic-step-prompt").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 5));
    });
    slide.querySelectorAll(".agentic-step-engine").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 6));
    });
    slide.querySelectorAll(".agentic-step-output").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 7));
    });
    slide.querySelectorAll(".agentic-value-points").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 8));
    });
  }

  function architectureStage() {
    const slide = slides[2];
    return Number(slide?.dataset.stage || 0);
  }

  function setArchitectureStage(stage) {
    const slide = slides[2];
    if (!slide) return;
    const nextStage = Math.max(0, Math.min(stage, ARCHITECTURE_FINAL_STAGE));
    slide.dataset.stage = String(nextStage);
    const revealAt = [
      [".architecture-stage-framework, .architecture-stage-runtime", 1],
      [".architecture-stage-submit", 2],
      [".architecture-stage-session", 3],
      [".architecture-stage-launch", 4],
      [".architecture-stage-agent-api", 5],
      [".architecture-stage-rollout", 6],
      [".architecture-stage-trajectory-data", 7],
      [".architecture-stage-training-trajectory", 8],
    ];
    revealAt.forEach(([selector, firstStage]) => {
      slide.querySelectorAll(selector).forEach((element) => {
        element.setAttribute("aria-hidden", String(nextStage < firstStage));
      });
    });
  }

  function agentServerStage() {
    const slide = slides[3];
    return Number(slide?.dataset.stage || 0);
  }

  function setAgentServerStage(stage) {
    const slide = slides[3];
    if (!slide) return;
    const nextStage = Math.max(0, Math.min(stage, AGENT_SERVER_FINAL_STAGE));
    slide.dataset.stage = String(nextStage);
    slide.querySelectorAll(".server-stage-framework").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 1));
    });
    slide.querySelectorAll(".server-stage-lifecycle").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 2));
    });
    slide.querySelectorAll(".server-stage-session").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 3));
    });
    slide.querySelectorAll(".server-stage-runtime").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 4));
    });
    slide.querySelectorAll(".server-stage-deployment").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 5));
    });
  }

  function trajectoryStage() {
    const slide = slides[5];
    return Number(slide?.dataset.stage || 0);
  }

  function setTrajectoryStage(stage) {
    const slide = slides[5];
    if (!slide) return;
    const nextStage = Math.max(0, Math.min(stage, TRAJECTORY_FINAL_STAGE));
    slide.dataset.stage = String(nextStage);
    slide.querySelectorAll(".interaction-example").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage >= 4));
    });
    slide.querySelectorAll(".trajectory-stage-methods").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 1 || nextStage >= 4));
    });
    slide.querySelectorAll(".per-turn-method").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 1 || nextStage >= 4));
    });
    slide.querySelectorAll(".prefix-merge-method").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 2 || nextStage >= 4));
    });
    slide.querySelectorAll(".merge-source").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage >= 3));
    });
    slide.querySelectorAll(".merge-result").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 3));
    });
    slide.querySelectorAll(".trajectory-stage-results").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 4));
    });
  }

  function prefixTrieStage() {
    const slide = slides[6];
    return Number(slide?.dataset.stage || 0);
  }

  function setPrefixTrieStage(stage) {
    const slide = slides[6];
    if (!slide) return;
    const nextStage = Math.max(0, Math.min(stage, PREFIX_TRIE_FINAL_STAGE));
    slide.dataset.stage = String(nextStage);
    slide.querySelectorAll(".trie-stage-tree").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 2));
    });
    slide.querySelectorAll(".linear-chain-limitations").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 1 || nextStage >= 6));
    });
    slide.querySelectorAll(".trie-storage-benefits").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 3 || nextStage >= 6));
    });
    slide.querySelectorAll(".trie-stage-leaf-notes").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 4 || nextStage >= 5));
    });
    slide.querySelectorAll(".trie-stage-drop").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 5));
    });
  }

  function proxyServerStage() {
    const slide = slides[4];
    return Number(slide?.dataset.stage || 0);
  }

  function setProxyServerStage(stage) {
    const slide = slides[4];
    if (!slide) return;
    const nextStage = Math.max(0, Math.min(stage, PROXY_SERVER_FINAL_STAGE));
    slide.dataset.stage = String(nextStage);
    slide.querySelectorAll(".proxy-overview").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage !== 0 && nextStage !== 7));
    });
    slide.querySelectorAll(".proxy-cluster").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 1 || nextStage > 6));
    });
    const stageRules = [
      [".proxy-stage-register", 2],
      [".proxy-stage-session", 3],
      [".proxy-stage-runtime", 4],
      [".proxy-stage-direct", 5],
      [".proxy-stage-planes", 6],
    ];
    stageRules.forEach(([selector, revealStage]) => {
      slide.querySelectorAll(selector).forEach((element) => {
        element.setAttribute("aria-hidden", String(nextStage < revealStage || nextStage === 7));
      });
    });
  }

  function titoStage() {
    const slide = slides[7];
    return Number(slide?.dataset.stage || 0);
  }

  function setTitoStage(stage) {
    const slide = slides[7];
    if (!slide) return;
    const nextStage = Math.max(0, Math.min(stage, TITO_FINAL_STAGE));
    slide.dataset.stage = String(nextStage);
    slide.querySelectorAll(".tito-stage").forEach((element) => {
      const elementStage = Number(element.dataset.titoStage || 0);
      const visible = elementStage === nextStage ||
        (elementStage === 0 && nextStage === 1) ||
        (elementStage === 3 && nextStage >= 3);
      element.setAttribute("aria-hidden", String(!visible));
    });
    slide.querySelectorAll(".tito-bpe-stage").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage !== 1));
    });
    slide.querySelectorAll(".tito-merge-qwen").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 4));
    });
    slide.querySelectorAll(".tito-merge-glm").forEach((element) => {
      element.setAttribute("aria-hidden", String(nextStage < 5));
    });
  }

  function advance() {
    if (transitionLocked) return;
    if (currentSlide === 1 && motivationStage() < MOTIVATION_FINAL_STAGE) {
      setMotivationStage(motivationStage() + 1);
      return;
    }
    if (currentSlide === 1) {
      setArchitectureStage(0);
      showSlide(2);
      return;
    }
    if (currentSlide === 2 && architectureStage() < ARCHITECTURE_FINAL_STAGE) {
      setArchitectureStage(architectureStage() + 1);
      return;
    }
    if (currentSlide === 2) {
      playAgentServerMagicMove();
      return;
    }
    if (currentSlide === 3 && agentServerStage() < AGENT_SERVER_FINAL_STAGE) {
      setAgentServerStage(agentServerStage() + 1);
      return;
    }
    if (currentSlide === 4 && proxyServerStage() < PROXY_SERVER_FINAL_STAGE) {
      setProxyServerStage(proxyServerStage() + 1);
      return;
    }
    if (currentSlide === 5 && trajectoryStage() < TRAJECTORY_FINAL_STAGE) {
      setTrajectoryStage(trajectoryStage() + 1);
      return;
    }
    if (currentSlide === 6 && prefixTrieStage() < PREFIX_TRIE_FINAL_STAGE) {
      setPrefixTrieStage(prefixTrieStage() + 1);
      return;
    }
    if (currentSlide === 7 && titoStage() < TITO_FINAL_STAGE) {
      setTitoStage(titoStage() + 1);
      return;
    }
    showSlide(currentSlide + 1);
  }

  function retreat() {
    if (transitionLocked) return;
    if (currentSlide === 1 && motivationStage() > 0) {
      setMotivationStage(motivationStage() - 1);
      return;
    }
    if (currentSlide === 2 && architectureStage() > 0) {
      setArchitectureStage(architectureStage() - 1);
      return;
    }
    if (currentSlide === 3 && agentServerStage() > 0) {
      setAgentServerStage(agentServerStage() - 1);
      return;
    }
    if (currentSlide === 4 && proxyServerStage() > 0) {
      setProxyServerStage(proxyServerStage() - 1);
      return;
    }
    if (currentSlide === 5 && trajectoryStage() > 0) {
      setTrajectoryStage(trajectoryStage() - 1);
      return;
    }
    if (currentSlide === 6 && prefixTrieStage() > 0) {
      setPrefixTrieStage(prefixTrieStage() - 1);
      return;
    }
    if (currentSlide === 7 && titoStage() > 0) {
      setTitoStage(titoStage() - 1);
      return;
    }
    showSlide(currentSlide - 1);
  }

  function resetSlideStage(slideIndex) {
    if (slideIndex === 1) setMotivationStage(0);
    if (slideIndex === 2) setArchitectureStage(0);
    if (slideIndex === 3) setAgentServerStage(0);
    if (slideIndex === 4) setProxyServerStage(0);
    if (slideIndex === 5) setTrajectoryStage(0);
    if (slideIndex === 6) setPrefixTrieStage(0);
    if (slideIndex === 7) setTitoStage(0);
  }

  function changeSlide(offset) {
    if (transitionLocked) return;
    const nextSlide = Math.max(0, Math.min(currentSlide + offset, slides.length - 1));
    if (nextSlide === currentSlide) return;
    resetSlideStage(nextSlide);
    showSlide(nextSlide);
  }

  function handleKeydown(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      changeSlide(1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      changeSlide(-1);
      return;
    }

    const forwardKeys = ["ArrowDown", "PageDown", " "];
    const backKeys = ["ArrowUp", "PageUp"];

    if (forwardKeys.includes(event.key)) {
      event.preventDefault();
      advance();
      return;
    }

    if (backKeys.includes(event.key)) {
      event.preventDefault();
      retreat();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setMotivationStage(0);
      setArchitectureStage(0);
      setAgentServerStage(0);
      setProxyServerStage(0);
      setTrajectoryStage(0);
      setPrefixTrieStage(0);
      setTitoStage(0);
      showSlide(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setMotivationStage(MOTIVATION_FINAL_STAGE);
      setArchitectureStage(ARCHITECTURE_FINAL_STAGE);
      setAgentServerStage(AGENT_SERVER_FINAL_STAGE);
      setProxyServerStage(PROXY_SERVER_FINAL_STAGE);
      setTrajectoryStage(TRAJECTORY_FINAL_STAGE);
      setPrefixTrieStage(PREFIX_TRIE_FINAL_STAGE);
      setTitoStage(TITO_FINAL_STAGE);
      showSlide(slides.length - 1);
      return;
    }

    if (event.key.toLowerCase() === "r" && currentSlide === 1) {
      event.preventDefault();
      setMotivationStage(0);
    }

    if (event.key.toLowerCase() === "r" && currentSlide === 2) {
      event.preventDefault();
      setArchitectureStage(0);
    }

    if (event.key.toLowerCase() === "r" && currentSlide === 3) {
      event.preventDefault();
      setAgentServerStage(0);
    }

    if (event.key.toLowerCase() === "r" && currentSlide === 4) {
      event.preventDefault();
      setProxyServerStage(0);
    }

    if (event.key.toLowerCase() === "r" && currentSlide === 5) {
      event.preventDefault();
      setTrajectoryStage(0);
    }

    if (event.key.toLowerCase() === "r" && currentSlide === 6) {
      event.preventDefault();
      setPrefixTrieStage(0);
    }

    if (event.key.toLowerCase() === "r" && currentSlide === 7) {
      event.preventDefault();
      setTitoStage(0);
    }
  }

  function handlePointer(event) {
    if (event.target.closest("a, button, input, textarea, select")) return;
    const deckRect = deck.getBoundingClientRect();
    const midpoint = deckRect.left + deckRect.width / 2;
    event.clientX < midpoint ? retreat() : advance();
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

  fitDeck();
  setMotivationStage(0);
  setArchitectureStage(0);
  setAgentServerStage(0);
  setProxyServerStage(0);
  setTrajectoryStage(0);
  setPrefixTrieStage(0);
  setTitoStage(0);
  showSlide(0);
})();
