<script>
    import { onMount, afterUpdate } from "svelte";
    import { Spinner } from "sveltestrap";
    import Chart from "chart.js/auto";
    import { mode, cardColor, color, InputColor } from "../../stores/store";

    let cryptos = [];
    let selectedCrypto = null;
    let loading = true;
    let error = null;
    let chartLoading = false;
    let chartPoints = [];

    let chartInstance = null;
    let chartCanvas;

    // Variables liées aux couleurs du mode
    let currentMode;
    let currentCardColor;
    let currentColor;
    let currentInputColor;

    // S'abonner aux changements du store
    mode.subscribe((newMode) => {
        currentMode = newMode;
    });

    cardColor.subscribe((newCardColor) => {
        currentCardColor = newCardColor;
    });

    color.subscribe((newColor) => {
        currentColor = newColor;
    });

    InputColor.subscribe((newInputColor) => {
        currentInputColor = newInputColor;
    });

    onMount(async () => {
        try {
            const res = await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1",
            );
            if (!res.ok)
                throw new Error("Erreur lors de la récupération des données.");
            cryptos = await res.json();
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    });

    async function selectCrypto(crypto) {
        selectedCrypto = crypto;
        chartLoading = true;
        chartPoints = [];

        try {
            const res = await fetch(
                `https://api.coingecko.com/api/v3/coins/${crypto.id}/market_chart?vs_currency=usd&days=7`,
            );
            if (!res.ok)
                throw new Error(
                    "Erreur lors de la récupération des données du graphique.",
                );
            const data = await res.json();

            if (data.prices && data.prices.length > 0) {
                chartPoints = data.prices.map(([timestamp, price]) => ({
                    time: new Date(timestamp).toLocaleDateString(),
                    price,
                }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            chartLoading = false;
        }
    }

    afterUpdate(() => {
        if (chartCanvas && selectedCrypto && chartPoints.length > 0) {
            renderChart();
        }
    });

    function renderChart() {
        if (!chartCanvas || !chartCanvas.getContext) return;

        const ctx = chartCanvas.getContext("2d");

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: chartPoints.map((point) => point.time),
                datasets: [
                    {
                        label: `Prix (${selectedCrypto.symbol.toUpperCase()})`,
                        data: chartPoints.map((point) => point.price),
                        borderColor: currentColor, // Utilisation de la couleur du store
                        backgroundColor: "rgba(0, 123, 255, 0.1)",
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Date",
                            color: currentColor,
                        },
                        ticks: { color: currentColor },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Prix (USD)",
                            color: currentColor,
                        },
                        ticks: { color: currentColor },
                    },
                },
                plugins: {
                    legend: {
                        labels: { color: currentColor },
                    },
                },
            },
        });
    }
</script>

<div class="crypto-container" style="background-color: {currentCardColor};">
    <div class="crypto-list">
        <div align="center">
            <div
                class="badge-primary"
                style="background-color: {currentColor};"
            >
                <h5 style="color: grey;">Cryptos</h5>
            </div>
        </div>

        {#if loading}
            <Spinner color="primary" />
            <p>Chargement...</p>
        {:else if error}
            <div
                class="alert-danger"
                style="background-color: {currentCardColor}; color: {currentColor};"
            >
                {error}
            </div>
        {:else}
            <hr class="divider" />
            <div class="list-group">
                {#each cryptos as crypto}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                        class="crypto-item {selectedCrypto &&
                        selectedCrypto.id === crypto.id
                            ? 'selected'
                            : ''}"
                        on:click={() => selectCrypto(crypto)}
                        style="background-color: {currentCardColor}; color: {currentColor};"
                    >
                        <div
                            class="badge-primary"
                            style="background-color: {currentColor};"
                        >
                            {crypto.symbol.toUpperCase()}
                        </div>
                        <strong
                            class="crypto-name"
                            style="color: {currentColor};">{crypto.name}</strong
                        >
                        <p>Prix : ${crypto.current_price.toFixed(2)}</p>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <div class="crypto-details">
        {#if selectedCrypto}
            <h3 class="text-center" style="color: {currentColor};">
                {selectedCrypto.name} ({selectedCrypto.symbol.toUpperCase()})
            </h3>

            <div class="crypto-info" style="color: {currentColor};">
                <p>
                    <strong>Prix actuel :</strong>
                    ${selectedCrypto.current_price.toFixed(2)}
                </p>
                <p>
                    <strong>Market Cap :</strong>
                    ${selectedCrypto.market_cap.toLocaleString()}
                </p>
                <p>
                    <strong>Volume (24h) :</strong>
                    ${selectedCrypto.total_volume.toLocaleString()}
                </p>
                <div
                    class={selectedCrypto.price_change_percentage_24h > 0
                        ? "badge-success"
                        : "badge-danger"}
                    style="background-color: {currentColor};"
                >
                    {selectedCrypto.price_change_percentage_24h.toFixed(2)}%
                </div>
            </div>

            {#if chartLoading}
                <Spinner color="primary" />
                <p>Chargement du graphique...</p>
            {:else}
                <div class="chart-container">
                    <canvas bind:this={chartCanvas}></canvas>
                </div>
            {/if}
        {:else}
            <div
                class="alert-light placeholder-alert"
                style="background-color: {currentCardColor};"
            >
                <div class="placeholder-card">
                    <div align="center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            fill="currentColor"
                            class="bi bi-arrow-left-circle"
                            viewBox="0 0 16 16"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"
                            />
                        </svg>
                    </div>
                    <p class="placeholder-text" style="color: {currentColor};">
                        Sélectionnez une crypto
                    </p>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    :global(html) {
        --background: #ffffff;
        --text: #000000;
        --primary: #007bff;
        --secondary: #6c757d;
        --success: #28a745;
        --danger: #dc3545;
        --light: #f8f9fa;
        --dark: #343a40;

        background-color: var(--background);
        color: var(--text);
    }

    :global(html.dark) {
        --background: #121212;
        --text: #ffffff;
        --primary: #3399ff;
        --secondary: #aaaaaa;
        --success: #28a745;
        --danger: #dc3545;
        --light: #2a2a2a;
        --dark: #ffffff;

        background-color: var(--background);
        color: var(--text);
    }

    .crypto-container {
        display: flex;
        gap: 20px;
        padding: 20px;
    }

    .crypto-list {
        width: 25%;
        overflow-y: auto;
        height: 87vh;
        border-right: 2px solid var(--secondary);
        padding-right: 15px;
        background-color: var(--light); /* Amélioration du fond de la liste */
    }

    .crypto-details {
        height: 87vh;
        width: 70%;
        background-color: var(--light); /* Fond plus clair pour les détails */
    }

    .chart-container {
        position: relative;
        height: 400px;
        background: var(--background);
    }

    .crypto-item {
        cursor: pointer;
        padding: 10px;
        border-radius: 5px;
        transition: background 0.3s;
        background: var(--light); /* Changer la couleur de fond en mode clair */
        color: var(--text); /* Contraste plus élevé avec le texte */
    }

    .crypto-item:hover {
        background: rgba(0, 123, 255, 0.1);
    }

    .selected {
        background: var(--primary);
        color: white;
    }

    .badge-primary {
        background-color: var(--primary);
        color: grey;
        padding: 0.5em 1em;
        border-radius: 10px;
        display: inline-block;
    }

    .badge-success {
        background-color: var(--success);
        color: white;
        padding: 0.3em 0.6em;
        border-radius: 10px;
        display: inline-block;
    }

    .badge-danger {
        background-color: var(--danger);
        color: white;
        padding: 0.3em 0.6em;
        border-radius: 10px;
        display: inline-block;
    }

    .crypto-info {
        display: flex;
        gap: 2vh;
        margin-top: 2vh;
        flex-wrap: wrap;
    }

    .text-center {
        text-align: center;
    }

    .divider {
        border-color: var(--primary);
    }

    .alert-danger {
        background-color: var(--danger);
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
    }

    .alert-light {
        background-color: var(--light);
        color: var(--text);
        padding: 1rem;
        border-radius: 0.5rem;
    }

    .placeholder-alert {
        height: 87vh;
        background: var(--background);
    }

    .placeholder-card {
        color: var(--primary);
        text-align: center;
        padding: 4vh;
        margin-top: 30vh;
        font-weight: bold;
        font-size: 3vh;
    }

    .placeholder-text {
        margin-top: 2vh;
        font-weight: bold;
        text-decoration: underline;
    }
</style>
