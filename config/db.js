const { Sequelize } = require('sequelize');

const db_user = process.env.db_user;
const paswd_db = process.env.db_pasword;
const db = new Sequelize({
  dialect: "sqlite",
  storage: "./db.sqlite",
  logging: false
});

db.authenticate().then(() => {
  console.log("koneksi databases berhasil")
})
.catch((err) =>{
  console.log("kineksi databases gagal ", err)
})
module.exports = db;
