<script>
    import { onMount } from "svelte";
    let text = "100 News";
    let displayedText = "";
    let index = 0;
    const duration = 1500;
    const interval = duration / text.length;

    onMount(() => {
        const timer = setInterval(() => {
            if (index < text.length) {
                displayedText += text[index];
                index++;
            } else {
                clearInterval(timer);
            }
        }, interval);
    });
</script>

<main class="box">
    <div class="container">{displayedText}</div>
</main>

<style>
    .box {
        animation: bgLoading 4s linear forwards;
    }

    @keyframes bgLoading {
        0% {
            background-color: inherit;
            color: #0d6efd;
        }
        80% {
            background-color: inherit;
            color: #0d6efd;
            text-decoration: none;
        }
        100% {
            background-color: #0d6dfd8a;
            color: white;
            text-decoration: underline;
        }
    }

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-size: 8vh;
        font-weight: bold;
        font-family: Arial, sans-serif;
    }
</style>
