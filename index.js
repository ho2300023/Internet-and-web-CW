const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const authRouter = require('./routes/AuthRouter');
const garageRouter = require('./routes/GarageRouter');
const slotRouter = require('./routes/SlotRouter');
const path = require('path');

dotenv.config();
app.use(cors());


app.use(express.json());

const cookieParser = require('cookie-parser')
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/v1', garageRouter);
app.use('/v1', slotRouter);

app.use(express.static(path.join(__dirname, 'public')));

module.exports={app};
