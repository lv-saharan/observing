import handler from "./handler"
import { proxySymbol } from "./symbols"
/**
 * observe will create a proxy as observer
 * @param {Object} o 
 * @returns 
 */
export function observe(o = {}, ...callbacks) {
    if (o[proxySymbol] === true) {
        return o
    }
    const observer = new Proxy(o, new handler(...callbacks))
    return observer
}

