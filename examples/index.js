(() => {
  // src/symbols.js
  var proxySymbol = Symbol("observing-proxy");
  var setSymbol = Symbol("proxy-set");
  var delSymbol = Symbol("proxy-del");
  var wellKnownSymbols = Object.getOwnPropertyNames(Symbol).map((key2) => Symbol[key2]).filter((value) => typeof value === "symbol");

  // src/handler.js
  var proxyMap = /* @__PURE__ */ new WeakMap();
  var handler_default = class {
    #action = setSymbol;
    constructor(...callbacks) {
      this.callbacks = callbacks;
    }
    doCallbacks() {
      this.callbacks.forEach((callback) => {
        callback();
      });
    }
    deleteProperty(target, property) {
      const result = Reflect.deleteProperty(target, property);
      this.#action = delSymbol;
      return result;
    }
    get(target, property, receiver) {
      if (property === proxySymbol) {
        return true;
      }
      const result = Reflect.get(target, property, receiver);
      if (typeof property === "symbol" && wellKnownSymbols.includes(key)) {
        return result;
      }
      if (typeof result === "object") {
        let proxy = proxyMap.get(result);
        if (proxy === void 0) {
          proxy = new Proxy(result, this);
          proxyMap.set(result, proxy);
        }
        return proxy;
      }
      return result;
    }
    has(target, property) {
      return Reflect.has(target, property);
    }
    ownKeys(target) {
      return Reflect.ownKeys(target);
    }
    set(target, property, value, receiver) {
      const result = Reflect.set(target, property, value, receiver);
      if (target instanceof Array && property === "length" && this.#action !== delSymbol) {
        return result;
      }
      this.doCallbacks();
      this.#action = setSymbol;
      return result;
    }
  };

  // src/index.js
  function observe(o = {}, ...callbacks) {
    if (o[proxySymbol] === true) {
      return o;
    }
    const observer = new Proxy(o, new handler_default(...callbacks));
    return observer;
  }

  // examples/src/index.js
  var raw = {
    a: 1,
    b: 2,
    c: 3,
    d: [1, 2, 3]
  };
  var observed = observe(raw, () => {
    console.log("callback1 changed!", observed);
  }, () => {
    console.log("callback2 changed!", observed);
  });
  setTimeout(() => {
    observed.a++;
  }, 2e3);
  window.__o = observed;
})();
//# sourceMappingURL=index.js.map
