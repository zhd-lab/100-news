<script>
  import { onMount } from "svelte";
  import { Chart } from "chart.js/auto"; // Pour afficher un graphique

  // Votre clé API Twelve Data
  const API_KEY = "8df9195a09c14505a96d1a6aad0fafff";
  const BASE_URL = "https://api.twelvedata.com/time_series";

  // Variables d'état
  let selectedMarket = "AAPL"; // Exemple de marché (AAPL pour Apple)
  let marketData = null;
  let loading = false;
  let errorMessage = "";
  let chart = null;
  let chartData = { labels: [], data: [] };

  // Liste des symboles de marchés
  const markets = [
    { name: "Apple", symbol: "AAPL" },
    { name: "Microsoft", symbol: "MSFT" },
    { name: "Amazon", symbol: "AMZN" },
    { name: "Tesla", symbol: "TSLA" },
  ];

  // Fonction pour récupérer les données de l'API Twelve Data
  async function fetchMarketData(symbol) {
    loading = true;
    errorMessage = "";
    marketData = null;
    chartData = { labels: [], data: [] };

    const url = `${BASE_URL}?symbol=${symbol}&interval=5min&apikey=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "Erreur API");
      }

      const timeSeries = data.values;
      if (!timeSeries || timeSeries.length === 0) {
        throw new Error("Aucune donnée retournée pour ce symbole.");
      }

      // Extraire les 20 derniers points de données
      const latestData = timeSeries.slice(0, 20);
      chartData.labels = latestData.map((entry) => entry.datetime);
      chartData.data = latestData.map((entry) => parseFloat(entry.close));

      updateChart();
    } catch (error) {
      errorMessage = `Erreur lors de la récupération des données : ${error.message}`;
    } finally {
      loading = false;
    }
  }

  // Mettre à jour le graphique avec les nouvelles données
  function updateChart() {
    if (chart) {
      chart.destroy(); // Détruire le graphique précédent s'il existe
    }

    const ctx = document.getElementById("marketChart").getContext("2d");
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Prix de clôture",
            data: chartData.data,
            borderColor: "#007bff",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: "Temps",
            },
          },
          y: {
            title: {
              display: true,
              text: "Prix (USD)",
            },
          },
        },
      },
    });
  }

  // market swap
  function changeMarket(market) {
    selectedMarket = market.symbol;
    fetchMarketData(market.symbol);
  }

  onMount(() => {
    fetchMarketData(markets[0].symbol); // Init avec Apple
  });
</script>


<div>
  <div class="menu" align="center">
    {#each markets as market}
      <button class="market-btn" on:click={() => changeMarket(market)}>
        {market.name}
      </button>
    {/each}
  </div>

  {#if loading}
    <p class="loading">Chargement des données...</p>
  {/if}

  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}

  {#if marketData}
  <!-- todo : fix api return and parse -->
    <div class="market-info">
      <h2>Dernières données pour {selectedMarket}:</h2>
      <p><strong>Prix actuel :</strong> {marketData["close"]} USD</p>
      <p><strong>Volume :</strong> {marketData["volume"]}</p>
      <p><strong>Heure de la donnée :</strong> {Object.keys(marketData)[0]}</p>
    </div>
  {/if}

  <canvas id="marketChart"></canvas>
</div>

<style>
  .market-btn {
    margin: 10px;
    padding: 10px;
    background-color: #0056b3;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
  }


  .market-btn:hover {
    background-color: white;
    animation: hoveredAnim 0.2s ease-in-out forwards;
  }
  @keyframes hoveredAnim {
    0% {
      background-color: #0056b3;
    }
    100% {
      background-color: white;
      color: #0056b3;
      font-weight: bold;
      font-size: bold;
    }
  }

  .market-info {
    margin-top: 2vh;
    font-family: Arial, sans-serif;
  }

  .loading {
    color: blue;
  }

  .error {
    color: red;
  }

  canvas {
    max-width: 100%;
    height: 400px;
    margin-top: 20px;
  }

  .menu {
    background-color: #0056b3;
    width: 100%;
  }

  #marketChart {
    border-radius: 0.5vh;
    margin: 2vh;
    max-height: 40vh;
  }
</style>
