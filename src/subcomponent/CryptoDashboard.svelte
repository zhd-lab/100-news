<script>
    import { onMount, afterUpdate } from "svelte";
    import {
        Button,
        Spinner,
        Alert,
        ListGroup,
        Badge,
        Card,
    } from "sveltestrap";
    import Chart from "chart.js/auto";

    let cryptos = [];
    let selectedCrypto = null;
    let loading = true;
    let error = null;
    let chartLoading = false;
    let chartPoints = [];

    let chartInstance = null;
    let chartCanvas;

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
            //console.log('set de data complet :\n' + JSON.stringify(data)); tmp dbg

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
        if (!chartCanvas) return;

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
                        borderColor: "#007bff",
                        backgroundColor: "rgba(0, 123, 255, 0.1)",
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: "Date" } },
                    y: { title: { display: true, text: "Prix (USD)" } },
                },
            },
        });
    }
</script>

<div class="crypto-container">
    <div class="crypto-list">
        <div align="center">
            <Badge color="primary" style="margin-bottom: 1vh; margin-top: 1vh;">
                <h5>Cryptos</h5>
            </Badge>
        </div>
        {#if loading}
            <Spinner color="primary" />
            <p>Chargement...</p>
        {:else if error}
            <Alert color="danger">{error}</Alert>
        {:else}
            <hr style="color: #007bff;" />
            <ListGroup>
                {#each cryptos as crypto}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                        class="crypto-item {selectedCrypto &&
                        selectedCrypto.id === crypto.id
                            ? 'selected'
                            : ''}"
                        on:click={() => selectCrypto(crypto)}
                    >
                        <Badge color="primary"
                            >({crypto.symbol.toUpperCase()})</Badge
                        >
                        <strong style="color: #0056b3;">{crypto.name} </strong>
                        <p>Prix : ${crypto.current_price.toFixed(2)}</p>
                    </div>
                {/each}
            </ListGroup>
        {/if}
    </div>

    <div class="crypto-details">
        {#if selectedCrypto}
            <h3 style="text-align: center;">
                {selectedCrypto.name} ({selectedCrypto.symbol.toUpperCase()})
            </h3>
            <div style="display: flex; gap: 2vh; margin-top: 2vh;">
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
                <p>
                    <Badge
                        color={selectedCrypto.price_change_percentage_24h > 0
                            ? "success"
                            : "danger"}
                    >
                        {selectedCrypto.price_change_percentage_24h.toFixed(2)}%
                    </Badge>
                </p>
            </div>

            <!-- Graphique -->
            {#if chartLoading}
                <Spinner color="primary" />
                <p>Chargement du graphique...</p>
            {:else}
                <div class="chart-container">
                    <canvas bind:this={chartCanvas}></canvas>
                </div>
            {/if}
        {:else}
            <Alert color="light" style="height: 87vh;">
                <Card
                    color="light"
                    style="color: #007bff; text-align: center; padding: 4vh; margin-top: 30vh; font-height: bold; font-size: 3vh;"
                >
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
                    <p
                        style="margin-top: 2vh; font-weight: bold; text-decoration: underline;"
                    >
                        Sélectionnez une crypto
                    </p>
                </Card>
            </Alert>
        {/if}
    </div>
</div>

<style>
    .crypto-container {
        display: flex;
        gap: 20px;
        padding: 20px;
    }

    .crypto-list {
        width: 25%;
        overflow-y: auto;
        height: 87vh;
        border-right: 2px solid #eee;
        padding-right: 15px;
    }

    .crypto-details {
        height: 87vh;
        width: 70%;
    }

    .chart-container {
        position: relative;
        height: 400px;
    }

    .crypto-item {
        cursor: pointer;
        padding: 10px;
        border-radius: 5px;
        transition: background 0.3s;
    }

    .crypto-item:hover {
        background: #f0f0f0;
    }

    .selected {
        background: #007bff;
        color: white;
    }
</style>
