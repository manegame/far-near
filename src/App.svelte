<script lang="ts">
  import Counter from './lib/components/Counter.svelte'
  import './lib/web-components/Entry.svelte'
</script>

<main>
  <div class="card">
    <!-- Normal component -->
    <Counter />
    <!-- Web component -->
    <far-near-entry></far-near-entry>
  </div>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>