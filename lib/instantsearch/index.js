import Vue from 'vue';
import renderToString from 'vue-server-renderer/basic';

import instantsearch from 'instantsearch.js/es';
import algoliaHelper from 'algoliasearch-helper';

function getId() {
  return (
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
}

function createFakeInstantSearch(args) {
  return {
    __id: getId(),
    widgets: [],
    addWidgets(widgets) {
      this.widgets.push(...widgets);
    },
    args,
  };
}

export const createServerRootMixin = instantSearchOptions => {
  // todo: more than just reading from initialUiState
  const { searchClient, indexName, initialUiState = {} } = instantSearchOptions;

  const helper = algoliaHelper(searchClient, indexName, {
    // parameters set by default
    highlightPreTag: '__ais-highlight__',
    highlightPostTag: '__/ais-highlight__',
  });

  return {
    provide() {
      return {
        $_ais_ssrInstantSearchInstance: this.instantSearchInstance,
      };
    },
    data() {
      return {
        instantSearchInstance: instantsearch(instantSearchOptions),
      };
    },
    serverPrefetch() {
      const app = new Vue(
        this.$vnode.componentOptions.Ctor.extend({
          name: 'ais-ssr-root-component',
        })
      );
      app.$options.serverPrefetch = [];

      const search = app.instantSearchInstance;

      search.helper = helper;
      search.mainHelper = helper;

      search.mainIndex.init({
        instantSearchInstance: search,
        parent: null,
        uiState: initialUiState,
      });

      return new Promise((resolve, reject) =>
        renderToString(app, (err, res) => {
          if (err) reject(err);
          resolve(res);
        })
      )
        .then(() => {
          const uiState = search.mainIndex.getWidgetState(initialUiState);

          const searchParameters = search.mainIndex.getWidgetSearchParameters(
            helper.state,
            { uiState }
          );

          console.log('serverPrefetch - searchParameters', searchParameters);
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
};
