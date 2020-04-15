<template>
  <div class="container">
    I am root.
    <AisContainer>
      <AisConfigure :hits-per-page="hpp" />
      <AisSearchBox />
      <AisHits />
      <AisIndex index-name="instant_search_rating_desc">
        <AisSearchBox />
        <AisHits />
      </AisIndex>
    </AisContainer>
  </div>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';

import AisContainer from '~/components/AisContainer.vue';
import AisConfigure from '~/components/AisConfigure.vue';
import AisSearchBox from '~/components/AisSearchBox.vue';
import AisIndex from '~/components/AisIndex.vue';
import AisHits from '~/components/AisHits.vue';

import { createServerRootMixin } from '../lib/instantsearch';

export default {
  mixins: [
    createServerRootMixin({
      indexName: 'instant_search',
      searchClient: algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      ),
    }),
  ],
  components: {
    AisContainer,
    AisConfigure,
    AisHits,
    AisSearchBox,
    AisIndex,
  },
  data() {
    return {
      hpp: 5,
    };
  },
  serverPrefetch() {
    console.log(
      'my own server prefetch gets called twice, once without vnode from home-made app'
    );
  },
};
</script>
