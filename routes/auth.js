const express = require('express');
const User = require('../models/User.js');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser.js');
const JWT_SECRET = process.env.JWT_SECRET;

// Route-1;  Create a user using: POSt "/api/auth/createuser" . No login require
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'password must be atleast 6 character').isLength({ min: 6 }),],
  async (req, res) => {
    let success = false;
    // If there are errors,  return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      // check wheather the user with this email exists already
      let user = await User.findOne({ success, email: req.body.email });
      if (user) {
        return res.status(400).json({ success, error: "sorry a user with this email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt)
      //create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass
      });
      const data = {
        user: {
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken })

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Internal server Error')
    }
  })

//  Route-2 Authenticate a user using: POSt "/api/auth/login" . No login require
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', "Password can't be blank").exists(),
], async (req, res) => {
  // If there are errors,  return bad request and the errors
  let success = false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success, error: "Please try to login with correct credentials" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false;
      return res.status(404).json({ success, error: "Please try to login with correct credentials" });
    }
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true
    res.json({ success, authtoken })
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal server Error')
  }
})

//  Route-3 Get loggedin user detailes using: POSt "/api/auth/getuser" . login require
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    userId = req.user.id
    const user = await User.findById(userId).select("-password");
    res.send(user)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal server Error')
  }
})

module.exports = router;