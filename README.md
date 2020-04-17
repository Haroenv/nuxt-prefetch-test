# InstantSearch SSR from scratch

patches to make to InstantSearch.js:

1. <node_modules/instantsearch.js/es/lib/InstantSearch.js> (line 92)

```diff
    _defineProperty(_assertThisInitialized(_this), "scheduleSearch", defer(function () {
+      if (_this.started) {
        _this.mainHelper.search();
+      }
    }));
```

2. <node_modules/instantsearch.js/es/widgets/index/index.js> (line 315)

```diff
  helper.on('change', function (_ref4) {
    var state = _ref4.state;
+   if (!instantSearchInstance.started) {
+     return;
+   }
```
