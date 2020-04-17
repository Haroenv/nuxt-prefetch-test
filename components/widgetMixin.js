import algoliaHelper from 'algoliasearch-helper';

export function createWidgetMixin({ connector }) {
  if (typeof connector !== 'function' && connector !== true) {
    throw new Error(
      'connector is required, if you only want to read, pass connector: true'
    );
  }

  return {
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
          return () => this.instantSearchInstance.mainIndex;
        },
      },
    },
    data() {
      return {
        state: undefined,
      };
    },
    created() {
      const parent = this.getParentIndex();

      const factory = connector((res, first) => {
        if (first) return;
        this.state = res;
      });

      this.widget = factory(this.widgetParams);

      parent.addWidgets([this.widget]);

      if (
        this.instantSearchInstance.__initialSearchResults &&
        !this.instantSearchInstance.started
      ) {
        const helper = parent.getHelper();

        // TODO: maybe move this code to index widget?
        let results = this.instantSearchInstance.__initialSearchResults[
          parent.getIndexId()
        ];

        // TODO: maybe test differently, this happens in a deserialized form on client
        if (results.constructor.name === 'Object') {
          results = new algoliaHelper.SearchResults(
            new algoliaHelper.SearchParameters(results._state),
            results._rawResults
          );
        }

        const state = results._state;

        // helper gets created in init, but that means it doesn't get the injected
        // parameters, because those are from the lastResults
        helper.state = state;

        // TODO: copied from index widget
        const createURL = nextState =>
          this.instantSearchInstance._createURL({
            [parent.getIndexId()]: parent
              .getWidgets()
              .filter(widget => !isIndexWidget(widget))
              .reduce((uiState, widget) => {
                if (!widget.getWidgetState) {
                  return uiState;
                }

                return widget.getWidgetState(uiState, {
                  searchParameters: nextState,
                  helper: helper,
                });
              }, {}),
          });

        this.widget.render({
          helper,
          results,
          state,
          templatesConfig: {},
          createURL,
          instantSearchInstance: this.instantSearchInstance,
          searchMetadata: {
            isSearchStalled: false,
          },
        });
      }
    },
  };
}
