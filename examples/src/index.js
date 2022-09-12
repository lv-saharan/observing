import { observe } from '../../src/index.js'

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

}, 2000);



window.__o = observed



// let observedArr = observe([1, 3, 4, 6], () => {

//     console.log("callback3 changed!", observedArr)
// }, () => {
//     console.log("callback4 changed!", observedArr)

// })
// observedArr.push(7788)

