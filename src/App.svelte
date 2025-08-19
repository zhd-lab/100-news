<script>
  import { onMount } from "svelte";
  import { state } from "../stores/store";
  import DashBoard from "./subcomponent/DashBoard.svelte";
  import PrimaryAnimation from "./subcomponent/PrimaryAnimation.svelte";
  import CryptoDashboard from "./subcomponent/CryptoDashboard.svelte";
  import NavBar from "./subcomponent/NavBar.svelte";
  import Bourse from "./subcomponent/Bourse.svelte";

  import 'bootstrap/dist/css/bootstrap.min.css';


  onMount(() => {
    setTimeout(() => {
      state.set("dashboard");
    }, 6000);
  });
</script>

<main>
  {#if $state === "animation"}
    <PrimaryAnimation />
  {:else if $state === "dashboard"}
    <DashBoard />
  {/if}
</main>
