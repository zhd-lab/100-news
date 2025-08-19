<script>
  import { onMount } from "svelte";
  import { Button, Offcanvas, OffcanvasBody } from "sveltestrap";
  import {
    state,
    mode,
    showOffcanvas,
    color,
    cardColor,
  } from "../../stores/store";
  import UserParams from "../UserParams.svelte";

  let activeButton = "Actu";
  let isNightMode = false;
  let isFullScreen = false;

  let offcanvasBodyEl;
  let offcanvasEl;
  let showCanvas = false;

  let currentColor = "";
  let currentCardColor = "";
  let currentInputColor = "";
  let currentMode = "light";

  // Subscribe to stores
  const unsubMode = mode.subscribe((value) => {
    currentMode = value;
  });
  const unsubColor = color.subscribe((value) => {
    currentColor = value;
  });
  const unsubCardColor = cardColor.subscribe((value) => {
    currentCardColor = value;
  });

  const unsubscribeShow = showOffcanvas.subscribe((val) => (showCanvas = val));
  const unsubscribeMode = mode.subscribe(
    (val) => (isNightMode = val === "dark"),
  );

  const toggleOffcanvas = () => {
    showOffcanvas.update((v) => !v);
  };

  const toggleNightMode = () => {
    isNightMode = !isNightMode;
    mode.set(isNightMode ? "dark" : "light");
  };

  const setActiveButton = (button) => {
    activeButton = button;
    if (button === "Cryptos") state.set("cryptoDashboard");
    else if (button === "Actu") state.set("dashboard");
    else if (button === "Bourse") state.set("bourse");
  };

  function toggleFullScreen() {
    const doc = document;
    const docEl = doc.documentElement;

    if (!doc.fullscreenElement) {
      if (docEl.requestFullscreen) docEl.requestFullscreen();
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
      else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      else if (doc.msExitFullscreen) doc.msExitFullscreen();
    }
  }

  function updateFullScreenState() {
    isFullScreen = !!document.fullscreenElement;
  }

  function handleClickOutside(event) {
    if (showCanvas && offcanvasEl && !offcanvasEl.contains(event.target)) {
      showOffcanvas.set(false);
    }
  }

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("fullscreenchange", updateFullScreenState);

    const handleKeyDown = (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("fullscreenchange", updateFullScreenState);
      window.removeEventListener("keydown", handleKeyDown);
      unsubscribeShow();
      unsubscribeMode();
    };
  });
</script>

<!-- Navbar -->
<div class="navbar {isNightMode ? 'night-mode' : ''}">
  <div class="navbar-right">
    <!-- Fullscreen Button -->
    <Button
      color={isFullScreen ? "primary" : "secondary"}
      on:click={toggleFullScreen}
      style="flex-shrink: 0;"
    >
      {#if isFullScreen}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-fullscreen-exit"
          viewBox="0 0 16 16"
        >
          <path
            d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-arrows-fullscreen"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707m0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707m-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707"
          />
        </svg>
      {/if}
    </Button>

    <!-- Night Mode Toggle -->
    <Button
      color={isNightMode ? "light" : "dark"}
      on:click={toggleNightMode}
      style="flex-shrink: 0;"
    >
      {#if isNightMode}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-brightness-high"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-moon-stars"
          viewBox="0 0 16 16"
        >
          <path
            d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"
          />
          <path
            d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097z"
          />
        </svg>
      {/if}
    </Button>

    <!-- User Params (Offcanvas trigger) -->
    <Button
      outline
      color="secondary"
      on:click={toggleOffcanvas}
      style="margin-left: 2vh; flex-shrink: 0;"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        class="bi bi-fingerprint"
        viewBox="0 0 16 16"
      >
        <path
          d="M8.06 6.5a.5.5 0 0 1 .5.5v.776a11.5 11.5 0 0 1-.552 3.519l-1.331 4.14a.5.5 0 0 1-.952-.305l1.33-4.141a10.5 10.5 0 0 0 .504-3.213V7a.5.5 0 0 1 .5-.5Z"
        />
        <path
          d="M6.06 7a2 2 0 1 1 4 0 .5.5 0 1 1-1 0 1 1 0 1 0-2 0v.332q0 .613-.066 1.221A.5.5 0 0 1 6 8.447q.06-.555.06-1.115zm3.509 1a.5.5 0 0 1 .487.513 11.5 11.5 0 0 1-.587 3.339l-1.266 3.8a.5.5 0 0 1-.949-.317l1.267-3.8a10.5 10.5 0 0 0 .535-3.048A.5.5 0 0 1 9.569 8m-3.356 2.115a.5.5 0 0 1 .33.626L5.24 14.939a.5.5 0 1 1-.955-.296l1.303-4.199a.5.5 0 0 1 .625-.329"
        />
        <path
          d="M4.759 5.833A3.501 3.501 0 0 1 11.559 7a.5.5 0 0 1-1 0 2.5 2.5 0 0 0-4.857-.833.5.5 0 1 1-.943-.334m.3 1.67a.5.5 0 0 1 .449.546 10.7 10.7 0 0 1-.4 2.031l-1.222 4.072a.5.5 0 1 1-.958-.287L4.15 9.793a9.7 9.7 0 0 0 .363-1.842.5.5 0 0 1 .546-.449Zm6 .647a.5.5 0 0 1 .5.5c0 1.28-.213 2.552-.632 3.762l-1.09 3.145a.5.5 0 0 1-.944-.327l1.089-3.145c.382-1.105.578-2.266.578-3.435a.5.5 0 0 1 .5-.5Z"
        />
        <path
          d="M3.902 4.222a5 5 0 0 1 5.202-2.113.5.5 0 0 1-.208.979 4 4 0 0 0-4.163 1.69.5.5 0 0 1-.831-.556m6.72-.955a.5.5 0 0 1 .705-.052A4.99 4.99 0 0 1 13.059 7v1.5a.5.5 0 1 1-1 0V7a3.99 3.99 0 0 0-1.386-3.028.5.5 0 0 1-.051-.705M3.68 5.842a.5.5 0 0 1 .422.568q-.044.289-.044.59c0 .71-.1 1.417-.298 2.1l-1.14 3.923a.5.5 0 1 1-.96-.279L2.8 8.821A6.5 6.5 0 0 0 3.058 7q0-.375.054-.736a.5.5 0 0 1 .568-.422m8.882 3.66a.5.5 0 0 1 .456.54c-.084 1-.298 1.986-.64 2.934l-.744 2.068a.5.5 0 0 1-.941-.338l.745-2.07a10.5 10.5 0 0 0 .584-2.678.5.5 0 0 1 .54-.456"
        />
        <path
          d="M4.81 1.37A6.5 6.5 0 0 1 14.56 7a.5.5 0 1 1-1 0 5.5 5.5 0 0 0-8.25-4.765.5.5 0 0 1-.5-.865m-.89 1.257a.5.5 0 0 1 .04.706A5.48 5.48 0 0 0 2.56 7a.5.5 0 0 1-1 0c0-1.664.626-3.184 1.655-4.333a.5.5 0 0 1 .706-.04ZM1.915 8.02a.5.5 0 0 1 .346.616l-.779 2.767a.5.5 0 1 1-.962-.27l.778-2.767a.5.5 0 0 1 .617-.346m12.15.481a.5.5 0 0 1 .49.51c-.03 1.499-.161 3.025-.727 4.533l-.07.187a.5.5 0 0 1-.936-.351l.07-.187c.506-1.35.634-2.74.663-4.202a.5.5 0 0 1 .51-.49"
        />
      </svg>
    </Button>

    <!-- fix backdrop filter issue -->
    <Offcanvas
      isOpen={showCanvas}
      direction="top"
      class="offcanvas-top fullscreen-offcanvas"
      style="backdrop-filter: blur(0.2vh);  width: 100vw; height: 100vh; background-color: {currentCardColor}; color: {currentColor}; transition: background-color 1s, color 0.3s;"
      backdrop
    >
      <OffcanvasBody bind:this={offcanvasBodyEl}>
        <UserParams />
      </OffcanvasBody>
    </Offcanvas>
  </div>
</div>

<style>
  .navbar {
    width: 100%;
    height: 6vh;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    box-sizing: border-box;
    transition:
      background-color 1s,
      color 0.3s;
    flex-wrap: nowrap;
  }

  .navbar.night-mode {
    color: white;
  }

  .navbar-right {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    align-items: center;
    white-space: nowrap;
    overflow-x: auto;
    flex-wrap: nowrap;
  }
</style>
