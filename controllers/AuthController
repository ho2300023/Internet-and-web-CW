const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db');

//sign in with token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '10m' });
};

// token verify middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).send('Access denied: Token missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid or expired token');
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  });
};

// signup
const signUp = (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const phonenumber = req.body.phonenumber;
  const disability = req.body.disability;
  const role = req.body.role || 'user';

  if (!email || !password) {
    return res.status(400).send('Please provide email, and password.');
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error hashing password.');
    }

    //add user to the database
    const query = `INSERT INTO USER (NAME, EMAIL, ROLE, PASSWORD, PHONENUMBER, DISABILITY) 
    VALUES (?, ?, ?, ?, ?, ?);`;

    const params = [name, email, role, hashedPassword, phonenumber, disability];

    db.run(query, params, function(err) {
      if (err) {
        // Handle unique constraint violation
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).send('Email already exists.');
        }
        console.error(err);
        return res.status(500).send('Database error.');
      }

      // Create token
      const token = signToken(this.lastID, role);
      return res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        token,
      });
    });
  });
};

const getMe = (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.json({ user: null });

  try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
db.get(
  "SELECT  * FROM USER WHERE ID = ?",
  [decoded.id],
  (err, user) => {
    if (err || !user) return res.json({ user: null });
    return res.json({ user });

    }
  );
  } catch {
    return res.json({ user: null });
  }
};



const login = (req, res) => {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).send('Please provide email and password. ');
    }
    const query = `SELECT * FROM USER WHERE EMAIL=?`
    db.get(query, [email], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Database error')
        }
        bcrypt.compare(password, row.PASSWORD, (err, isMatch) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error verifying password. ')
        }         
        const token = signToken(row.ID, row.ROLE);
        
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: row.ID,
                name: row.NAME,
                email: row.EMAIL,
                role: row.ROLE,
                phonenumber: row.PHONENUMBER,
                disability: row.DISABILITY,
            },
            token,
        });
        });
    });
};

module.exports={
    login,
    signUp,
    verifyToken,
    getMe,
    
};
