const {app}= require('./index');
const db_access = require('./db.js');
const db = db_access.db;

db.serialize(() => {
   if (db_access.createUserTable) {
      db.run(db_access.createUserTable, (err) => {
         if (err) console.log('Error creating user table:', err.message);
      });
   }

   if (db_access.createGaragesTable) {
      db.run(db_access.createGaragesTable, (err) => {
         if (err) console.log('Error creating garages table:', err.message);
      });
   }

   if (db_access.createParkingSlotsTable) {
      db.run(db_access.createParkingSlotsTable, (err) => {
         if (err) console.log('Error creating parking slots table:', err.message);
      });
   }

   if (db_access.createParkingSessionsTable) {
      db.run(db_access.createParkingSessionsTable, (err) => {
         if (err) console.log('Error creating parking sessions table:', err.message);
      });
   }

});


const PORT=3000;
const server = app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});

