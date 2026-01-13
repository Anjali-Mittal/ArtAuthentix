const {Router} = require('express');
const {authLimiter} = require('../middleware/rateLimit');
const router = Router();
const User = require('../models/user');

router.get('/signup',(req,res)=>{
    return res.render('signUp', {error: null})
});

router.get('/signin',(req,res)=>{
    return res.render('signIn', {error: null})
});

router.post("/signup", authLimiter, async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", { error: "Email already exists" });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    // create session
    req.session.userId = user._id;
    res.redirect("/");
  } catch (err) {
    res.render("signup", { error: "Something went wrong" });
  }
});


router.post('/signin', authLimiter, async (req,res)=>{
  const {email,password} = req.body;
  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.render("signin", { error: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render("signin", { error: "Invalid credentials" });
    }
    // create session
    req.session.userId = user._id;
    console.log('Sign in successful');
    res.redirect('/');
  }catch (error) {
    console.error('Sign in error:', error.message);
    return res.render("signIn", {
      error: "Incorrect Email or Password",
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// delete account
router.delete("/:id", async (req, res) => {
  try {
    // only allow deleting your own account
    if (!req.session.userId || req.session.userId !== req.params.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await User.findByIdAndDelete(req.params.id);

    // destroy session
    req.session.destroy(() => {
      res.json({ message: "Account deleted successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});


module.exports = router;