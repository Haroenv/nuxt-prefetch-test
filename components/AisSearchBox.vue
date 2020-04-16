<template>
  <div class="widget" v-if="state">
    <p>search box</p>
    <input
      type="search"
      :value="state.query"
      @input="state.refine($event.target.value)"
    />
  </div>
</template>

<script>
import { connectSearchBox } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from './widgetMixin';

export default {
  mixins: [createWidgetMixin({ connector: connectSearchBox })],
  computed: {
    widgetParams() {
      return {};
    },
  },
};
</script>
