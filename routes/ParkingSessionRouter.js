const express = require('express');
const { verifyToken } = require('../controllers/authController');
const {
  getGarageAvailability,
  getUserParkingInfo,
  endParkingSession
} = require('../controllers/ParkingSessionController');

const parkingSessionRouter = express.Router();
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};
parkingSessionRouter.get('/garages/:garageId/availability', verifyToken, getGarageAvailability);
parkingSessionRouter.get('/garages/:garageId/user/:userId', verifyToken, getUserParkingInfo);
parkingSessionRouter.post('/garages/:garageId/end', verifyToken, isAdmin, endParkingSession);

module.exports = parkingSessionRouter;
