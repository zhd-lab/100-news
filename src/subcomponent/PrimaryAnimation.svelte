<script>
    const radius = 20;
    const distance = 120;
    const centerX = 150;
    const centerY = 150;

    const positions = [
        { x: centerX, y: centerY - distance / Math.sqrt(3) }, // haut
        {
            x: centerX - distance / 2,
            y: centerY + distance / (2 * Math.sqrt(3)),
        }, // bas gauche
        {
            x: centerX + distance / 2,
            y: centerY + distance / (2 * Math.sqrt(3)),
        }, // bas droite
    ];

    const triangleCenter = {
        x: (positions[0].x + positions[1].x + positions[2].x) / 3,
        y: (positions[0].y + positions[1].y + positions[2].y) / 3,
    };
</script>

<main class="main">
    <svg viewBox="0 0 300 300">
        {#each positions as { x, y }, i}
            <circle
                cx={x}
                cy={y}
                r={radius}
                class="circle explode-{i}"
                style="--cx: {x}px; --cy: {y}px;"
            />
        {/each}

        <text
            x={triangleCenter.x}
            y={triangleCenter.y}
            text-anchor="middle"
            dominant-baseline="middle"
            class="triangle-text"
        >
            Prysma
        </text>
    </svg>
</main>

<style>
    @import url('https://api.fontshare.com/v2/css?f[]=kola@400&display=swap');

    .main {
        background-color: black;
        overflow: hidden;
        animation: bg_anim 6s ease-in-out forwards;
    }

    @keyframes bg_anim {
        0% {
            background-color: #a3b7c4;
        }
        50% {
            background-color: black;
        }
        100% {
            background-color: #00000044;
        }
    }

    svg {
        display: block;
        margin: auto;
        height: 100vh;
        width: 100vw;
        animation: svgRotation 2s ease-in forwards;
    }
    @keyframes svgRotation {
        to {
            transform: rotate(360deg);
        }
    }

    .circle {
        transform-origin: center;
        animation:
            moveToCenter 2s ease-in forwards,
            none 2s ease-out 2s forwards;
    }

    @keyframes moveToCenter {
        0% {
            opacity: 0.2;
            fill: #d3c9c9;
            transform: translate(0, 0);
        }
        100% {
            opacity: 1;
            transform:
                translate(
                    calc(150px - var(--cx)),
                    calc(150px - var(--cy))
                );
                fill: #0000002a;
        }
    }

    /* Explosion animations */
    @keyframes explode-up {
        to {
            transform: translate(0, -600px);
            r: 0;
            opacity: 0;
        }
    }

    @keyframes explode-left {
        to {
            transform: translate(-600px, 600px);
            r: 0;
            opacity: 0;
        }
    }

    @keyframes explode-right {
        to {
            transform: translate(600px, 600px);
            r: 0;
            opacity: 0;
        }
    }

    /* Explosion directions per circle */
    .explode-0 {
        animation:
            moveToCenter 2s ease-in forwards,
            explode-up 2s ease-out 2s forwards;
    }

    .explode-1 {
        animation:
            moveToCenter 2s ease-in forwards,
            explode-left 2s ease-out 2s forwards;
    }

    .explode-2 {
        animation:
            moveToCenter 2s ease-in forwards,
            explode-right 2s ease-out 2s forwards;
    }

    .triangle-text {
        fill: white;
        font-size: 2rem;
        font-family: 'kola', sans-serif;
        opacity: 0;
        animation: text_fadein 4s ease-in 2s forwards;
    }

    @keyframes text_fadein {
        0% {
            opacity: 0;
        }
        80% {
            opacity: 1;
        }
        100% {
            opacity: 0.2;
        }
    }
</style>
