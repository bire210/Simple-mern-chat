const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

    try {
       const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
       res.status(200).json({
        success: true,
        users: users,
       });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      })
    }
 
}

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = async (req, res) => {
  const { name, email, password, pic } = req.body;

  console.log("*******************",req.body)
  if (!name || !email || !password) {
    res.status(404);
     throw new Error( "Please fill all the fields");
    
  }
  try {
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(409);
    throw new Error("User already exists");
  }
 const user = await User.create({
    name,
    email,
    password,
    pic,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(500);
    throw new Error("Something went wrong")
  }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
 

 
};

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = async (req, res) => {
  try {
     const { email, password } = req.body;
     const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(404);
    throw new Error("Invalid Email or Password");
  }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }


 




  

 
};

module.exports = { allUsers, registerUser, authUser };
