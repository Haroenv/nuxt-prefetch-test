<template>
  <div
    class="widget"
    v-if="state"
  >
    <p>hits</p>
    <ol>
      <li
        v-for="hit in state.hits"
        :key="hit.objectID"
      >
        {{ hit.objectID }} <img :src="hit.image" />
      </li>
    </ol>
  </div>
</template>

<script>
import { connectHits } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from './widgetMixin';

export default {
  mixins: [createWidgetMixin({ connector: connectHits })],
  computed: {
    widgetParams() {
      return {};
    },
  },
};
</script>

<style scoped>
img {
  height: 1em;
}
</style>
