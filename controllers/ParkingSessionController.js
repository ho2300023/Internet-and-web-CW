const { db } = require('../db');

const getGarageAvailability = (req, res) => {
  const { garageId } = req.params;

  const verifyGarageQuery = `SELECT GARAGEID, LOCATION, TOTALSLOTS, OCCUPIEDSLOTS FROM GARAGES WHERE GARAGEID = ?`;

  db.get(verifyGarageQuery, [garageId], (err, garage) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!garage) {
      return res.status(404).json({ error: 'Garage not found' });
    }

    const slotsQuery = `
      SELECT SLOTID, AVAILABILITY 
      FROM PARKINGSLOTS 
      WHERE GARAGEID = ?
      ORDER BY SLOTID
    `;

    db.all(slotsQuery, [garageId], (err, slots) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }

      const availableSlots = slots.filter(s => s.AVAILABILITY === 'empty').length;
      const occupiedSlots = slots.filter(s => s.AVAILABILITY === 'occupied').length;

      return res.status(200).json({
        location: garage.LOCATION,
        total_slots: garage.TOTALSLOTS,
        available_slots: availableSlots,
        occupied_slots: occupiedSlots,
        slots: slots.map(s => ({
          slot_id: s.SLOTID,
          availability: s.AVAILABILITY
        }))
      });
    });
  });
};

const getUserParkingInfo = (req, res) => {
  const { garageId } = req.params;
  const userId = req.user.id;

  const query = `
    SELECT 
    PARKINGSLOTS.SLOTID as slot_id,
    PARKINGSLOTS.TIMEPARKED as time_parked,
    GARAGES.LOCATION as location
    FROM PARKINGSLOTS
    JOIN GARAGES ON PARKINGSLOTS.GARAGEID = GARAGES.GARAGEID
    WHERE PARKINGSLOTS.GARAGEID = ? AND PARKINGSLOTS.USERID = ? AND PARKINGSLOTS.AVAILABILITY = 'occupied'
  `;

  db.get(query, [garageId, userId], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'No active parking session found' });
    }

    return res.status(200).json({
      user_id: userId,
      location: row.location,
      slot_id: row.slot_id,
      time_parked: row.time_parked
    });
  });
};

const endParkingSession = (req, res) => {
  const { garageId } = req.params;
  const { user_id, hourly_rate } = req.body;

  if (!user_id || !hourly_rate) {
    return res.status(400).json({ error: 'user_id and hourly_rate are required' });
  }

  const findSessionQuery = `
    SELECT SLOTID, TIMEPARKED, USERID
    FROM PARKINGSLOTS
    WHERE GARAGEID = ? AND USERID = ? AND AVAILABILITY = 'occupied'
  `;

  db.get(findSessionQuery, [garageId, user_id], (err, slot) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!slot) {
      return res.status(404).json({ error: 'No active parking session found' });
    }

    const startTime = new Date(slot.TIMEPARKED);
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    const amountDue = parseFloat((durationHours * hourly_rate).toFixed(2));
    const endSessionQuery = `
      UPDATE PARKINGSLOTS 
      SET AVAILABILITY = 'empty', USERID = NULL, TIMEPARKED = NULL
      WHERE GARAGEID = ? AND SLOTID = ? AND USERID = ?
    `;

    db.run(endSessionQuery, [garageId, slot.SLOTID, user_id], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }

      const createSessionQuery = `
        INSERT INTO PARKINGSESSIONS (USERID, SLOTID, GARAGEID, SESSIONSTART, SESSIONEND, SESSIONDURATION, AMOUNTDUE)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const sessionParams = [
        user_id,
        slot.SLOTID,
        garageId,
        slot.TIMEPARKED,
        endTime.toISOString(),
        Math.ceil(durationHours),
        amountDue
      ];

      db.run(createSessionQuery, sessionParams, function(err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error' });
        }

        const updateGarageQuery = `
          UPDATE GARAGES 
          SET OCCUPIEDSLOTS = OCCUPIEDSLOTS - 1 
          WHERE GARAGEID = ?
        `;

        db.run(updateGarageQuery, [garageId], (err) => {
          if (err) {
            console.error(err);
          }
        });

        return res.status(200).json({
          message: 'Parking session ended successfully',
          session_id: this.lastID,
          user_id,
          slot_id: slot.SLOTID,
          parking_duration_hours: parseFloat(durationHours.toFixed(2)),
          amount_due: amountDue
        });
      });
    });
  });
};

module.exports = {
  getGarageAvailability,
  getUserParkingInfo,
  endParkingSession
};
