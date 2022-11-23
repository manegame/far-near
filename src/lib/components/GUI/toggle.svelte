<script>
  import { onTop } from "$lib/stores"

  const toggle = () => {
    const nextValue = $onTop === 'walk' ? 'map' : 'walk'
    onTop.set(nextValue)
  }
</script>

<button on:click={toggle}>
  Map
</button>
<button on:click={toggle}>
  Walk
</button>