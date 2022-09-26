import { proxySymbol, wellKnownSymbols, getSymbol, setSymbol, delSymbol } from "./symbols"
import { getProxy, setProxy } from "./proxies"
import { addCallbackSet } from "./callbacks"

export default class Handler {
    #action = getSymbol
    #path
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
    doCallbacks({ path, oldVal, val }) {
        this.#callbacks.forEach(callback => {
            callback({ path, oldVal, val })
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
    // has(target, property) {
    //     return Reflect.has(target, property)
    // }
    // ownKeys(target) {
    //     return Reflect.ownKeys(target);
    // }
    deleteProperty(target, property) {
        const result = Reflect.deleteProperty(target, property)
        this.#action = delSymbol
        return result
    }
    get(target, property, receiver) {
        this.#action = getSymbol
        if (property === proxySymbol) {
            return true
        }
        if (property === "addCallbacks") {
            return this.addCallbacks.bind(this)
        }
        const result = Reflect.get(target, property, receiver)
        if (typeof property === 'symbol' && wellKnownSymbols.includes(property)) {
            return result
        }

        if (!this.#path) this.#path = new Set()
        //下一次访问之前清除
        Promise.resolve().then(() => {
            this.#path = null
        })
        if (target instanceof Array === false) {
            this.#path.add(property)
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
            handler.#path = this.#path
            return proxy
        }
        return result;
    }

    set(target, property, value, receiver) {
        const oldVal = Reflect.get(target, property, receiver)
        const result = Reflect.set(target, property, value, receiver)
        if (!(target instanceof Array && property === "length" && this.#action !== delSymbol)) {
            if (!this.#path) this.#path = new Set()
            //下一次访问之前清除
            Promise.resolve().then(() => {
                this.#path = null
            })
            this.#path.add(property)
            this.doCallbacks({ path: [...this.#path], oldVal, val: value })
        }
        this.#action = setSymbol
        return result
    }
}