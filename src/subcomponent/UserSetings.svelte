<script>
    import { Button, Input, FormGroup, Label } from "sveltestrap";
    import { color, cardColor, InputColor } from "../../stores/store";
    import { onDestroy } from "svelte";

    let activeSection = "Mode nuit";

    // Préférences
    let nightMode = false;
    let cookieDuration = "30";
    let apiKey = "";
    let rememberApiKey = false;

    let currentColor = "";
    let currentCardColor = "";
    let currentInputColor = "";

    const unsubColor = color.subscribe((value) => {
        currentColor = value;
    });
    const unsubCardColor = cardColor.subscribe((value) => {
        currentCardColor = value;
    });
    const unsubInputColor = InputColor.subscribe((value) => {
        currentInputColor = value;
    });

    const sections = ["Mode nuit", "Cookies", "API Key"];

    onDestroy(() => {
        unsubColor();
        unsubCardColor();
        unsubInputColor();
    });
</script>

<div
    class="d-flex p-4 rounded shadow"
    style="width: 80vw; height: 80vh; margin: auto; background-color: {currentCardColor}; color: {currentColor};transition:
      background-color 1s,
      color 0.3s;"
>
    <!-- Sidebar -->
    <div class="me-4 border-end pe-3" style="min-width: 160px;">
        {#each sections as section}
            <div
                class="mb-2 px-2 py-1 rounded cursor-pointer {activeSection ===
                section
                    ? 'bg-light fw-bold'
                    : ''}"
                role="button"
                on:click={() => (activeSection = section)}
            >
                {section}
            </div>
        {/each}
    </div>

    <!-- Content -->
    <div class="flex-grow-1">
        {#if activeSection === "Mode nuit"}
            <FormGroup check>
                <Label check>
                    <Input type="checkbox" bind:checked={nightMode} />
                    {" "}Activer le mode nuit
                </Label>
            </FormGroup>
        {/if}

        {#if activeSection === "Cookies"}
            <FormGroup>
                <Label for="cookieDuration"
                    >Durée de sauvegarde des cookies</Label
                >
                <div class="d-flex flex-column gap-2">
                    <input
                        type="radio"
                        id="cookie7"
                        name="cookie"
                        value="7"
                        bind:group={cookieDuration}
                        label="7 jours"
                    />
                    <input
                        type="radio"
                        id="cookie30"
                        name="cookie"
                        value="30"
                        bind:group={cookieDuration}
                        label="30 jours"
                    />
                    <input
                        type="radio"
                        id="cookie90"
                        name="cookie"
                        value="90"
                        bind:group={cookieDuration}
                        label="90 jours"
                    />
                </div>
            </FormGroup>
        {/if}

        {#if activeSection === "API Key"}
            <FormGroup>
                <Label for="apiKey">Votre clé API</Label>
                <Input
                    id="apiKey"
                    type="text"
                    placeholder="Entrez votre clé"
                    bind:value={apiKey}
                />
            </FormGroup>
            <FormGroup check class="mt-3">
                <Label check>
                    <Input type="checkbox" bind:checked={rememberApiKey} />
                    {" "}Garder cette clé en mémoire pendant 30 jours
                </Label>
            </FormGroup>
        {/if}
    </div>
</div>

<style>
    .cursor-pointer {
        cursor: pointer;
    }
</style>
