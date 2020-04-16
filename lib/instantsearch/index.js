import Vue from 'vue';
import _renderToString from 'vue-server-renderer/basic';

import instantsearch from 'instantsearch.js/es';
import algoliaHelper from 'algoliasearch-helper';
import { isIndexWidget } from 'instantsearch.js/es/widgets/index/index';

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

      return renderToString(app)
        .then(() => {
          // TODO: something makes initialUiState removed here
          const uiState = search.mainIndex.getWidgetState(initialUiState);

          console.log('prefetch - uiState', uiState);
          console.log('prefetch - initialUiState', search._initialUiState);

          return searchOnlyWithDerivedHelpers(helper);
        })
        .then(() => {
          const results = getLocalResults(app.instantSearchInstance.mainIndex);

          // TODO: better place for this, e.g. initialSearchResults?
          this.instantSearchInstance.__lastResults = results;

          this.instantSearchInstance.helper = helper;
          this.instantSearchInstance.mainHelper = helper;

          this.instantSearchInstance.mainIndex.init({
            instantSearchInstance: this.instantSearchInstance,
            parent: null,
            uiState: initialUiState,
          });
        });
    },
  };
};

function getLocalResults(indexWidget, results = {}) {
  results[indexWidget.getIndexId()] = indexWidget.getResults();

  return indexWidget
    .getWidgets()
    .filter(widget => isIndexWidget(widget))
    .reduce((results, widget) => {
      results[widget.getIndexId()] = widget.getResults();

      return getLocalResults(widget, results);
    }, results);
}

function renderToString(app) {
  return new Promise((resolve, reject) =>
    _renderToString(app, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  );
}

function searchOnlyWithDerivedHelpers(helper) {
  return new Promise((resolve, reject) => {
    helper.searchOnlyWithDerivedHelpers();

    helper.derivedHelpers[0].on('result', e => {
      resolve(e);
    });

    helper.derivedHelpers.forEach(derivedHelper =>
      derivedHelper.on('error', e => {
        reject(e);
      })
    );
  });
}
