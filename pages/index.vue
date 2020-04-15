<template>
  <div class="container">
    I am root.
    <AisContainer>
      <AisChild :something="dynamic" />
    </AisContainer>
  </div>
</template>

<script>
import AisContainer from '~/components/AisContainer.vue';
import AisChild from '~/components/AisChild.vue';

import { createServerRootMixin } from '../lib/instantsearch';

export default {
  mixins: [
    createServerRootMixin({
      indexName: 'hehe',
    }),
  ],
  components: {
    AisContainer,
    AisChild,
  },
  data() {
    return {
      dynamic: {
        yes: true,
      },
    };
  },
  serverPrefetch() {
    console.log(
      'my own server prefetch gets called twice, once without vnode from home-made app'
    );
  },
};
</script>
