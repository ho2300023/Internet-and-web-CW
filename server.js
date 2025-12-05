const {app}= require('./index');
const db_access = require('./db.js');
const db = db_access.db;

db.serialize(() => {
   if (db_access.createUserTable) {
      db.run(db_access.createUserTable, (err) => {
         if (err) console.log('Error creating user table:', err.message);
      });
   }

});


const PORT=3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});

