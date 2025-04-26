<script>
  import { onMount } from "svelte";
  import { Card, Badge, Button, Input, Modal, Icon, Image } from "sveltestrap";
  import NavBar from "./NavBar.svelte";
  import { lang } from "../../stores/store";
  import { onDestroy } from "svelte";
  import { ParsingEntry } from "../Algo/NewsParser.js";

  let news = [];
  let filteredNews = [];
  let error = "";
  let searchQuery = "";
  let currentLang = "fr";
  let openModalId = null;

  const newsApiKey = "a6d4ce194f4d43f79d9986f88b393897";
  let country = "france";

  async function fetchNews() {
    try {
      const newsApiUrl = `https://newsapi.org/v2/everything?q=(${country} OR politique OR économie OR sport)&language=${currentLang}&sortBy=publishedAt&pageSize=100&apiKey=${newsApiKey}`;
      const response = await fetch(newsApiUrl);
      const data = await response.json();

      if (data.status === "ok" && data.articles.length > 0) {
        news = data.articles;
        filteredNews = news;
      } else {
        error = "Aucune actualité trouvée. Essayez un autre mot-clé.";
      }
    } catch (err) {
      error = "Erreur lors de la récupération des actualités.";
    }
  }

  lang.subscribe((value) => {
    if (currentLang !== value) {
      currentLang = value;
      fetchNews();
    }
  });

  onMount(fetchNews);

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

  function filterNews() {
    const query = searchQuery.toLowerCase();
    filteredNews = news.filter(
      (article) =>
        (article.title && article.title.toLowerCase().includes(query)) ||
        (article.description &&
          article.description.toLowerCase().includes(query)) ||
        (article.source.name &&
          article.source.name.toLowerCase().includes(query)) ||
        (article.author && article.author.toLowerCase().includes(query)) ||
        (article.publishedAt &&
          formatDate(article.publishedAt).toLowerCase().includes(query)),
    );
  }

  function toggleModal(articleId) {
    openModalId = openModalId === articleId ? null : articleId;
  }
</script>

<main class="main">
  <div class="global">
    <div class="actu_render">
      <div class="searchbar">
        <Input
          type="search"
          placeholder="Recherchez par titre, auteur, source, date..."
          bind:value={searchQuery}
          on:input={filterNews}
          class="search-input"
        />
      </div>

      {#if error}
        <p class="error">{error}</p>
      {:else}
        <div class="news-container">
          {#each filteredNews as article}
            <Card
              style="margin: 0.4vh; padding: 0.5vh 1vh; display: flex; flex-direction: column;"
            >
              <li class="news-item">
                <div class="badge-container">
                  <Badge color="primary">{article.source.name}</Badge>
                  <Badge style="font-size: 0.7rem; color: #555;"
                    >{formatDate(article.publishedAt)}</Badge
                  >
                  {#if article.author}
                    <Badge color="light">Auteur: {article.author}</Badge>
                  {/if}
                </div>

                <div class="content-container">
                  <div class="text-content">
                    <p class="news-title">{article.title}</p>
                    {#if article.description}
                      <p class="news-description">{article.description}</p>
                    {/if}
                  </div>
                  <Button
                    color="warning"
                    on:click={() => toggleModal(article.url)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      class="bi bi-aspect-ratio"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"
                      />
                      <path
                        d="M2 4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H3v2.5a.5.5 0 0 1-1 0zm12 7a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H13V8.5a.5.5 0 0 1 1 0z"
                      />
                    </svg>
                  </Button>
                </div>

                {#if openModalId === article.url}
                  <Modal isOpen={true} toggle={() => toggleModal(article.url)}>
                    <div slot="external" class="text-end">
                      <Button
                        color="link"
                        class="text-dark"
                        size="lg"
                        on:click={() => toggleModal(article.url)}
                      >
                        {ParsingEntry(article.description)}
                        
                        <Icon name="x" class="h1" />
                      </Button>
                    </div>
                    <div class="modal-content">
                      <h2>{article.title}</h2>
                      <div class="modal-meta">
                        <Badge color="primary">{article.source.name}</Badge>
                        {#if article.author}
                          <Badge color="light">Auteur: {article.author}</Badge>
                        {/if}
                        <Badge style="color: #555;"
                          >{formatDate(article.publishedAt)}</Badge
                        >
                      </div>
                      {#if article.urlToImage}
                        <Image
                          src={article.urlToImage}
                          alt="Image de l'article"
                          class="modal-image"
                        />
                      {/if}
                      <p class="modal-description">{article.description}</p>
                      <Button
                        color="primary"
                        href={article.url}
                        target="_blank"
                      >
                        Lire l'article complet
                      </Button>
                    </div>
                  </Modal>
                {/if}
              </li>
            </Card>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  /* Modal */
  .modal-content {
    padding: 20px;
  }

  .modal-meta {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .modal-image {
    width: 100%;
    height: auto;
    margin: 10px 0;
    border-radius: 8px;
  }

  .modal-description {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 20px;
  }

  .sidebar {
    padding: 1vh;
    margin-top: 6vh;
  }

  .main {
    background-color: #f0f0f0;
  }

  .global {
    display: flex;
    align-items: start;
    width: 100vw;
    height: 93.6vh;
    overflow: hidden;
  }

  .searchbar {
    display: flex;
    align-items: center;
    gap: 10px; /* Espacement entre l'icône et l'input */
    margin: 1vh;
  }

  .search-icon {
    width: 3vw;
    height: 4vh;
    fill: grey;
  }

  .search-input {
    flex-grow: 1; /* Permet à l'input de prendre toute la place restante */
  }

  .actu_render {
    width: 100%;
    background-color: #f0f0f0;
  }

  .error {
    color: red;
  }

  .news-container {
    height: 86vh;
    overflow-y: auto;
  }

  .news-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Conteneur des badges sur une seule ligne */
  .badge-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  /* Conteneur principal du contenu */
  .content-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .text-content {
    flex-grow: 1;
    max-width: 80%;
  }

  .news-title {
    font-size: 2vh;
    font-weight: bold;
    margin: 0;
  }

  .news-description {
    font-size: 1.6vh;
    color: #333;
    margin-top: 5px;
  }
</style>
