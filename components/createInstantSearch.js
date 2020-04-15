export default function createFakeInstance() {
  return {
    __id:
      '_' +
      Math.random()
        .toString(36)
        .substr(2, 9),
    widgets: [],
    addWidgets(widgets) {
      console.log('instantsearch - addWidgets', widgets);
      this.widgets.push(...widgets);
      console.log('instantsearch - this.widgets', this.widgets);
    },
  };
}
