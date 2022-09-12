import { proxySymbol, wellKnownSymbols, setSymbol, delSymbol } from "./symbols"
import { getProxy, setProxy } from "./proxies"
import { addCallbackSet } from "./callbacks"

export default class Handler {
    #action = setSymbol
    #callbacks // use Set
    constructor(...callbacks) {
        this.#callbacks = new Set()
        this.addCallbacks(...callbacks)

    }
    get callbacks() {
        return this.#callbacks
    }
    addCallbacks(...callbacks) {
        callbacks.forEach(cb => {
            if (!this.#callbacks.has(cb)) {
                this.#callbacks.add(cb)
                addCallbackSet(cb, this.#callbacks)
            }
        })
    }
    doCallbacks() {
        this.#callbacks.forEach(callback => {
            callback()
        })
    }
    // construct(target, args) {
    //     return new target(...args);
    // }
    // defineProperty(target, property, descriptor) {
    //     const result = Reflect.defineProperty(target, property, descriptor)
    //     // this.doCallbacks()
    //     return result
    // }
    deleteProperty(target, property) {
        const result = Reflect.deleteProperty(target, property)
        this.#action = delSymbol
        return result
    }
    get(target, property, receiver) {
        if (property === proxySymbol) {
            return true
        }
        const result = Reflect.get(target, property, receiver)
        if (typeof property === 'symbol' && wellKnownSymbols.includes(key)) {
            return result
        }

        if (typeof result === "object") {
            let { proxy, handler } = getProxy(result)
            if (proxy === undefined) {
                handler = new Handler(...this.#callbacks)
                proxy = new Proxy(result, handler)
                setProxy(result, { proxy, handler })
            } else {
                handler.addCallbacks(...this.#callbacks)
            }
            return proxy
        }
        return result;
    }
    has(target, property) {
        return Reflect.has(target, property)
    }
    ownKeys(target) {
        return Reflect.ownKeys(target);
    }
    set(target, property, value, receiver) {
        const result = Reflect.set(target, property, value, receiver)
        if (target instanceof Array && property === "length" && this.#action !== delSymbol) {
            return result
        }
        this.doCallbacks()
        this.#action = setSymbol
        return result
    }
}