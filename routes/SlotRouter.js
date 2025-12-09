const express = require('express');
const { verifyToken } = require('../controllers/authController');
const {
    getAllSlots,
    getSlotById,
    updateSlotStatus,
    bookSlot,
    createSlot
} = require('../controllers/SlotController');

const slotRouter = express.Router();
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

slotRouter.get('/garages/:garageId/slots', getAllSlots);
slotRouter.post('/garages/:garageId/slots', verifyToken, isAdmin, createSlot);
slotRouter.get('/garages/:garageId/slots/:slotId', getSlotById);
slotRouter.post('/garages/:garageId/slots/:slotId/book', verifyToken, bookSlot);
slotRouter.put('/garages/:garageId/slots/:slotId/status', verifyToken, isAdmin, updateSlotStatus);

module.exports =
 slotRouter;
