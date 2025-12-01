<script>
    import { onDestroy } from "svelte";
    import {
        state,
        mode,
        showOffcanvas,
        color,
        cardColor,
        likedList,
    } from "../../stores/store";
    import {
        Card,
        CardBody,
        CardTitle,
        CardText,
        Button,
        Badge,
        CardImg,
        Row,
        Col,
    } from "sveltestrap";

    let currentLikedList = [];
    let currentLang = "fr";

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

    const unsubscribeLikedList = likedList.subscribe((value) => {
        currentLikedList = value;
    });

    onDestroy(() => {
        unsubscribeLikedList();
        unsubColor();
        unsubCardColor();
    });

    function formatDate(dateString) {
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString(
            currentLang === "fr" ? "fr-FR" : "en-US",
            options,
        );
    }

    function removeFromLiked(article) {
        likedList.update((list) =>
            list.filter((item) => item.title !== article.title),
        );
    }
</script>

<main class="main">
    {#if currentLikedList.length <= 0}
        <div class="empty-state">
            <div>
                <svg
                    style="color:#198754;"
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    fill="currentColor"
                    class="emoji-icon"
                    viewBox="0 0 16 16"
                >
                    <path
                        d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8"
                    />
                </svg>
                <p class="empty-text">Rien à lire ici pour le moment</p>
            </div>
            <Button
                outline
                color="success"
                on:click={() => showOffcanvas.set(false)}
                style="margin-top: 1vh;">Retour à l'actualité</Button
            >
        </div>
    {:else}
        <Row>
            {#each currentLikedList as article (article.url || article.title)}
                <Col sm="12" md="6" lg="4" class="mb-4">
                    <Card
                        class="h-100 d-flex flex-column shadow-sm"
                        outline
                        style="background-color: {currentCardColor}; color: {currentColor}; transition: background-color 1s, color 0.3s;"
                    >
                        {#if article.urlToImage}
                            <CardImg
                                top
                                src={article.urlToImage}
                                alt="Image de l'article"
                                class="rounded-top"
                            />
                        {/if}
                        <CardBody class="d-flex flex-column flex-grow-1">
                            <CardTitle tag="h2" class="h5 mb-2">
                                {article.title}
                            </CardTitle>

                            <div class="mb-2 d-flex flex-wrap gap-1">
                                <Badge color="primary"
                                    >{article.source.name}</Badge
                                >
                                {#if article.author}
                                    <Badge color="secondary">
                                        Auteur: {article.author}
                                    </Badge>
                                {/if}
                                <Badge color="light" class="text-muted">
                                    {formatDate(article.publishedAt)}
                                </Badge>
                            </div>

                            <CardText
                                class="flex-grow-1"
                                style="font-size: 0.95rem; color: #7a7575;"
                            >
                                {article.description}
                            </CardText>

                            <div
                                class="d-flex justify-content-between align-items-center mt-3 gap-2 flex-wrap"
                            >
                                <Button
                                    color="primary"
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Lire l'article complet"
                                >
                                    Lire
                                </Button>
                                <Button
                                    color="danger"
                                    outline
                                    on:click={() => removeFromLiked(article)}
                                    aria-label="Retirer des favoris"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        class="bi bi-x-circle"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
                                        />
                                        <path
                                            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
                                        />
                                    </svg>
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            {/each}
        </Row>
    {/if}
</main>

<style>
    .main {
        overflow-x: hidden;
        overflow-y: scroll;

        height: 80vh;
        padding-top: 6vh;
        padding-inline: 2vw;
        padding-bottom: 2vh;
        width: 90vw;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        box-sizing: border-box;
    }

    .empty-state {
        font-size: 2vh;
        text-align: center;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .emoji-icon {
        margin-top: 1rem;
    }

    .empty-text {
        margin-top: 2vh;
        font-weight: lighter;
    }
</style>
