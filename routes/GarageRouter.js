const express = require('express');
const { verifyToken } = require('../controllers/AuthController');
const {
    createGarage,
    getAllGarages,
    getGarageById,
    updateGarage,
    deleteGarage
} = require('../controllers/GarageController');

const garageRouter = express.Router();

//middleware admin verification
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

garageRouter.get('/garages', getAllGarages);
garageRouter.post('/garages', verifyToken, isAdmin, createGarage);
garageRouter.get('/garages/:garageId', getGarageById);
garageRouter.put('/garages/:garageId', verifyToken, isAdmin, updateGarage);
garageRouter.delete('/garages/:garageId', verifyToken, isAdmin, deleteGarage);

module.exports = garageRouter;
