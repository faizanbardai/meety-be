const express = require("express")
const User = require("../../model/auth")
const { basic, adminOnly, getToken } = require("../../helpers/auth");
const passport = require("passport");

const router = express.Router()

router.get("/", passport.authenticate("jwt"), async (req, res)=>{
    res.send(await User.find({}))
})

router.get("/:userId", passport.authenticate("jwt"), async (req, res)=>{
  res.send(await User.findById(req.params.id))
})

router.post("/signup", async(req, res)=>{
    try{
        const user = await User.register(req.body, req.body.password);
        const token = getToken({_id: user._id})
        res.send(
            {access_token: token,
                user: user}
        )
    }
    catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})

router.post("/login", passport.authenticate("local"), async (req, res) => {
    const token = await getToken({_id: req.user._id})
    res.send({
        acess_token: token,
        user: req.user
    })
})

router.post("/fblogin", passport.authenticate("fb"), async (req, res) => {
    const token = await getToken({_id: req.user._id})
    res.send({
        acess_token: token,
        user: req.user
    })
})


router.post("/refresh", passport.authenticate("jwt"), async(req, res)=>{
    const token = getToken({ _id: req.user._id })
    res.send({
        access_token: token,
        user: req.user
    })
})

router.get("/userinfo", passport.authenticate("jwt"), async (req, res)=>{
    res.send(req.user);
})

router.post("/changepassword", passport.authenticate("local"), async(req, res)=>{
    const user = await User.findById(req.user._id)
    const result = await user.setPassword(req.body.newPassword)
    user.save() // <= remember to save the object, since setPassword is not committing to the db
    res.send(result) 
}
)

module.exports = router;









/* const express = require("express");
const router = express.Router();
const Host = re

router.get("/:id", (req, res) => {
  res.send("Hi, I'm user route");
});

router.post("/login", (req, res) => {
  res.send("Hi, I'm user route");
});

router.post("/createAccount", (req, res) => {
  res.send("Hi, I'm user route");
});

router.put("/", (req, res) => {
  res.send("Hi, I'm user route");
});

router.delete("/", (req, res) => {
  res.send("Hi, I'm user route");
});

module.exports = router;
 */