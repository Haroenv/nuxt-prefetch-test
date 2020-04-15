<template>
  <div>
    <p>I'm container, my children are:</p>
    <slot></slot>
  </div>
</template>

<script>
export default {
  inject: {
    instantSearchInstance: {
      from: '$_ais_ssrInstantSearchInstance',
    },
  },
  provide() {
    return {
      $_ais_instantSearchInstance: this.instantSearchInstance,
    };
  },
};
</script>
