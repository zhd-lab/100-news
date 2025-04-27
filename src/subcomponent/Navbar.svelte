<script>
    import { Button } from "sveltestrap";
    import { state } from "../../stores/store";
    import { mode } from "../../stores/store";
    
    let activeButton = "Actu"; // par défaut
    let isNightMode = false;
  
    // Synchroniser avec le store global de mode
    const unsubscribeMode = mode.subscribe(value => {
      isNightMode = value === "dark";
    });
  
    const toggleNightMode = () => {
      isNightMode = !isNightMode;
      mode.set(isNightMode ? "dark" : "light"); // update global store
    };
  
    const setActiveButton = (button) => {
      activeButton = button;
      if (button === "Cryptos") {
        state.set("cryptoDashboard");
      } else if (button === "Actu") {
        state.set("dashboard");
      } else if (button === "Bourse") {
        state.set("bourse");
      }
    };
  </script>
  
  <div class="navbar {isNightMode ? 'night-mode' : ''}">
    <div class="navbar-left">
      <span class="logo"><strong>100 News</strong></span>
    </div>
  
    <div class="navbar-center">
      <Button
        color={activeButton === "Actu" ? "primary" : "light"}
        on:click={() => setActiveButton("Actu")}
      >
        Actu
      </Button>
      <Button
        color={activeButton === "Cryptos" ? "primary" : "light"}
        on:click={() => setActiveButton("Cryptos")}
      >
        Cryptos
      </Button>
      <Button
        color={activeButton === "Bourse" ? "primary" : "light"}
        on:click={() => setActiveButton("Bourse")}
      >
        Bourse
      </Button>
    </div>
  
    <div class="navbar-right">
      <Button class="toggle-btn" on:click={toggleNightMode}>
        {isNightMode ? "🌙" : "🌞"}
      </Button>
    </div>
  </div>
  
  <style>
    .logo {
      color: #0d6efd;
      font-size: x-large;
      text-decoration: underline;
    }
  
    /* navbar */
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background-color: #f0f0f0;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: background-color 0.3s, color 0.3s;
    }
  
    .navbar.night-mode {
      background-color: #1e1e1e;
      color: white;
    }
  
    .navbar.night-mode .logo {
      color: #90caf9;
    }
  
    .navbar-left {
      font-size: 20px;
      font-weight: bold;
    }
  
    .navbar-center {
      display: flex;
      gap: 2vh;
    }
  
    .navbar-right .toggle-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
    }
  </style>
  