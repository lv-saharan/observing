const proxyMap = new WeakMap()
const rawMap = new WeakMap()

export function getProxy(o) {
    return proxyMap.get(o) ?? {}
}

export function setProxy(o, { proxy, handler }) {
    proxyMap.set(o, { proxy, handler })
    rawMap.set(proxy, { raw: o, handler })
}

export function getRaw(proxy) {
    return rawMap.get(proxy) ?? {}
}