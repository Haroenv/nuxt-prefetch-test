<template>
  <div>
    I'm the child
  </div>
</template>

<script>
export default {
  props: ['something'],
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
        something: this.something,
      };
    },
  },

  created() {
    console.log('child created');
    console.log('child created - widgetParams', this.widgetParams);

    const parent = this.getParentIndex();

    console.log('child created - instantSearchInstance', parent);

    parent.addWidgets([
      {
        $$type: 'ais.child',
        widgetParams: this.widgetParams,
      },
    ]);
  },
};
</script>
