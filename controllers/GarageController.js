const { db } = require('../db');

// Create a new garage with admin verification
const createGarage = (req, res) => {
    const { location, total_slots } = req.body;

    if (!location || !total_slots) {
        return res.status(400).json({ error: 'Location and total_slots are required' });
    }

    const query = `INSERT INTO GARAGES (LOCATION, TOTALSLOTS, OCCUPIEDSLOTS) VALUES (?, ?, 0)`;
    
    db.run(query, [location, total_slots], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint')) {
                return res.status(400).json({ error: 'Garage location already exists' });
            }
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(201).json({
            message: 'Garage created successfully',
            garage: {
                garage_id: this.lastID,
                location,
                total_slots,
                available_slots: total_slots
            }
        });
    });
};

//get garages with availabele slots
const getAllGarages = (req, res) => {
    const query = `SELECT GARAGEID, LOCATION, TOTALSLOTS, OCCUPIEDSLOTS, (TOTALSLOTS - OCCUPIEDSLOTS) as AVAILABLE_SLOTS FROM GARAGES`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        const garages = rows.map(row => ({
            garage_id: row.GARAGEID,
            location: row.LOCATION,
            total_slots: row.TOTALSLOTS,
            available_slots: row.AVAILABLE_SLOTS
        }));

        return res.status(200).json(garages);
    });
};

// get garage by id
const getGarageById = (req, res) => {
    const { garageId } = req.params;
    const query = `SELECT GARAGEID, LOCATION, TOTALSLOTS, OCCUPIEDSLOTS, (TOTALSLOTS - OCCUPIEDSLOTS) as AVAILABLE_SLOTS FROM GARAGES WHERE GARAGEID = ?`;
    
    db.get(query, [garageId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Garage not found' });
        }

        return res.status(200).json({
            garage_id: row.GARAGEID,
            location: row.LOCATION,
            total_slots: row.TOTALSLOTS,
            available_slots: row.AVAILABLE_SLOTS,
            occupied_slots: row.OCCUPIEDSLOTS
        });
    });
};

//update garage with admin verification
const updateGarage = (req, res) => {
    const { garageId } = req.params;
    const { location, total_slots } = req.body;

    if (!location && !total_slots) {
        return res.status(400).json({ error: 'At least one field (location or total_slots) is required' });
    }

    let query = 'UPDATE GARAGES SET ';
    let params = [];

    if (location) {
        query += 'LOCATION = ?';
        params.push(location);
    }
    if (total_slots) {
        if (params.length > 0) query += ', ';
        query += 'TOTALSLOTS = ?';
        params.push(total_slots);
    }

    query += ' WHERE GARAGEID = ?';
    params.push(garageId);

    db.run(query, params, function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Garage not found' });
        }

        return res.status(200).json({
            message: 'Garage updated successfully',
            garage_id: garageId
        });
    });
};

//delete garage location with admin verification
const deleteGarage = (req, res) => {
    const { garageId } = req.params;
    const query = `DELETE FROM GARAGES WHERE GARAGEID = ?`;
    
    db.run(query, [garageId], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Garage not found' });
        }

        return res.status(200).json({ message: 'Garage deleted successfully' });
    });
};

module.exports = {
    createGarage,
    getAllGarages,
    getGarageById,
    updateGarage,
    deleteGarage
};
