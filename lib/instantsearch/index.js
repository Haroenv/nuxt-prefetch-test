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
    methods: {
      hydrate(results) {
        this.instantSearchInstance.__initialSearchResults = results;

        this.instantSearchInstance.helper = helper;
        this.instantSearchInstance.mainHelper = helper;

        this.instantSearchInstance.mainIndex.init({
          instantSearchInstance: this.instantSearchInstance,
          parent: null,
          uiState: initialUiState,
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
          uiState: initialUiState,
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
            return results;
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
