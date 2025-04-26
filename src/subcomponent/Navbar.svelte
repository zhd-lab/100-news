<script>
    import { Button } from "sveltestrap";
    import { state } from "../../stores/store";

    let isNightMode = false;
    let activeButton = "Actu"; // Par défaut, "Actu" est actif

    const toggleNightMode = () => {
        isNightMode = !isNightMode;
        if (isNightMode) {
            document.body.classList.add("night-mode");
        } else {
            document.body.classList.remove("night-mode");
        }
    };

    const setActiveButton = (button) => {
        activeButton = button;
        if (button === "Cryptos") {
            state.set("cryptoDashboard");
        }
        else if (button === "Actu") {
            state.set("dashboard");
        }
        else if (button === "Bourse") {
            state.set("bourse");
        }
        
    };
</script>

<div class="navbar">
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
    /* Style global de la navbar */
    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background-color: #f0f0f0;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .navbar-left {
        font-size: 20px;
        font-weight: bold;
    }

    /* Centrage des boutons Actu et Cryptos */
    .navbar-center {
        display: flex;
        gap: 2vh;
    }
</style>
