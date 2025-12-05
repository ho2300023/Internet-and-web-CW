const {db}= require('../db');

// Create a new user
const createUser = (req,res) => {

    const {
        id,
        name,
        email,
        role,
        username,
        password,
        passwordchanged,
        address,
        phonenumber,
        gender,
        country,
        city


    }=req.body;

if(!destinationName||!id||!name||!email||!role||!username||!password||
    !password||!passwordchanged||!address||!phonenumber||!gender||!country||!city)
{
return res.status(400).json({
    message:"All fields are required"});
}
const newUser={
    id:user.length + 1,
    name,
    email,
    role,
    username,
    password,
    passwordchanged,
    address,
    phonenumber,
    gender,
    country,
    city

};

user.push(newUser);

};


module.exports = {
    createUser,
};
