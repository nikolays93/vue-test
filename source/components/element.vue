<template>
  <div class="element">
    Im element
  </div>
</template>

<script>
    document.querySelector('body').classList.add('active');
</script>

<style lang="scss">
  body {
    background-color: #ccc;

    &.active {
      color: green;
    }
  }

  .element {
    color: red;
  }
</style>