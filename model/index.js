const user = require("./user");
const historyTransaksi = require("./historyTransaksi");
const db = require("../config/db");

try {
	//historyTransaksi.sync({ alter: true });
	db.sync();
	console.log("berhasil Membuat Tabel");
} catch (error) {
	console.log("gagal membuat tabel");
}
user.hasMany(historyTransaksi, { foreignKey: "user_id", as: "history" });

historyTransaksi.belongsTo(user, { foreignKey: "user_id", as: "user" });

module.exports = { user, historyTransaksi };
