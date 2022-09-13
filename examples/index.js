(() => {
  // src/symbols.js
  var proxySymbol = Symbol("observing-proxy");
  var getSymbol = Symbol("proxy-get");
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

  // src/handler.js
  var Handler = class {
    #action = getSymbol;
    #path;
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
    doCallbacks({ path, oldVal, val }) {
      this.#callbacks.forEach((callback) => {
        callback({ path, oldVal, val });
      });
    }
    deleteProperty(target, property) {
      const result = Reflect.deleteProperty(target, property);
      this.#action = delSymbol;
      return result;
    }
    get(target, property, receiver) {
      this.#action = getSymbol;
      if (property === proxySymbol) {
        return true;
      }
      if (property === "addCallbacks") {
        return this.addCallbacks.bind(this);
      }
      const result = Reflect.get(target, property, receiver);
      if (typeof property === "symbol" && wellKnownSymbols.includes(key)) {
        return result;
      }
      if (!this.#path)
        this.#path = /* @__PURE__ */ new Set();
      Promise.resolve().then(() => {
        this.#path = null;
      });
      if (target instanceof Array === false) {
        this.#path.add(property);
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
        handler.#path = this.#path;
        return proxy;
      }
      return result;
    }
    set(target, property, value, receiver) {
      const oldVal = Reflect.get(target, property, receiver);
      const result = Reflect.set(target, property, value, receiver);
      if (!(target instanceof Array && property === "length" && this.#action !== delSymbol)) {
        if (!this.#path)
          this.#path = /* @__PURE__ */ new Set();
        Promise.resolve().then(() => {
          this.#path = null;
        });
        this.#path.add(property);
        this.doCallbacks({ path: [...this.#path], oldVal, val: value });
      }
      this.#action = setSymbol;
      return result;
    }
  };

  // src/index.js
  function observe(o = {}, ...callbacks) {
    if (typeof o !== "object") {
      console.error("observe need a object");
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

  // examples/src/index.js
  var user = {
    name: "user",
    age: 18,
    likes: ["footboall", "video", "game"],
    girlFriend: {
      name: "sara",
      age: 17
    }
  };
  var observedUser = window.observedUser = observe(user, ({ path, oldVal, val }) => {
    console.log("user changed", path, oldVal, val);
  });
  var observedGrilFriend = window.observedGrilFriend = observedUser.girlFriend;
  observe(observedGrilFriend, ({ path, oldVal, val }) => {
    console.log("girl friend changed", path, oldVal, val);
  });
  observedGrilFriend.addCallbacks(({ path, oldVal, val }) => {
    console.log("proxy girl friend changed!!!", path, oldVal, val);
  });
})();
//# sourceMappingURL=index.js.map
