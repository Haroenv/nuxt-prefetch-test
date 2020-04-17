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

      // todo: also during hydration
      const isHydrating =
        this.instantSearchInstance.hydrating &&
        !this.instantSearchInstance.started; // should be hydrated && !started
      if (
        (this.$isServer || isHydrating) &&
        this.instantSearchInstance.__initialSearchResults
      ) {
        const helper = parent.getHelper();

        // todo: move this code to index widget probably
        const results = this.instantSearchInstance.__initialSearchResults[
          parent.getIndexId()
        ];

        // if (!results) {
        //   // TODO: can't happen, but throw error in the future
        //   return
        // }

        const state = results._state;

        // helper gets created in init, but that means it doesn't get the injected
        // parameters, because those are from the lastResults
        helper.state = state;

        // console.log('widget', this.widget);

        this.widget.render({
          helper,
          results,
          state,
          templatesConfig: {},
          // TODO: use memory or real router
          createURL: () => '#',
          instantSearchInstance: this.instantSearchInstance,
          searchMetadata: {
            isSearchStalled: false,
          },
        });
      }
    },
  };
}
