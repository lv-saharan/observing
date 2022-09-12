import Handler from "./handler"
import { getProxy, setProxy, getRaw } from "./proxies"
import { proxySymbol } from "./symbols"
import { getCallbackSets } from "./callbacks"
/**
 * observe will create a proxy as observer
 * @param {Object} o 
 * @returns 
 */
export function observe(o = {}, ...callbacks) {
    if (typeof o !== "object") {

    }
    if (o[proxySymbol] === true) {
        const { handler } = getRaw(o)
        if (handler) {
            handler.addCallbacks(...callbacks)
        }
        return o
    }

    let { proxy, handler } = getProxy(o)
    if (handler) {
        handler.addCallbacks(...callbacks)
    } else {
        const _handler = new Handler(...callbacks)
        proxy = new Proxy(o, _handler)
        setProxy(o, { proxy, handler: _handler })
    }


    return proxy
}


export function unobserve(o, ...callbacks) {
    if (callbacks.length === 0) {
        const { handler } = o[proxySymbol] === true ? getRaw(o) : getProxy(o)
        callbacks = (handler && handler.callbacks) ?? []
    }
    callbacks.forEach(cb => {
        const sets = getCallbackSets(cb)
        sets.forEach(set => {
            set.delete(cb)
        })
    })
}