<template>
  <div class="container">
    I am root.
    <AisInstantSearch>
      <AisConfigure :hits-per-page="hpp" />
      <AisSearchBox />
      <AisHits />

      <AisIndex
        index-name="instant_search_demo_query_suggestions"
        index-id="merger"
      >
        <AisHits />
      </AisIndex>
      <AisIndex
        index-name="instant_search_demo_query_suggestions"
        index-id="overrider"
      >
        <AisSearchBox />
        <AisHits />
      </AisIndex>
    </AisInstantSearch>
  </div>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';

import AisInstantSearch from '~/components/AisInstantSearch.vue';
import AisConfigure from '~/components/AisConfigure.vue';
import AisSearchBox from '~/components/AisSearchBox.vue';
import AisIndex from '~/components/AisIndex.vue';
import AisHits from '~/components/AisHits.vue';

import qs from 'qs';

import { createServerRootMixin } from '../lib/instantsearch';

// TODO: read the component's this in arguments to server root mixin somehow
// maybe need to make it a known "this" key which is read in the mixin body, and
// no longer a mixin factory?
let _this = undefined;

export default {
  mixins: [
    createServerRootMixin({
      indexName: 'instant_search',
      searchClient: algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      ),
      routing: {
        router: {
          read() {
            if (!_this.$nuxt) {
              // TODO: can this happen?
              console.log('nuxt had a failure');
              return {};
            }

            const url = _this.$nuxt.context.route.fullPath;
            const search = url.slice(url.indexOf('?'));

            return qs.parse(search, {
              ignoreQueryPrefix: true,
            });
          },
          write(routeState) {
            const query = qs.stringify(routeState, {
              addQueryPrefix: true,
            });

            // TODO: maybe use nuxt, although it doesn't matter much
            history.pushState(routeState, null, query);
          },
          createURL() {
            const query = qs.stringify(routeState, {
              addQueryPrefix: true,
            });

            return query;
          },
          onUpdate(callback) {
            // TODO: handle vue route changes
            this._onPopState = event => {
              if (this.writeTimer) {
                window.clearTimeout(this.writeTimer);
                this.writeTimer = undefined;
              }

              const routeState = event.state;

              // At initial load, the state is read from the URL without update.
              // Therefore the state object is not available.
              // In this case, we fallback and read the URL.
              if (!routeState) {
                callback(this.read());
              } else {
                callback(routeState);
              }
            };

            window.addEventListener('popstate', this._onPopState);
          },
          dispose() {
            if (this._onPopState) {
              window.removeEventListener('popstate', this._onPopState);
            }

            // we purposely don't write on dispose, to prevent double entries on navigation
            // TODO: this should be an option in the real router
          },
        },
      },
      initialUiState: {
        instant_search: {
          query: 'amazon',
        },
        overrider: {
          query: 'q',
        },
      },
    }),
  ],
  components: {
    AisInstantSearch,
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
  // TODO: this is needed because mixin factory arguments don't have this
  beforeCreate() {
    _this = this;
  },
  beforeMount() {
    const results = this.$nuxt.context.nuxtState.algoliaState;

    this.hydrate(results);
  },
  serverPrefetch() {
    return this.findResultState().then(algoliaState => {
      this.$ssrContext.nuxt.algoliaState = algoliaState;
    });
  },
  // fetch() {
  //   this.hpp = 10;
  // },
};
</script>

<style>
.widget {
  border: 1px solid black;
  padding: 0.5em;
  margin: 1em;
}
</style>
