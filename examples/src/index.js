import { observe,unobserve } from '../../src/index.js'

let raw = {
    a: 1,
    b: 2,
    c: 3,
    d: [1, 2, 3]
}

let observed = observe(raw, () => {

    console.log("callback1 changed!", observed)
}, () => {
    console.log("callback2 changed!", observed)

})

setTimeout(() => {
    observed.a++
    observed2.a = 123
    unobserve(observed)
}, 2000);

observe(observed, () => {
    console.log("callback3 changed!", observed)

})

window.__o = observed


let observed2 = observe()

observe(observed2, () => {
    console.log("eeeemmmtttpppyyy")
})
// let observedArr = observe([1, 3, 4, 6], () => {

//     console.log("callback3 changed!", observedArr)
// }, () => {
//     console.log("callback4 changed!", observedArr)

// })
// observedArr.push(7788)

