<template>
  <div class="widget">
    index {{ indexName }}
    <slot />
  </div>
</template>

<script>
import indexWidget from 'instantsearch.js/es/widgets/index/index';
import { createWidgetMixin } from './widgetMixin';

const connectIndex = () => indexWidget;

export default {
  props: {
    indexName: {
      type: String,
      required: true,
    },
    indexId: {
      type: String,
      required: false,
    },
  },
  mixins: [createWidgetMixin({ connector: connectIndex })],
  provide() {
    return {
      // The widget is created & registered by widgetMixin, accessor is needed
      // because provide is not reactive.
      $_ais_getParentIndex: () => this.widget,
    };
  },
  computed: {
    widgetParams() {
      return {
        indexName: this.indexName,
        indexId: this.indexId,
      };
    },
  },
};
</script>
