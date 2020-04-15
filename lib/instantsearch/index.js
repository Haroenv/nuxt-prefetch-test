import Vue from 'vue';
import renderToString from 'vue-server-renderer/basic';

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

export const createServerRootMixin = instantSearchArguments => ({
  provide() {
    return {
      $_ais_ssrInstantSearchInstance: this.instantSearchInstance,
    };
  },
  data() {
    return {
      instantSearchInstance: createFakeInstantSearch(instantSearchArguments),
    };
  },
  serverPrefetch() {
    if (
      this.$vnode == undefined ||
      this.$options.name === 'ais-ssr-root-component'
    ) {
      return;
    }

    const app = new Vue(
      this.$vnode.componentOptions.Ctor.extend({
        name: 'ais-ssr-root-component',
      })
    );

    return new Promise((resolve, reject) =>
      renderToString(app, (err, res) => {
        if (err) reject(err);
        resolve(res);
      })
    )
      .then(() => {
        console.log('serverPrefetch', app.instantSearchInstance);
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
});
