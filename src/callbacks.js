const callbackMap = new WeakMap()

export function addCallbackSet(cb, set) {
    let arr = callbackMap.get(cb)
    if (arr === undefined) {
        arr = []
        callbackMap.set(cb, arr)
    }
    arr.push(set)
}

export function getCallbackSets(cb) {
    return callbackMap.get(cb) ?? []
}