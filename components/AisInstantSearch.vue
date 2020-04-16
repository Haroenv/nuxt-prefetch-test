<template>
  <div>
    <p>I'm container, my children are:</p>
    <slot />
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
  mounted() {
    // from the documentation: https://vuejs.org/v2/api/#mounted
    // "Note that mounted does not guarantee that all child components have also been mounted. If you want to
    // wait until the entire view has been rendered, you can use vm.$nextTick inside of mounted"
    this.$nextTick(() => {
      if (!this.instantSearchInstance.started) {
        this.instantSearchInstance.start();
      }
    });
  },
};
</script>
