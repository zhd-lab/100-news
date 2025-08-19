<script>
    import { onMount } from "svelte";
    import { Spinner, Image, Alert, Badge, Button } from "sveltestrap";
    import mediaListRaw from "../mediaList.json";

    export let toggle;

    let mediaList = [];
    let loading = true;
    let searchTerm = "";

    onMount(() => {
        mediaList = Object.entries(mediaListRaw).map(([name, info]) => ({
            name,
            orientation: info.orientation || "?",
            access: info.access || "?",
            trustable: info.trustable || "?",
        }));
        loading = false;
    });

    function orientationColor(orientation) {
        switch (orientation) {
            case "far-left": return "danger";
            case "left": return "danger";
            case "center-left": return "warning";
            case "center": return "secondary";
            case "center-right": return "info";
            case "right": return "primary";
            case "far-right": return "dark";
            default: return "light";
        }
    }

    function accessClass(access) {
        switch (access) {
            case "gratuit": return "success";
            case "payant": return "danger";
            case "partiel": return "warning";
            case "cookies intrusifs": return "dark";
            default: return "light";
        }
    }

    function trustableClass(trustable) {
        switch (trustable) {
            case "1": return "success"; // Fiable
            case "0": return "danger"; // Pas fiable
            default: return "light";  // Inconnu
        }
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
            color="dark"
            class="mt-3 d-flex flex-column align-items-center"
            style="width: 50%; text-align: center; font-weight: bold;"
        >
            <div class="w-100 d-flex justify-content-between" style="margin-bottom: 2vh;">
                <Button disabled color="secondary">
                    {filteredMediaList.length} journaux
                </Button>
                <Button color="dark" on:click={toggle}>
                    Save
                </Button>
            </div>

            <input
                type="text"
                class="form-control mt-2"
                placeholder="Rechercher un média…"
                bind:value={searchTerm}
                style="max-width: 80%; text-align: center;"
            />
        </Alert>

        <div class="media-list-scrollable">
            {#each filteredMediaList as media}
                <div class="media-card d-flex align-items-center px-3 py-2 my-2">
                    <!-- Image + nom -->
                    <div class="d-flex align-items-center" style="flex: 1;">
                        <Image
                            style="border-radius: 50%; width: 4rem;"
                            thumbnail
                            alt="Thumbnail"
                            src="https://picsum.photos/100/100?random=1"
                        />
                        <div class="media-name ms-3">{media.name}</div>
                    </div>

                    <!-- Orientation + trustable -->
                    <div class="d-flex flex-column align-items-center justify-content-center" style="flex: 1;">
                        <Badge color={orientationColor(media.orientation)} class="mb-1">
                            {media.orientation}
                        </Badge>
                        <Badge color={trustableClass(media.trustable)}>
                            {media.trustable === "1" ? "Fiable" : media.trustable === "0" ? "Non fiable" : "?"}
                        </Badge>
                    </div>

                    <!-- Access -->
                    <div class="d-flex justify-content-end" style="flex: 1;">
                        <Badge color={accessClass(media.access)}>
                            {media.access}
                        </Badge>
                    </div>
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
        max-width: 50vw;
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        margin-top: 1rem;
    }

    .media-card {
        width: 100%;
        background-color: #f8f9fa;
        border-radius: 0.5rem;
        border: 1px solid #ccc;
        font-size: 1rem;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .media-card > div {
        flex: 1;
        min-width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .media-name {
        font-weight: bold;
    }

    .media-list-scrollable::-webkit-scrollbar {
        width: 10px;
    }

    .media-list-scrollable::-webkit-scrollbar-track {
        background: transparent;
    }

    .media-list-scrollable::-webkit-scrollbar-thumb {
        border-radius: 2vh;
        background: #555;
    }

    .media-list-scrollable::-webkit-scrollbar-thumb:hover {
        background: rgba(37, 36, 36, 0.822);
    }
</style>
