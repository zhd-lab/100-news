<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Card,
    Badge,
    Button,
    Input,
    Modal,
    Image,
    ListGroup,
    ListGroupItem,
    Alert,
    Progress,
    CardBody,
    CardHeader,
    CardFooter,
    CardTitle,
    Offcanvas,
    Nav,
  } from "sveltestrap";

  import Access from "../filtres/Access.svelte";

  import NavBar from "./NavBar.svelte";
  import {
    lang,
    mode,
    color,
    cardColor,
    InputColor,
    likedList,
    news,
  } from "../../stores/store";
  import mediaList from "../mediaList.json";

  let id = 1;
  let open = true;

  let filteredNews = [];
  let error = "";
  let searchQuery = "";
  let currentLang = "fr";
  let openModalId = null;

  let currentColor = "";
  let currentCardColor = "";
  let currentInputColor = "";
  let currentMode = "light";
  let currentLikedList = [];

  let refreshInterval;
  let lastFetchedUrls = new Set();

  let selectedItem = "stack"; // 'stack' 'b-cubes' 'l-cubes'

  let displayBoardStyle =
    "border-radius: 50%;width: 6vh;height: 6vh;font-weight: bold;font-size: 1.2rem;display: flex;justify-content: center;align-items: center;";

  const unsubLang = lang.subscribe((value) => {
    if (currentLang !== value) {
      currentLang = value;
      fetchNewsWithRefresh();
    }
  });

  const unsubMode = mode.subscribe((value) => {
    currentMode = value;
  });
  const unsubColor = color.subscribe((value) => {
    currentColor = value;
  });
  const unsubCardColor = cardColor.subscribe((value) => {
    currentCardColor = value;
  });
  const unsubInputColor = InputColor.subscribe((value) => {
    currentInputColor = value;
  });

  const unsubscribeLikedList = likedList.subscribe((value) => {
    currentLikedList = value;
  });

  const newsApiKey = "a6d4ce194f4d43f79d9986f88b393897";
  let country = "france";

  let TopWordsList = [];
  const wordCount = {};
  let c = []; // tmp swap

  async function fetchNewsWithRefresh() {
    console.log("🔄 Rafraîchissement à", new Date().toLocaleTimeString());

    try {
      const newsApiUrl = `https://newsapi.org/v2/everything?q=(${country} OR politique OR économie OR sport)&language=${currentLang}&sortBy=publishedAt&pageSize=100&apiKey=${newsApiKey}`;
      const response = await fetch(newsApiUrl);
      const data = await response.json();

      if (data.status === "ok" && data.articles.length > 0) {
        const newArticles = data.articles.map((article) => ({
          ...article,
          isNew: !lastFetchedUrls.has(article.url),
        }));

        // Met à jour les URLs connues
        lastFetchedUrls = new Set(data.articles.map((a) => a.url));

        const added = newArticles.filter((a) => a.isNew);
        if (added.length) {
          console.log(
            "🆕 Nouveaux articles :",
            added.map((a) => a.title),
          );
        } else {
          console.log("Aucun nouvel article.");
        }

        c = newArticles;
        filteredNews = c;
        filterNews(); // pour garder la recherche en cours

        // parsing
        // Analyse de fréquence des mots dans les titres

        newArticles.forEach((article) => {
          const words = article.title
            .toLowerCase()
            .replace(/[^\p{L}\s]/gu, " ") // conserve lettres UTF-8 et espaces
            .split(/\s+/);

          words.forEach((word) => {
            if (word.length > 5) {
              // ignore les mots trop courts (ex: "le", "de", etc.)
              wordCount[word] = (wordCount[word] || 0) + 1;
            }
          });
        });

        let count;
        const topWords = Object.entries(wordCount)
          .sort((a, b) => b[1] - a[1]) // tri par fréquence décroissante
          .slice(0, 5) // top 5
          .map(([word, count]) => word);
        TopWordsList = topWords;

        console.log("🔠 Mots les plus fréquents dans les titres :", topWords);
      } else {
        error = "Aucune actualité trouvée.";
      }
    } catch (err) {
      console.error(err);
      error = "Erreur de récupération des actualités.";
    }
  }

  // display board
  function setDisplayState(target) {
    selectedItem = target;
    console.log(selectedItem);
  }

  function getDisplayColor(target) {
    if (selectedItem === target) {
      return "primary";
    }
    return "light";
  }

  // tendance
  let isSpeaking = false;
  let currentUtterance = null;

  function speakArticle(article) {
    if (isSpeaking && currentUtterance) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      currentUtterance = null;
      return;
    }

    const textToRead = `${article.title}. ${article.description || ""}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = currentLang === "fr" ? "fr-FR" : "en-US";

    utterance.onend = () => {
      isSpeaking = false;
      currentUtterance = null;
    };

    currentUtterance = utterance;
    isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  // right canvas
  let targetComponent;
  let isOpen = false;

  const toggle = (component) => {
    isOpen = !isOpen;
    targetComponent = component;
  };

  function getBiasColor(sourceName) {
    const orientation = (
      mediaList[sourceName]?.orientation || "?"
    ).toLowerCase();

    switch (orientation) {
      case "far-left":
        return "danger"; // rouge vif
      case "left":
        return "danger"; // rouge
      case "center-left":
        return "warning"; // orange
      case "center":
        return "secondary"; // gris
      case "center-right":
        return "info"; // bleu clair
      case "right":
        return "primary"; // bleu
      case "far-right":
        return "dark"; // bleu foncé
      default:
        return "light"; // orientation inconnue ou vide
    }
  }

  function normalizeText(text) {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function filterNews() {
    const query = normalizeText(searchQuery);

    filteredNews = c.filter((article) => {
      return (
        (article.title && normalizeText(article.title).includes(query)) ||
        (article.description &&
          normalizeText(article.description).includes(query)) ||
        (article.source.name &&
          normalizeText(article.source.name).includes(query)) ||
        (article.author && normalizeText(article.author).includes(query)) ||
        (article.publishedAt &&
          normalizeText(formatDate(article.publishedAt)).includes(query))
      );
    });
  }

  function searchFromButton(value) {
    searchQuery = value;
    filterNews();
  }

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

  function toggleModal(articleId) {
    openModalId = openModalId === articleId ? null : articleId;
  }

  onMount(() => {
    fetchNewsWithRefresh();
    refreshInterval = setInterval(fetchNewsWithRefresh, 60000); // 60 sec
  });

  onDestroy(() => {
    clearInterval(refreshInterval);
    unsubLang();
    unsubMode();
    unsubColor();
    unsubCardColor();
    unsubInputColor();
    unsubscribeLikedList();
  });

  // progress bar calculs
  $: biasCounts = {
    left: 0,
    center: 0,
    right: 0,
    unknown: 0,
    total: 0,
  };

  $: {
    const counts = {
      left: 0,
      center: 0,
      right: 0,
      unknown: 0,
    };

    for (const article of filteredNews) {
      const media = mediaList[article.source.name];
      const orientation = media?.orientation?.toLowerCase() || "?";

      if (["left", "far-left", "center-left"].includes(orientation)) {
        counts.left++;
      } else if (orientation === "center") {
        counts.center++;
      } else if (["right", "far-right", "center-right"].includes(orientation)) {
        counts.right++;
      } else {
        counts.unknown++;
      }
    }

    biasCounts = {
      ...counts,
      total: filteredNews.length || 1, // évite la division par zéro
    };
  }

  // liked list && btn event
  export function LikedArticleManager(title, source, author, publishedAt, description, url) {
  likedList.update((list) => {
    const exists = list.some(
      (item) => item.title === title && item.publishedAt === publishedAt,
    );

    if (!exists) {
      // add
      return [
        ...list,
        { title, source, author, publishedAt, description, url },
      ];
    } else {
      // remove
      return list.filter(
        (item) =>
          !(item.title === title && item.publishedAt === publishedAt),
      );
    }
  });
}
</script>

<main
  class="main"
  style="background-color: {currentCardColor}; color: {currentColor}; transition:
      background-color 1s,
      color 0.3s;"
>
  <div
    class="global"
    style="background-color: {currentCardColor}; color: {currentColor};transition:
      background-color 1s,
      color 0.3s;"
  >
    <!-- midle top -->
    <div class="actu_render">
      <div
        class="searchbar"
        style="display: flex; align-items: center; padding: 1vh;"
      >
        <!-- Conteneur de l'input -->
        <Badge color="secondary" style="margin-top: 0.2rem; margin-right: 2vh;"
          >{country}</Badge
        >
        <div
          style="display: flex; flex-direction: column; flex-grow: 2; margin-right: 2vh;"
        >
          <input
            class="input-search"
            style="background-color: {currentInputColor}; color: grey; font-weight: bold; width: 100%; transition:
              background-color 1s,
              color 0.3s;"
            type="search"
            placeholder="Recherchez par titre, auteur, source, date..."
            bind:value={searchQuery}
            on:input={filterNews}
          />
        </div>

        <!-- NavBar -->
        <div style="width: auto">
          <NavBar />
        </div>
      </div>

      <div class="block-2">
        <div
          class="line-bar"
          style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 0.2vh; margin-bottom: 1vh;"
        >
          <!-- Button à gauche -->
          <Button
            color="dark"
            on:click={() => toggle("SubAccess")}
            style="margin-right: 2vh; margin-left: 0.5vh;"
          >
            Filtres
          </Button>

          <!-- Centre (progress) -->
          <div
            style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 1rem; flex: 1;"
          >
            <!-- Gauche -->
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <Badge color="danger">Gauche</Badge>
              <span
                >{((biasCounts.left / biasCounts.total) * 100).toFixed(
                  1,
                )}%</span
              >
              <Progress
                color="danger"
                value={(biasCounts.left / biasCounts.total) * 100}
                max={100}
                style="height: 1rem; width: 10vw;"
              />
            </div>

            <!-- Centre -->
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <Badge color="secondary">Centre</Badge>
              <span
                >{((biasCounts.center / biasCounts.total) * 100).toFixed(
                  1,
                )}%</span
              >
              <Progress
                color="secondary"
                value={(biasCounts.center / biasCounts.total) * 100}
                max={100}
                style="height: 1rem; width: 10vw;"
              />
            </div>

            <!-- Droite -->
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <Badge color="primary">Droite</Badge>
              <span
                >{((biasCounts.right / biasCounts.total) * 100).toFixed(
                  1,
                )}%</span
              >
              <Progress
                color="primary"
                value={(biasCounts.right / biasCounts.total) * 100}
                max={100}
                style="height: 1rem; width: 10vw;"
              />
            </div>

            <!-- Inconnu -->
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <Badge color="light" textColor="dark">Inconnu</Badge>
              <span
                >{((biasCounts.unknown / biasCounts.total) * 100).toFixed(
                  1,
                )}%</span
              >
              <Progress
                color="light"
                value={(biasCounts.unknown / biasCounts.total) * 100}
                max={100}
                style="height: 1rem; width: 10vw;"
              />
            </div>
          </div>
        </div>

        <!-- top 5 -->
        <div class="block-3">
          {#if TopWordsList.length > 0}
            <div
              style="display: flex; item-align: center; justify-content: center;"
            >
              <div style="display: flex; gap: 1.5vh; flex-wrap: wrap;">
                {#each TopWordsList as word}
                  <Button
                    color="light"
                    on:click={() => searchFromButton(word)}
                    style="padding: 0.4vh 1vh 0.4vh 1vh;">{word}</Button
                  >
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- article block -->
      {#if error}
        <p class="error">{error}</p>
      {:else}
        <div class="news-container">
          {#if selectedItem === "stack"}
            <div class="layout-stack news-layout">
              {#each filteredNews as article}
                <Card
                  style="border-color: grey; margin: 1vh; padding: 2vh 1vh; display: flex; flex-direction: column; background-color: {currentCardColor}; color: {currentColor};transition:
      background-color 1s,
      color 0.3s;"
                >
                  <li class="news-item">
                    <div class="badge-container">
                      <div class="left-badges">
                        <Badge color={getBiasColor(article.source.name)}>
                          {article.source.name}
                        </Badge>

                        <Badge style="font-size: 0.7rem; color: #555;">
                          {formatDate(article.publishedAt)}
                        </Badge>
                        {#if article.author}
                          <Badge color="light">Auteur: {article.author}</Badge>
                        {/if}
                      </div>
                      {#if article.isNew}
                        <Badge color="success" style="margin: 0.2vh;">NEW</Badge
                        >
                      {/if}
                    </div>

                    <div class="content-container">
                      <div class="text-content">
                        <p class="news-title">{article.title}</p>
                        {#if article.description}
                          <p class="news-description">
                            {article.description}
                          </p>
                        {/if}
                      </div>
                    </div>

                    <div
                      style="display: flex; gap: 2vh; align-items: center; margin-left: auto;"
                    >
                      {#if $likedList.some((item) => item.title === article.title && item.publishedAt === article.publishedAt)}
                        <Button
                          color="danger"
                          on:click={() => {
                            LikedArticleManager(
                              article.title,
                              article.source,
                              article.author,
                              article.publishedAt,
                              article.description,
                              article.url
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            class="bi bi-heart"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"
                            />
                          </svg>
                        </Button>
                      {:else}
                        <Button
                          color="light"
                          on:click={() => {
                            LikedArticleManager(
                              article.title,
                              article.source,
                              article.author,
                              article.publishedAt,
                              article.description,
                              article.url
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            class="bi bi-heart"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"
                            />
                          </svg>
                        </Button>
                      {/if}

                      <Button
                        color="light"
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
                            d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 
           3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 
           12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 
           .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"
                          />
                          <path
                            d="M2 4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 
           1H3v2.5a.5.5 0 0 1-1 0zm12 7a.5.5 0 0 1-.5.5h-3a.5.5 
           0 0 1 0-1H13V8.5a.5.5 0 0 1 1 0z"
                          />
                        </svg>
                      </Button>

                      <Button
                        color="link"
                        on:click={() => speakArticle(article)}
                        title="Lire à voix haute"
                        style="text-decoration: none;"
                      >
                        <span style="font-size: larger;">🔊</span>
                      </Button>
                    </div>

                    {#if openModalId === article.url}
                      <Modal
                        isOpen={true}
                        toggle={() => toggleModal(article.url)}
                        size="lg"
                      >
                        <div slot="external" class="text-end">
                          <Button
                            color="link"
                            class="text-dark"
                            size="lg"
                            on:click={() => toggleModal(article.url)}
                          ></Button>
                        </div>
                        <div
                          class="modal-content"
                          style="background-color: {currentCardColor}; color: {currentColor};transition:
      background-color 1s,
      color 0.3s;"
                        >
                          <h2>{article.title}</h2>
                          <div class="modal-meta">
                            <Badge color="primary">{article.source.name}</Badge>
                            {#if article.author}
                              <Badge color="light"
                                >Auteur: {article.author}</Badge
                              >
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
                          <p class="modal-description">
                            {article.description}
                          </p>
                          <Button
                            color="light"
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
          {:else if selectedItem === "l-cubes"}
            <div class="layout-l-cubes news-layout">
              {#each filteredNews as article}
                <Card
                  style="border-color: grey; margin: 1vh; padding: 2vh 1vh; display: flex; flex-direction: column; background-color: {currentCardColor}; color: {currentColor};transition:
      background-color 1s,
      color 0.3s;"
                >
                  <li class="news-item">
                    <div class="badge-container">
                      <div class="left-badges">
                        <Badge color={getBiasColor(article.source.name)}>
                          {article.source.name}
                        </Badge>

                        <Badge style="font-size: 0.7rem; color: #555;">
                          {formatDate(article.publishedAt)}
                        </Badge>
                        {#if article.author}
                          <Badge color="light">Auteur: {article.author}</Badge>
                        {/if}
                      </div>
                      {#if article.isNew}
                        <Badge color="success" style="margin: 0.2vh;">NEW</Badge
                        >
                      {/if}
                    </div>

                    <div class="content-container">
                      <div class="text-content">
                        <p class="news-title">{article.title}</p>
                        {#if article.description}
                          <p class="news-description">
                            {article.description}
                          </p>
                        {/if}
                      </div>
                    </div>

                    <div
                      style="display: flex; gap: 2vh; align-items: center; margin-left: auto;"
                    >
                      {#if $likedList.some((item) => item.title === article.title && item.publishedAt === article.publishedAt)}
                        <Button
                          color="danger"
                          on:click={() => {
                            LikedArticleManager(
                              article.title,
                              article.source,
                              article.author,
                              article.publishedAt,
                              article.description,
                              article.url
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            class="bi bi-heart"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"
                            />
                          </svg>
                        </Button>
                      {:else}
                        <Button
                          color="light"
                          on:click={() => {
                            LikedArticleManager(
                              article.title,
                              article.source,
                              article.author,
                              article.publishedAt,
                              article.description,
                              article.url
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            class="bi bi-heart"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"
                            />
                          </svg>
                        </Button>
                      {/if}

                      <Button
                        color="light"
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
                            d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 
           3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 
           12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 
           .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"
                          />
                          <path
                            d="M2 4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 
           1H3v2.5a.5.5 0 0 1-1 0zm12 7a.5.5 0 0 1-.5.5h-3a.5.5 
           0 0 1 0-1H13V8.5a.5.5 0 0 1 1 0z"
                          />
                        </svg>
                      </Button>

                      <Button
                        color="link"
                        on:click={() => speakArticle(article)}
                        title="Lire à voix haute"
                        style="text-decoration: none;"
                      >
                        <span style="font-size: larger;">🔊</span>
                      </Button>
                    </div>

                    {#if openModalId === article.url}
                      <Modal
                        isOpen={true}
                        toggle={() => toggleModal(article.url)}
                        size="lg"
                      >
                        <div slot="external" class="text-end">
                          <Button
                            color="link"
                            class="text-dark"
                            size="lg"
                            on:click={() => toggleModal(article.url)}
                          ></Button>
                        </div>
                        <div
                          class="modal-content"
                          style="background-color: {currentCardColor}; color: {currentColor};transition:
      background-color 1s,
      color 0.3s;"
                        >
                          <h2>{article.title}</h2>
                          <div class="modal-meta">
                            <Badge color="primary">{article.source.name}</Badge>
                            {#if article.author}
                              <Badge color="light"
                                >Auteur: {article.author}</Badge
                              >
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
                          <p class="modal-description">
                            {article.description}
                          </p>
                          <Button
                            color="light"
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
          {:else if selectedItem === "b-cubes"}
            <div class="layout-b-cubes news-layout">
              {#each filteredNews as article}
                <Card
                  style="border-color: grey; margin: 1vh; padding: 2vh 1vh; display: flex; flex-direction: column; background-color: {currentCardColor}; color: {currentColor};transition:
      background-color 1s,
      color 0.3s;"
                >
                  <li class="news-item">
                    <div class="badge-container">
                      <div class="left-badges">
                        <Badge color={getBiasColor(article.source.name)}>
                          {article.source.name}
                        </Badge>

                        <Badge style="font-size: 0.7rem; color: #555;">
                          {formatDate(article.publishedAt)}
                        </Badge>
                        {#if article.author}
                          <Badge color="light">Auteur: {article.author}</Badge>
                        {/if}
                      </div>
                      {#if article.isNew}
                        <Badge color="success" style="margin: 0.2vh;">NEW</Badge
                        >
                      {/if}
                    </div>

                    <div class="content-container">
                      <div class="text-content">
                        <p class="news-title">{article.title}</p>
                        {#if article.description}
                          <p class="news-description">
                            {article.description}
                          </p>
                        {/if}
                      </div>
                    </div>

                    <!-- fixer la position au bottom de la card sans overflow -->
                    <div
                      style="display: flex; gap: 2vh; align-items: center; margin-left: auto;"
                    >
                      {#if $likedList.some((item) => item.title === article.title && item.publishedAt === article.publishedAt)}
                        <Button
                          color="danger"
                          on:click={() => {
                            LikedArticleManager(
                              article.title,
                              article.source,
                              article.author,
                              article.publishedAt,
                              article.description,
                              article.url
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            class="bi bi-heart"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"
                            />
                          </svg>
                        </Button>
                      {:else}
                        <Button
                          color="light"
                          on:click={() => {
                            LikedArticleManager(
                              article.title,
                              article.source,
                              article.author,
                              article.publishedAt,
                              article.description,
                              article.url
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            class="bi bi-heart"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"
                            />
                          </svg>
                        </Button>
                      {/if}

                      <Button
                        color="light"
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
                            d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 
           3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 
           12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 
           .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"
                          />
                          <path
                            d="M2 4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 
           1H3v2.5a.5.5 0 0 1-1 0zm12 7a.5.5 0 0 1-.5.5h-3a.5.5 
           0 0 1 0-1H13V8.5a.5.5 0 0 1 1 0z"
                          />
                        </svg>
                      </Button>

                      <Button
                        color="link"
                        on:click={() => speakArticle(article)}
                        title="Lire à voix haute"
                        style="text-decoration: none;"
                      >
                        <span style="font-size: larger;">🔊</span>
                      </Button>
                    </div>

                    {#if openModalId === article.url}
                      <Modal
                        isOpen={true}
                        toggle={() => toggleModal(article.url)}
                        size="lg"
                      >
                        <div slot="external" class="text-end">
                          <Button
                            color="link"
                            class="text-dark"
                            size="lg"
                            on:click={() => toggleModal(article.url)}
                          ></Button>
                        </div>
                        <div
                          class="modal-content"
                          style="background-color: {currentCardColor}; color: {currentColor};transition:
      background-color 1s,
      color 0.3s;"
                        >
                          <h2>{article.title}</h2>
                          <div class="modal-meta">
                            <Badge color="primary">{article.source.name}</Badge>
                            {#if article.author}
                              <Badge color="light"
                                >Auteur: {article.author}</Badge
                              >
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
                          <p class="modal-description">
                            {article.description}
                          </p>
                          <Button
                            color="light"
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

        <!-- display board -->
        {#if selectedItem}
          <div class="display_board">
            {#if selectedItem === "l-cubes"}
              <Button
                color="primary"
                on:click={() => {
                  setDisplayState("l-cubes");
                }}
                style={displayBoardStyle}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-grid-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5z"
                  />
                </svg>
              </Button>
            {:else}
              <Button
                color="light"
                on:click={() => {
                  setDisplayState("l-cubes");
                }}
                style={displayBoardStyle}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-grid-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5z"
                  />
                </svg>
              </Button>
            {/if}
            {#if selectedItem === "stack"}
              <Button
                color="primary"
                on:click={() => {
                  setDisplayState("stack");
                }}
                style={displayBoardStyle}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-view-stacked"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M3 0h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm0 8h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"
                  />
                </svg>
              </Button>
            {:else}
              <Button
                color="light"
                on:click={() => {
                  setDisplayState("stack");
                }}
                style={displayBoardStyle}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-view-stacked"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M3 0h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm0 8h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"
                  />
                </svg>
              </Button>
            {/if}
            {#if selectedItem === "b-cubes"}
              <Button
                color="primary"
                on:click={() => {
                  setDisplayState("b-cubes");
                }}
                style={displayBoardStyle}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-grid-3x3-gap-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"
                  />
                </svg>
              </Button>
            {:else}
              <Button
                color="light"
                on:click={() => {
                  setDisplayState("b-cubes");
                }}
                style={displayBoardStyle}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-grid-3x3-gap-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"
                  />
                </svg>
              </Button>
            {/if}
          </div>
        {/if}

        <!-- right canvas -->
        <Offcanvas
          style="backdrop-filter: blur(20px); width: 100%; background-color:transparent;"
          {isOpen}
          backdrop={true}
          placement="start"
        >
          <Access {toggle} />
        </Offcanvas>
      {/if}
    </div>
  </div>
</main>

<style>
  /* Styles généraux */
  @import url("https://api.fontshare.com/v2/css?f[]=kola@400&display=swap");

  .global {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .actu_render {
    width: 100%;
  }

  .error {
    color: red;
  }

  .news-item {
    display: inline-flex;
    flex-direction: column;
    gap: 2vh;
    padding-left: 2vh;
  }

  .badge-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }

  .left-badges {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

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
    margin-top: 1vh;
  }

  .modal-content {
    padding: 2vh;
  }

  .modal-meta {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .modal-description {
    font-size: 1.2rem;
    margin-top: 4vh;
    margin-bottom: 2vh;
  }

  /* line bar */
  .line-bar {
    width: 100%;
    flex-wrap: wrap;
  }

  /* placeholder */
  .input-search {
    border-radius: 2vh;
    text-align: center;
    width: 40vw;
    height: 4vh;
    border: none;
  }
  .input-search::placeholder {
    color: #bbb6b6;
  }

  /* logo */
  .logo {
    font-family: "kola", sans-serif;
    font-size: 4rem;
    margin-top: 2vh;
    color: #284063;
  }

  /* animations de loading */
  .main {
    animation: bg_anim 4s ease-in forwards;
  }
  @keyframes bg_anim {
    0% {
      background-color: #00000044;
    }
    100% {
      background-color: #ffffff;
    }
  }
  .searchbar {
    z-index: 2;
    display: flex;
    animation: searchbar_anim linear 0.3s forwards;
  }
  @keyframes searchbar_anim {
    0% {
      margin-top: -8vh;
    }
    100% {
      margin-top: 0vh;
    }
  }

  .block-2 {
    z-index: 1;
    animation: block_2_anim ease-in 1.2s forwards;
  }
  @keyframes block_2_anim {
    0% {
      margin-top: -10vh;
      opacity: 0;
    }
    50% {
      margin-top: -10vh;
      opacity: 0;
    }
    85% {
      opacity: 0;
    }
    100% {
      margin-top: 0vh;
      opacity: 1;
    }
  }

  .block-3 {
    z-index: 0;
    margin-bottom: 2vh;
    animation: block_3_anim ease-in 3.5s forwards;
  }
  @keyframes block_3_anim {
    0% {
      opacity: 0;
    }
    90% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .news-container {
    height: 80vh;
    overflow-y: hidden;
    animation: news_anim ease-in 0.4s forwards;
  }
  @keyframes news_anim {
    0% {
      margin-top: -2vh;
      opacity: 0;
    }
    100% {
      margin-top: 0vh;
      opacity: 1;
    }
  }

  /* display board */
  .display_board {
    position: fixed;
    bottom: 2vh;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1vh;
    z-index: 1000;
    backdrop-filter: blur(20vh);
    padding: 1vh 2vh;
    border-radius: 2vh;
    box-shadow: 0 0 2vh rgba(0, 0, 0, 0.2); /* optionnel pour esthétique */
  }

  .news-layout {
    height: 80vh;
    overflow-y: auto;
    animation: news_anim ease-in 1.5s forwards;
    padding: 1vh;
  }

  .layout-stack {
    display: flex;
    flex-direction: column;
    gap: 2vh;
  }

  .layout-l-cubes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
    gap: 2vh;
  }

  .layout-b-cubes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30%, 1fr));
    gap: 2vh;
  }

  .news-card {
    padding: 2vh 1vh;
    background-color: var(--card-bg, white);
    color: var(--text-color, black);
    transition:
      background-color 1s,
      color 0.3s;
  }
</style>
