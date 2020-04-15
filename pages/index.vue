<template>
  <div class="container">
    I am root.
    <AisContainer>
      <AisChild :something="dynamic" />
    </AisContainer>
  </div>
</template>

<script>
import Vue from 'vue';
import renderToString from 'vue-server-renderer/basic';

import AisContainer from '~/components/AisContainer.vue';
import AisChild from '~/components/AisChild.vue';

import createInstantSearch from '~/components/createInstantSearch';

let counter = 0;

export default {
  components: {
    AisContainer,
    AisChild,
  },
  provide() {
    return {
      $_ais_ssrInstantSearchInstance: this.instantSearchInstance,
    };
  },
  data() {
    return {
      instantSearchInstance: createInstantSearch(),
      dynamic: {
        yes: true,
      },
    };
  },
  serverPrefetch() {
    counter++;
    // TODO: why is this called twice, but the rest isn't?
    console.log('serverPrefetch - starts', counter);

    const app = new Vue(
      this.$vnode.componentOptions.Ctor.extend({
        name: 'ais-ssr-root-component',
        serverPrefetch() {
          // TODO: this doesn't work, but oddly isn't needed?
          console.log('serverPrefetch - overriden');
        },
      })
    );

    return new Promise((resolve, reject) =>
      renderToString(app, (err, res) => {
        if (err) reject(err);
        resolve(res);
      })
    )
      .then(res => {
        console.log('serverPrefetch - result', res);
        console.log(
          'serverPrefetch - instantSearchInstance',
          app.instantSearchInstance
        );
        console.log(
          'serverPrefetch - widgets',
          app.instantSearchInstance.widgets
        );
      })
      .then(() => {
        console.log(
          'serverPrefetch - TODO',
          "actually search here, but that's irrelevant for now"
        );
        console.log('serverPrefetch - done');
        console.log('---------------------');
      });
  },
};
</script>
