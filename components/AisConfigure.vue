<template>
  <div>
    <p>I'm the child.</p>
    <p>props: {{ JSON.stringify(hitsPerPage) }}</p>
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
