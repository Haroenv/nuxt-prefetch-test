<template>
  <div
    class="widget"
    v-if="state"
  >
    <pre>configure: {{ JSON.stringify(widgetParams.searchParameters, null, 2) }}</pre>
  </div>
</template>

<script>
import { connectConfigure } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from './widgetMixin';

export default {
  mixins: [createWidgetMixin({ connector: connectConfigure })],
  props: ['hitsPerPage'],
  computed: {
    widgetParams() {
      return {
        searchParameters: {
          hitsPerPage: this.hitsPerPage,
        },
      };
    },
  },
};
</script>
