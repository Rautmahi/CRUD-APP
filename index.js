const express = require("express");
const cors=require("cors")
const { connection } = require("./config/db");
const { UserModel } = require("./models/UserModel");
const{BMIModel}=require("./models/BMIModel")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { authentication } = require("./middlewares/authentication");

require("dotenv").config()
const app = express();
app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Homepage");
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  // console.log(name,email,password)
  // res.send("signup data")

  const isUser = await UserModel.findOne({ email });

  if (isUser) {
    res.send({"msg":"User already exists,try log in"});
  }
  else
  {
  bcrypt.hash(password, 4, async function (err, hash) {
    if (err) {
      res.send({"msg" :"Something went wrong,please try again"});
    }
    const new_user = new UserModel({
      name,
      email,
      password: hash,
    });

    try {
      await new_user.save();
      res.send("Sign up Successfully");
    } catch (err) {
      res.send( {"msg":"Something went wrong,please try again"});
    }
  })
}
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  // console.log(user)
  const hashed_password = user.password;
  const user_id = user.id;
  // console.log(user_id)
  bcrypt.compare(password, hashed_password, function (err, result) {
    if (err) {
      res.send({"msg": "Something went Wrong"});
    }
    if (result) {
      const token = jwt.sign({ user_id }, process.env.SECRET_KEY);
      res.send({ "msg": "Login Successfull", token });
    } else {
      res.send({"msg": "Login Failed"});
    }
  });
});

app.get("/getprofile", authentication, (req, res) => {
  const { user_id } = req.body;
  const user = UserModel.findOne({ _id: user_id });
  const { name, email } = user;
  res.send({ name, email });
});

app.post("/calculateBMI", authentication, async (req, res) => {
  const { height, weight, user_id } = req.body;
  const height_in_metre = Number(height) * 0.3048;
  const BMI = Number(weight) / height_in_metre ** 2;
  const new_bmi = new BMIModel({
    BMI,
    height: height_in_metre,
    weight,
    user_id,
  });

  await new_bmi.save();
  res.send({ BMI });
});

app.get("/getCalculation", authentication, async (req, res) => {
  const { user_id } = req.body;

  const all_bmi = await BMIModel.find({ user_id: user_id });
  res.send({ history: all_bmi });
});

app.listen(8000, async () => {
  try {
    await connection;
    console.log("connection to db Successfully");
  } catch (err) {
    console.log("Error connecting to db");
    console.log(err);
  }
  console.log("Listening on port  8000");
});
