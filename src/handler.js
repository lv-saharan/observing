import { proxySymbol, wellKnownSymbols, setSymbol, delSymbol } from "./symbols"

const proxyMap = new WeakMap()
 
export default class {
    #action = setSymbol
    constructor(...callbacks) {
        this.callbacks = callbacks
    }
    doCallbacks() {
        this.callbacks.forEach(callback => {
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
            let proxy = proxyMap.get(result)
            if (proxy === undefined) {
                proxy = new Proxy(result, this)
                proxyMap.set(result, proxy)
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