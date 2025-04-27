// src/stores/stateStore.js
import { writable } from 'svelte/store';

// animation / dashboard
export const state = writable("animation");

// lang dashboard
export const lang = writable("fr");

// night mode (light/night)
export const mode = writable("light");

export const color = writable("");
export const cardColor = writable("");
export const InputColor = writable("");

// update front colors
function updateThemeColors(currentMode) {
    if (currentMode === "dark") {
        color.set("#f1f1f1");            // main text
        cardColor.set("#1e1e1e");        // bg card
        InputColor.set("#333333");       // bg input
    } else {
        color.set("#111111");
        cardColor.set("#ffffff");
        InputColor.set("#f0f0f0");
    }
}

mode.subscribe(updateThemeColors);