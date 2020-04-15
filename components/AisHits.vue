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

export default {
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
  data() {
    return {
      state: undefined,
    };
  },
  computed: {
    widgetParams() {
      return {};
    },
  },
  created() {
    const parent = this.getParentIndex();

    const widget = connectHits((res, first) => {
      if (first) return;
      this.state = res;
    });

    parent.addWidgets([widget(this.widgetParams)]);
  },
};
</script>
