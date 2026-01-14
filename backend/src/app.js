require('dotenv').config();
const cookieParser = require('cookie-parser');
const mongoose= require('mongoose');
const Painting = require('./models/image');
const session = require('express-session');
const {MongoStore} = require("connect-mongo");
const rateLimit = require("express-rate-limit");
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 8080;
const app = express();
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  }),
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));


const User = require("./models/user");
app.use(async (req, res, next) => {
  if (req.session.userId) {
    const user = await User.findById(req.session.userId).select("-password");
    res.locals.user = user;
  } else {
    res.locals.user = null;
  }
  next();
});
app.set('view engine', 'ejs');
app.set('views',path.resolve('./src/views'));
app.use(express.urlencoded({extended:false}));
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use(globalLimiter);
const Image = require("./models/image"); 
app.get("/", async (req, res) => {
  const images = await Image.find()
  .populate("userId", "fullName")
  .sort({ upvotes: -1, createdAt: -1 })
  .limit(20);
  res.render("home", {
    images,
    currentUser: req.session.userId
  });
});

mongoose.connect(process.env.MONGO_URI).
then((e)=>{console.log('MongoDB Connected')});

const userRoutes = require("./routes/user");
const paintingRoutes = require("./routes/painting");
app.use("/user", userRoutes);
app.use("/painting", paintingRoutes);
app.use(async (req, res, next) => {
  if (req.session.userId) {
    res.locals.user = await User.findById(req.session.userId);
  } else {
    res.locals.user = null;
  }
  next();
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`);
})