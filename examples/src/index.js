import { observe, unobserve } from '../../src/index.js'

let user = {
    name: "user",
    age: 18,
    likes: ["footboall", "video", "game"],
    girlFriend: {
        name: "sara",
        age: 17
    }
}
//root observed
const observedUser = window.observedUser = observe(user, ({ path, oldVal, val }) => {
    console.log("user changed", path, oldVal, val)
})

const observedGrilFriend = window.observedGrilFriend = observedUser.girlFriend

observe(observedGrilFriend, ({ path, oldVal, val }) => {
    console.log("girl friend changed", path, oldVal, val)

})

observedGrilFriend.addCallbacks(({ path, oldVal, val }) => {
    console.log("proxy girl friend changed!!!", path, oldVal, val)

})