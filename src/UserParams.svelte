<script>
    import { onDestroy } from "svelte";
    import {
        lang,
        mode,
        color,
        cardColor,
        InputColor,
        likedList,
        showOffcanvas,
    } from "../stores/store";
    import LikedArticles from "./subcomponent/LikedArticles.svelte";
    import UserCharts from "./subcomponent/UserCharts.svelte";
    import UserSetings from "./subcomponent/UserSetings.svelte";

    let currentColor = "";
    let currentCardColor = "";
    let selectedMode = "likes"; // 'likes' | 'user' | 'charts'

    let showCanvas = false;
    // Subscribe to stores

    const unsubscribeShow = showOffcanvas.subscribe(
        (val) => (showCanvas = val),
    );

    const toggleOffcanvas = () => {
        showOffcanvas.update((v) => !v);
    };

    const unsubCardColor = cardColor.subscribe((value) => {
        currentCardColor = value;
    });

    const unsubColor = color.subscribe((value) => {
        currentColor = value;
    });

    onDestroy(() => {
        unsubCardColor();
        unsubColor();
    });

    function setMode(target) {
        selectedMode = target;
    }
</script>

<div
    style="
        height: 100%;
        background-color: {currentCardColor};
        color: {currentColor};
        transition: background-color 1s, color 0.3s;
        border-radius: 2vh;
        margin: -1vh auto 0 auto;
        width: fit-content;
        padding: 1vh;
    "
>
    <div class="card-grid">
        <button
            class="card"
            style="background-color: {currentCardColor}; color: {currentColor}; transition: background-color 1s, color 0.3s;"
            on:click={() => setMode("likes")}
        >
            Likes
        </button>
        <button
            class="card"
            style="background-color: {currentCardColor}; color: {currentColor}; transition: background-color 1s, color 0.3s;"
            on:click={() => setMode("user")}
        >
            User
        </button>
        <button
            class="card"
            style="background-color: {currentCardColor}; color: {currentColor}; transition: background-color 1s, color 0.3s;"
            on:click={() => setMode("charts")}
        >
            Graph
        </button>
        <button class="card" on:click={() => showOffcanvas.set(false)} style="background-color: #722d2d96; color: white;">Fermer</button>
    </div>

    <div class="render-box">
        {#if selectedMode === "likes"}
            <LikedArticles {showCanvas} />
        {:else if selectedMode === "user"}
            <UserSetings />
        {:else if selectedMode === "charts"}
            <UserCharts />
        {/if}
    </div>
</div>

<style>
    .card-grid {
        color: #722d2d96;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2vh;
        padding: 1vh;
        justify-items: center;
        align-items: center;
    }

    .card {
        width: 8vw;
        height: 6vh;
        border: 1px solid grey;
        padding: 0.1vh;
        border-radius: 2vh;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.8em;
        transition: transform 0.3s ease;
        cursor: pointer;
    }

    .card:hover {
        transform: translateY(-5px);
        color: black !important;
        background-color: #b6acac !important;
    }

    .render-box {
        height: 80vh;
        width: 90vw;
    }
</style>
