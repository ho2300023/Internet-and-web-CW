const express= require('express');

const userRouter = express.Router();

// All user operations are handled through /auth endpoints
// Use POST /auth/signup to create new users
// Use POST /auth/login to authenticate users

module.exports = userRouter;

