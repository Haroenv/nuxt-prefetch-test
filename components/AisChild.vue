<template>
  <div>
    <p>I'm the child.</p>
    <p>props: {{ JSON.stringify(hitsPerPage) }}</p>
  </div>
</template>

<script>
import { connectConfigure } from 'instantsearch.js/es/connectors';

export default {
  props: ['hitsPerPage'],
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
  computed: {
    widgetParams() {
      return {
        searchParameters: {
          hitsPerPage: this.hitsPerPage,
        },
      };
    },
  },

  created() {
    const parent = this.getParentIndex();

    const widget = connectConfigure();

    parent.addWidgets([widget(this.widgetParams)]);
  },
};
</script>
