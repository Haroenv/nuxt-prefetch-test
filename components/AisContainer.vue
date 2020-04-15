<template>
  <div>
    <p>I'm container, my children are:</p>
    <slot></slot>
  </div>
</template>

<script>
import Vue from 'vue';

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
  // ssr gets this injected
  // data() {
  //   return {
  //     instantSearchInstance: createFakeInstance(),
  //   };
  // },
};
</script>
