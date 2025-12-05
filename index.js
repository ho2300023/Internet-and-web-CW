const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const authRouter = require('./routes/AuthRouter');
const UserRouter = require('./routes/UserRouter');
const path = require('path');

dotenv.config();
app.use(cors());


app.use(express.json());

const cookieParser = require('cookie-parser')
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/users', UserRouter);

app.use(express.static(path.join(__dirname, 'public')));

module.exports={app};
