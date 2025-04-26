<script>
  import { onMount } from "svelte";
  import { state } from "../stores/store";
  import DashBoard from "./subcomponent/DashBoard.svelte";
  import PrimaryAnimation from "./subcomponent/PrimaryAnimation.svelte";
  import CryptoDashboard from "./subcomponent/CryptoDashboard.svelte";
    import NavBar from "./subcomponent/NavBar.svelte";
    import Bourse from "./subcomponent/Bourse.svelte";

  onMount(() => {
    setTimeout(() => {
      state.set("dashboard");
    }, 4000);
  });
</script>

<main>
  {#if $state != "animation"}
  <NavBar />
  {/if}
  {#if $state === "animation"}
    <PrimaryAnimation />
  {:else if $state === "dashboard"}
    <DashBoard />
  {:else if $state === "cryptoDashboard"}
    <CryptoDashboard />
    {:else if $state === "bourse"}
    <Bourse />
  {/if}
</main>
