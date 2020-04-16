<template>
  <div v-if="state">
    <p>hits</p>
    <ol>
      <li
        v-for="object in state.hits"
        :key="object.objectID"
      > {{ object.objectID }}</li>
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
