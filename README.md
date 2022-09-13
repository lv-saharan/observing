# observing
observe javascript object and notify modifications


## observe a object
``` javascript
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
const observedUser = observe(user, ({ path, oldVal, val }) => {
    console.log("user changed", path, oldVal, val)
})

//observe child object then 


const observedGrilFriend = observedUser.girlFriend


observe(observedGrilFriend, ({ path, oldVal, val }) => {
    console.log("girl friend changed", path, oldVal, val)

})

//proxy can use addCallbacks function  to add new callback！
observedGrilFriend.addCallbacks(({ path, oldVal, val }) => {
    console.log("proxy girl friend changed!!!", path, oldVal, val)

})

```
## unobserve
```
unobserve(observedUser)

//|or just remove some callbacks
 unobserve(callback1,callback2,...)
```
