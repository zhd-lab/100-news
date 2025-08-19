<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";

    let stats = [
        {
            date: "2025-07-01",
            articles: 23,
            mentions: 58,
            engagement: 1240,
        },
        {
            date: "2025-07-02",
            articles: 18,
            mentions: 72,
            engagement: 980,
        },
        {
            date: "2025-07-03",
            articles: 31,
            mentions: 44,
            engagement: 1530,
        },
    ];

    let chart;

    onMount(() => {
        const ctx = document.getElementById("mediaChart");
        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: stats.map((s) => s.date),
                datasets: [
                    {
                        label: "Articles",
                        data: stats.map((s) => s.articles),
                        backgroundColor: "#42a5f5",
                    },
                    {
                        label: "Mentions",
                        data: stats.map((s) => s.mentions),
                        backgroundColor: "#66bb6a",
                    },
                    {
                        label: "Engagement",
                        data: stats.map((s) => s.engagement),
                        backgroundColor: "#ffa726",
                        yAxisID: "engagement-axis",
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                    "engagement-axis": {
                        position: "right",
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                },
                plugins: {
                    legend: {
                        labels: {
                            color: "#ccc",
                        },
                    },
                },
            },
        });
    });
</script>

<div class="console">
    <h2>📊</h2>
    <div class="chart-container">
        <canvas id="mediaChart" height="80"></canvas>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Articles</th>
                <th>Mentions</th>
                <th>Engagement</th>
            </tr>
        </thead>
        <tbody>
            {#each stats as stat}
                <tr>
                    <td>{stat.date}</td>
                    <td>{stat.articles}</td>
                    <td>{stat.mentions}</td>
                    <td>{stat.engagement}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    :global(body) {
        background-color: #1e1e1e;
        color: #eee;
    }

    .console {
        margin-top: 4vh;
        overflow-y: auto;
        height: 80vh;
        width: 86vw;
        background: #121212;
        border: 1px solid #333;
        padding: 1rem;
        border-radius: 8px;
    }

    .chart-container {
        background: #1c1c1c;
        padding: 1rem;
        border-radius: 8px;
    }

    table {
        width: 100%;
        margin-top: 1rem;
        border-collapse: collapse;
    }

    th,
    td {
        border: 1px solid #444;
        padding: 0.5rem;
        text-align: center;
    }

    th {
        background-color: #222;
    }

    td {
        background-color: #1a1a1a;
    }
</style>