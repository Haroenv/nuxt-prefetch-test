import Vue from 'vue';
import _renderToString from 'vue-server-renderer/basic';

import instantsearch from 'instantsearch.js/es';
import algoliaHelper from 'algoliasearch-helper';
import { isIndexWidget } from 'instantsearch.js/es/widgets/index/index';

export const createServerRootMixin = instantSearchOptions => {
  // todo: more than just reading from initialUiState
  const { searchClient, indexName } = instantSearchOptions;

  const helper = algoliaHelper(searchClient, indexName, {
    // TODO: this might be needed when there's more than one hits component, not sure yet
    // parameters set by default
    // highlightPreTag: '__ais-highlight__',
    // highlightPostTag: '__/ais-highlight__',
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
    methods: {
      hydrate(results) {
        // TODO: either a real API or a different global
        this.instantSearchInstance.__initialSearchResults = results;

        this.instantSearchInstance.helper = helper;
        this.instantSearchInstance.mainHelper = helper;

        this.instantSearchInstance.mainIndex.init({
          instantSearchInstance: this.instantSearchInstance,
          parent: null,
          // TODO: make this public?
          uiState: this.instantSearchInstance._initialUiState,
        });
      },
      findResultState() {
        // this.$vnode.componentOptions.Ctor.options.fetch = () => {};
        // this.$vnode.componentOptions.Ctor.options.serverPrefetch = [];

        const extended = this.$vnode.componentOptions.Ctor.extend({
          name: 'ais-ssr-root-component',
        });

        // extended.options.fetch = undefined;
        // extended.options.serverPrefetch = undefined;
        // extended.options._fetchOnServer = false;
        // extended.superOptions = {};

        const app = new Vue(extended);

        app.$options.serverPrefetch = [];
        // app.$options.fetch = () => {};
        // app._fetchOnServer = false;
        // app.$options._base.__nuxt__fetch__mixin__ = false;
        // app.$options._fetchOnServer = false;

        const search = app.instantSearchInstance;

        search.helper = helper;
        search.mainHelper = helper;

        search.mainIndex.init({
          instantSearchInstance: search,
          parent: null,
          // TODO: public api?
          uiState: search._initialUiState,
        });

        return renderToString(app)
          .then(() => {
            return searchOnlyWithDerivedHelpers(helper);
          })
          .then(() => {
            let results = {};
            walkIndex(app.instantSearchInstance.mainIndex, widget => {
              results[widget.getIndexId()] = widget.getResults();
            });

            this.hydrate(results);

            // TODO: leaner serialization, we only need _rawResults & _state as json
            return Object.fromEntries(
              Object.entries(results).map(
                ([indexId, { _state, _rawResults }]) => {
                  return [
                    indexId,
                    {
                      __identifier: 'stringified',
                      _state: Object.fromEntries(Object.entries(_state)),
                      _rawResults,
                    },
                  ];
                }
              )
            );
          });
      },
    },
  };
};

function walkIndex(indexWidget, visit) {
  visit(indexWidget);

  return indexWidget.getWidgets().forEach(widget => {
    if (!isIndexWidget(widget)) return;
    visit(widget);
    return walkIndex(widget, visit);
  });
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
