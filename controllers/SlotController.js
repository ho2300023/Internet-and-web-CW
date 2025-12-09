const { db } = require('../db');

const getAllSlots = (req, res) => {
    const { garageId } = req.params;
    const query = `
        SELECT 
        PARKINGSLOTS.SLOTID as slot_id,
        PARKINGSLOTS.GARAGEID as garage_id,
        PARKINGSLOTS.AVAILABILITY as status,
        PARKINGSLOTS.USERID as assigned_user,
        PARKINGSLOTS.TIMEPARKED as time_parked
        FROM PARKINGSLOTS
        WHERE PARKINGSLOTS.GARAGEID = ?`;
    db.all(query, [garageId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        const slots = rows.map(row => ({
            slot_id: row.slot_id,
            status: row.status,
            assigned_user: row.assigned_user,
            time_parked: row.time_parked
        }));

        return res.status(200).json(slots);
    });
};

//get slot info by id
const getSlotById = (req, res) => {
    const { garageId, slotId } = req.params;
    const query = 
           `SELECT 
            PARKINGSLOTS.SLOTID as slot_id,
            PARKINGSLOTS.GARAGEID as garage_id,
            PARKINGSLOTS.AVAILABILITY as status,
            PARKINGSLOTS.USERID as assigned_user,
            PARKINGSLOTS.TIMEPARKED as time_parked
            FROM PARKINGSLOTS
            WHERE PARKINGSLOTS.GARAGEID = ? AND PARKINGSLOTS.SLOTID = ?
    `;
    
    db.get(query, [garageId, slotId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        return res.status(200).json({
            slot_id: row.slot_id,
            garage_id: row.garage_id,
            status: row.status,
            assigned_user: row.assigned_user,
            time_parked: row.time_parked
        });
    });
};

const updateSlotStatus = (req, res) => {
    const { garageId, slotId } = req.params;
    const { status } = req.body;

    if (!status || !['empty', 'occupied'].includes(status)) {
        return res.status(400).json({ error: 'Status must be either "empty" or "occupied"' });
    }

    const query = `UPDATE PARKINGSLOTS SET AVAILABILITY = ? WHERE GARAGEID = ? AND SLOTID = ?`;
    
    db.run(query, [status, garageId, slotId], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        return res.status(200).json({
            message: 'Slot status updated successfully',
            slot_id: slotId,
            status
        });
    });
};

const bookSlot = (req, res) => {
    const { garageId, slotId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }
    
    const userBookedQuery = `SELECT SLOTID FROM PARKINGSLOTS WHERE USERID = ? AND AVAILABILITY = 'occupied'`;
    
    db.get(userBookedQuery, [user_id], (err, bookedSlot) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (bookedSlot) {
            return res.status(400).json({ error: 'You already have a booked slot' });
        }

        const checkQuery = `SELECT AVAILABILITY, GARAGEID FROM PARKINGSLOTS WHERE GARAGEID = ? AND SLOTID = ?`;
        
        db.get(checkQuery, [garageId, slotId], (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'Slot not found' });
            }

            if (row.AVAILABILITY !== 'empty') {
                return res.status(400).json({ error: 'Slot is already occupied' });
            }

            const now = new Date().toISOString();
            const updateQuery = `
                UPDATE PARKINGSLOTS 
                SET AVAILABILITY = 'occupied', USERID = ?, TIMEPARKED = ?
                WHERE GARAGEID = ? AND SLOTID = ?
            `;
            
            db.run(updateQuery, [user_id, now, garageId, slotId], function(err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database error' });
                }

                const updateGarageQuery = `
                    UPDATE GARAGES 
                    SET OCCUPIEDSLOTS = OCCUPIEDSLOTS + 1 
                    WHERE GARAGEID = ?
                `;
                
                db.run(updateGarageQuery, [garageId], (err) => {
                    if (err) {
                        console.error(err);
                    }
                });

                return res.status(200).json({
                    message: 'Slot booked successfully',
                    slot_id: slotId,
                    garage_id: garageId,
                    user_id,
                    time_parked: now
                });
            });
        });
    });
};

const createSlot = (req, res) => {
    const { garageId } = req.params;
    const { slot_name } = req.body;

    if (!slot_name) {
        return res.status(400).json({ error: 'slot_name is required' });
    }

    const verifyGarageQuery = `SELECT GARAGEID FROM GARAGES WHERE GARAGEID = ?`;
    
    db.get(verifyGarageQuery, [garageId], (err, garage) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!garage) {
            return res.status(404).json({ error: 'Garage not found' });
        }
        const insertQuery = `INSERT INTO PARKINGSLOTS (GARAGEID, SLOTID, AVAILABILITY) VALUES (?, ?, 'empty')`;
        
        db.run(insertQuery, [garageId, slot_name], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Slot name already exists in this garage' });
                }
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            return res.status(201).json({
                message: 'Slot created successfully',
                slot_id: slot_name,
                garage_id: garageId,
                status: 'empty'
            });
        });
    });
};

module.exports = {
    getAllSlots,
    getSlotById,
    updateSlotStatus,
    bookSlot,
    createSlot
};
