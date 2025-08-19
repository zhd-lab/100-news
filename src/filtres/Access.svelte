<script>
    import { onMount } from "svelte";
    import {
        Spinner,
        Image,
        Alert,
        Badge,
        Button,
        Modal,
        ModalHeader,
        ModalBody,
        ModalFooter,
        Input,
        FormGroup,
        Label,
        Card,
    } from "sveltestrap";

    import mediaListRaw from "../mediaList.json";
    export let toggle;

    let mediaList = [];
    let loading = true;
    let searchTerm = "";

    let modalOpen = false;
    let selectedMedia = null;

    const orientationOptions = [
        "far-left",
        "left",
        "center-left",
        "center",
        "center-right",
        "right",
        "far-right",
        "?",
    ];
    const accessOptions = [
        "gratuit",
        "payant",
        "partiel",
        "cookies intrusifs",
        "?",
    ];
    const trustableOptions = ["1", "0", "?"];
    const traceableOptions = ["1", "0", "?"];
    const mainTypeOptions = ["journal", "site", "chaîne", "blog", "?"];
    const locationOptions = ["France", "Europe", "International", "?"];

    const fieldOptions = {
        orientation: orientationOptions,
        access: accessOptions,
        trustable: trustableOptions,
        traceable: traceableOptions,
        "main-type": mainTypeOptions,
        location: locationOptions,
    };

    onMount(() => {
        mediaList = Object.entries(mediaListRaw).map(([name, info]) => ({
            name,
            orientation: info.orientation || "?",
            access: info.access || "?",
            trustable: info.trustable || "?",
            traceable: info.traceable || "?",
            location: info.location || "?",
            "main-type": info["main-type"] || "?",
        }));
        loading = false;
    });

    function badgeColor(label, value) {
        if (value === "?") return "light";

        if (label === "orientation") {
            switch (value) {
                case "far-left":
                    return "danger";
                case "left":
                    return "danger";
                case "center-left":
                    return "warning";
                case "center":
                    return "secondary";
                case "center-right":
                    return "info";
                case "right":
                    return "primary";
                case "far-right":
                    return "dark";
            }
        }

        if (label === "access") {
            switch (value) {
                case "gratuit":
                    return "success";
                case "payant":
                    return "danger";
                case "partiel":
                    return "warning";
                case "cookies intrusifs":
                    return "dark";
            }
        }

        if (label === "trustable" || label === "traceable") {
            return value === "1"
                ? "success"
                : value === "0"
                  ? "danger"
                  : "light";
        }

        return "secondary";
    }

    function opeEditMediaInfo(media) {
        selectedMedia = { ...media };
    }

    function saveChanges() {
        const index = mediaList.findIndex((m) => m.name === selectedMedia.name);
        if (index !== -1) {
            mediaList[index] = { ...selectedMedia };
        }
        modalOpen = false;
    }

    $: filteredMediaList = mediaList.filter((media) =>
        media.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
</script>

<main class="main d-flex flex-column align-items-center">
    {#if loading}
        <div class="d-flex align-items-center mt-4">
            <Spinner color="primary" class="me-2" />
            <span>Chargement…</span>
        </div>
    {:else}
        <Alert
            color=""
            class="mt-3 d-flex flex-column align-items-center"
            style="width: 58vw; text-align: center; font-weight: bold; backdrop-filter: blur(40vh);"
        >
            <div
                class="w-100 d-flex justify-content-between mb-3"
                style="gap: 1vh;"
            >
                <Button disabled color="dark"
                    >{filteredMediaList.length} journaux</Button
                >
                <input
                    type="text"
                    class="form-control"
                    placeholder="Rechercher un média…"
                    bind:value={searchTerm}
                    style="max-width: 80%; text-align: center;"
                />
                <Button color="dark" on:click={toggle}>Save</Button>
            </div>
        </Alert>

        <div class="media-list-scrollable">
            {#each filteredMediaList as media}
                <div class="media-card p-3 my-3">
                    <div class="d-flex align-items-center">
                        <Image
                            style="border-radius: 50%; width: 4rem;"
                            thumbnail
                            alt="Thumbnail"
                            src="https://picsum.photos/100/100?random=1"
                        />
                        <div class="media-name ms-3 fw-bold">{media.name}</div>
                        {#if selectedMedia?.name === media.name}
                            <div class="d-flex gap-2 ms-auto">
                                <Button
                                    color="success"
                                    size="sm"
                                    on:click={saveChanges}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        class="bi bi-check"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"
                                        />
                                    </svg>
                                </Button>
                                <Button
                                    color="danger"
                                    size="sm"
                                    on:click={() => (selectedMedia = null)}
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
                        {:else}
                            <Button
                                color="secondary"
                                class="ms-auto"
                                size="sm"
                                on:click={() => opeEditMediaInfo(media)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    class="bi bi-gear"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"
                                    />
                                    <path
                                        d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"
                                    />
                                </svg>
                            </Button>
                        {/if}
                    </div>

                    <div class="" style="margin-top: 1vh;">
                        {#each Object.entries(media).filter(([key]) => key !== "name") as [key, value]}
                            <Badge color={badgeColor(key, value)} style="margin: 0.2vh;"
                                >{key}: {value}</Badge
                            >
                        {/each}
                    </div>

                    <!-- Visibilité SVG fixé à droite -->
                    <div align="right">
                        <svg
                            style="margin-right: 0.5vh; color: #E2E9C0;"
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            fill="currentColor"
                            class="bi bi-eye"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"
                            />
                            <path
                                d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"
                            />
                        </svg>
                    </div>

                    {#if selectedMedia && selectedMedia.name === media.name}
                        {#each Object.entries(selectedMedia).filter(([key]) => key !== "name") as [key, value]}
                            <FormGroup class="mb-1">
                                <Label
                                    for={key}
                                    class="form-label"
                                    style="margin-bottom: 0.3rem; font-size: 0.9rem;"
                                >
                                    {key}
                                </Label>
                                {#if key === "trustable"}
                                    <Card color="light" class="p-2">
                                        <Input
                                            id={key}
                                            type="range"
                                            bind:value={selectedMedia[key]}
                                            min={0}
                                            max={10}
                                            step={1}
                                            class="form-range"
                                            style="height: 1.5rem;"
                                        />
                                    </Card>
                                {:else}
                                    <Input
                                        id={key}
                                        type="select"
                                        bind:value={selectedMedia[key]}
                                        class="form-select form-select-sm"
                                        style="padding: 0.2rem 0.5rem; height: 2rem; font-size: 0.85rem;"
                                    >
                                        {#each fieldOptions[key] as option}
                                            <option value={option}>
                                                {key === "trustable" ||
                                                key === "traceable"
                                                    ? option === "1"
                                                        ? "Oui"
                                                        : option === "0"
                                                          ? "Non"
                                                          : "?"
                                                    : option}
                                            </option>
                                        {/each}
                                    </Input>
                                {/if}
                            </FormGroup>
                        {/each}
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</main>

<style>
    .main {
        width: 100%;
        height: 90vh;
        overflow: hidden;
        backdrop-filter: blur(20px);
    }

    .media-list-scrollable {
        width: 100%;
        max-width: 60vw;
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
    }

    .media-card {
        width: 100%;
        backdrop-filter: blur(40vh);
        color: #d0d5da;
        border-radius: 0.5rem;
        border: 1px solid #ccc;
    }

    .media-name {
        font-size: 1.2rem;
    }

    .media-list-scrollable::-webkit-scrollbar {
        width: 10px;
    }

    .media-list-scrollable::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background: #555;
    }

    .media-list-scrollable::-webkit-scrollbar-thumb:hover {
        background: rgba(37, 36, 36, 0.822);
    }
</style>
