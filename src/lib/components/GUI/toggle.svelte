<script>
  import { onTop } from "$lib/store"

  const toggle = () => {
    const nextValue = $onTop === 'walk' ? 'map' : 'walk'
    console.log(nextValue)
    onTop.set(nextValue)
  }
</script>

<button on:click={toggle}>
  Map
</button>
<button on:click={toggle}>
  Walk
</button>