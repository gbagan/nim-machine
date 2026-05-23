<script lang="ts">
  let {title, children} = $props();
</script>

<div class="card">
  <div class="title">{title}</div>
  {@render children()}
</div>

<style>
  .card {
    border-radius: 0.25rem;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    padding: 1rem;
  }

  .title {
    font-weight: 700;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
</style>