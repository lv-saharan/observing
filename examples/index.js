(() => {
  // src/symbols.js
  var proxySymbol = Symbol("observing-proxy");
  var setSymbol = Symbol("proxy-set");
  var delSymbol = Symbol("proxy-del");
  var wellKnownSymbols = Object.getOwnPropertyNames(Symbol).map((key2) => Symbol[key2]).filter((value) => typeof value === "symbol");

  // src/proxies.js
  var proxyMap = /* @__PURE__ */ new WeakMap();
  var rawMap = /* @__PURE__ */ new WeakMap();
  function getProxy(o) {
    return proxyMap.get(o) ?? {};
  }
  function setProxy(o, { proxy, handler }) {
    proxyMap.set(o, { proxy, handler });
    rawMap.set(proxy, { raw: o, handler });
  }
  function getRaw(proxy) {
    return rawMap.get(proxy) ?? {};
  }

  // src/callbacks.js
  var callbackMap = /* @__PURE__ */ new WeakMap();
  function addCallbackSet(cb, set) {
    let arr = callbackMap.get(cb);
    if (arr === void 0) {
      arr = [];
      callbackMap.set(cb, arr);
    }
    arr.push(set);
  }
  function getCallbackSets(cb) {
    return callbackMap.get(cb) ?? [];
  }

  // src/handler.js
  var Handler = class {
    #action = setSymbol;
    #callbacks;
    constructor(...callbacks) {
      this.#callbacks = /* @__PURE__ */ new Set();
      this.addCallbacks(...callbacks);
    }
    get callbacks() {
      return this.#callbacks;
    }
    addCallbacks(...callbacks) {
      callbacks.forEach((cb) => {
        if (!this.#callbacks.has(cb)) {
          this.#callbacks.add(cb);
          addCallbackSet(cb, this.#callbacks);
        }
      });
    }
    doCallbacks() {
      this.#callbacks.forEach((callback) => {
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
        let { proxy, handler } = getProxy(result);
        if (proxy === void 0) {
          handler = new Handler(...this.#callbacks);
          proxy = new Proxy(result, handler);
          setProxy(result, { proxy, handler });
        } else {
          handler.addCallbacks(...this.#callbacks);
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
    if (typeof o !== "object") {
    }
    if (o[proxySymbol] === true) {
      const { handler: handler2 } = getRaw(o);
      if (handler2) {
        handler2.addCallbacks(...callbacks);
      }
      return o;
    }
    let { proxy, handler } = getProxy(o);
    if (handler) {
      handler.addCallbacks(...callbacks);
    } else {
      const _handler = new Handler(...callbacks);
      proxy = new Proxy(o, _handler);
      setProxy(o, { proxy, handler: _handler });
    }
    return proxy;
  }
  function unobserve(o, ...callbacks) {
    if (callbacks.length === 0) {
      const { handler } = o[proxySymbol] === true ? getRaw(o) : getProxy(o);
      callbacks = (handler && handler.callbacks) ?? [];
    }
    callbacks.forEach((cb) => {
      const sets = getCallbackSets(cb);
      sets.forEach((set) => {
        set.delete(cb);
      });
    });
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
    observed2.a = 123;
    unobserve(observed);
  }, 2e3);
  observe(observed, () => {
    console.log("callback3 changed!", observed);
  });
  window.__o = observed;
  var observed2 = observe();
  observe(observed2, () => {
    console.log("eeeemmmtttpppyyy");
  });
})();
//# sourceMappingURL=index.js.map
