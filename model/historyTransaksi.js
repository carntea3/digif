const db = require("../config/db");
const { DataTypes } = require("sequelize");
const moment = require("moment");

const historyTransaksi = db.define(
	"historyTransaksi",
	{
		user_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false
		},
		order_id: {
			type: DataTypes.STRING(50),
			unique: true,
			allowNull: false
		},
		category: {
			type: DataTypes.STRING
		},
		produk: {
			type: DataTypes.STRING
		},
		harga: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		tanggal: {
			type: DataTypes.DATE,
			defaultValue: () => moment().tz("Asia/Jakarta").toDate()
		}
	},
	{
		timestamps: false
	}
);

module.exports = historyTransaksi;