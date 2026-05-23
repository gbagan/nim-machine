<script lang="ts">
  type Props = {
    victories: number;
    losses: number;
  }

  let { victories, losses }: Props = $props();
</script>

<div class="container">
  <span class="victories">Victoires: {victories}</span>
  <div class="losses-bar">
    <div
      class="victories-bar"
      style:width={victories + losses === 0 ? "50%" : `${100 * victories / (victories + losses)}%`}
    ></div>
  </div>
  <span class="losses">Défaites: {losses}</span>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  } 

  .victories {
    font-weight: bold;
    color: var(--blue-600);
  }

  .losses {
    font-weight: bold;
    color: var(--red-600);
  }

  .losses-bar {
    width: 100%;
    height: 1.5rem;
    background-color: var(--red-600);
    border-radius: 9999px;
  }

  .victories-bar {
    height: 1.5rem;
    background-color: var(--blue-600);
    border-radius: 9999px 0 0 9999px;
  }

</style>