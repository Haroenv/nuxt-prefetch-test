<template>
  <div>
    je suis index {{ indexName }}
    <slot />
  </div>
</template>

<script>
import indexWidget from 'instantsearch.js/es/widgets/index/index';

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
  inject: {
    instantSearchInstance: {
      from: '$_ais_instantSearchInstance',
      default() {
        const tag = this.$options._componentTag;
        throw new TypeError(
          `It looks like you forgot to wrap your Algolia search component "<${tag}>" inside of an "<ais-instant-search>" component.`
        );
      },
    },
    getParentIndex: {
      from: '$_ais_getParentIndex',
      default() {
        return () => this.instantSearchInstance;
      },
    },
  },
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
  created() {
    const parent = this.getParentIndex();

    this.widget = connectIndex();

    parent.addWidgets([this.widget(this.widgetParams)]);
  },
};
</script>
