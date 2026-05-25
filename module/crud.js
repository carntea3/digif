const { user, historyTransaksi } = require("../model/index.js");
const { Sequelize, Op } = require("sequelize");
const produkPrepaid = require("../model/produkPrepaid.js");
const db = require("../config/db.js");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../config.json");
const moment = require("moment");
const { formatRupiah } = require("./Trx.js");

const api = process.env.api_key_digiflaz;
const username = process.env.usernameDigi;
async function createUser(userId) {
	try {
		const [users, created] = await user.findOrCreate({
			where: { user_id: userId }
		});
		const res = "berhasil membuat user";
		return { users, created };
	} catch (e) {
		const res = "gagal membuat user";
		return res;
	}
}

async function changeRole(userId, role) {
	try {
		await user.update(
			{
				role: role
			},
			{
				where: { user_id: userId }
			}
		);
		const res = "berhasil mengubah role";
		return res;
	} catch (e) {
		const res = "gagal mengubah role";
		return res;
	}
}

async function addSaldo(userId, count) {
	try {
		await user.update(
			{ saldo: Sequelize.literal(`saldo + ${count}`) },
			{ where: { user_id: userId } }
		);
		console.log("berhasil add saldo");
		const res = "Berhasil Add Saldo";
		return res;
	} catch (e) {
		const res = "Gagal Add Saldo";
	}
}

async function kurangiSaldo(userId, count) {
	try {
		await user.update(
			{ saldo: Sequelize.literal(`saldo - ${count}`) },
			{ where: { user_id: userId } }
		);
		console.log("berhasil Mengurangi saldo");
		const res = "Berhasil Mengurangi Saldo";
		return res;
	} catch (e) {
		const res = "Gagal Mengurangi Saldo";
	}
}

async function createHistoryTransaksi(
	user_id,
	status,
	order_id,
	category,
	produk,
	harga
) {
	try {
		await historyTransaksi.create({
			user_id,
			status,
			order_id,
			category,
			produk,
			harga
		});
		return "Trabsakai Berhasil Dicatat";
	} catch (err) {
		console.error("Gagal Mencatat Trabsakai", err);
	}
}

async function updateProdukPrepaid() {
	try {
		const res = await axios.post(
			"https://api.digiflazz.com/v1/price-list",
			{
				cmd: "prepaid",
				username: username,
				sign: crypto
					.createHash("md5")
					.update(username + api + "pricelist")
					.digest("hex")
			}
		);

		await produkPrepaid.sync({ force: true });

		// Ambil data dari API
		const dataProduk = res.data.data;
		await produkPrepaid.bulkCreate(
			dataProduk.map(item => ({
				product_name: item.product_name,
				category: item.category,
				brand: item.brand,
				type: item.type,
				price: item.price,
				buyer_sku_code: item.buyer_sku_code,
				unlimited_stock: item.unlimited_stock,
				stock: item.stock,
				multi: item.multi,
				start_cut_off: item.start_cut_off,
				end_cut_off: item.end_cut_off,
				desc: item.desc
			}))
		);

		console.log("Produk berhasil di update ke database!");
	} catch (err) {
		console.error("Login gagal:", err.message);
	}
}

async function findHistorytransaksi(user_id) {
	try {
		const data = await historyTransaksi.findAll({
			where: { user_id },
			include: [{ model: user, as: "user" }],
			order: [["tanggal", "DESC"]],
			limit: 5,
			raw: true
		});
		const message =
			data.length === 0
				? "Anda Belum Melakukan Transaksi"
				: data
						.map(item => {
							return `${moment(item.tanggal)
								.tz("Asia/Jakarta")
								.format("YYYY-MM-DD HH:mm:ss")} Beli ${
								item.produk
							} status ${item.status}`;
						})
						.join("\n");

		return message;
	} catch (error) {
		console.log("gagal Mengambil Daftar Transaksi", error);
	}
}

async function getBrandsByCategory(category, page = 1, limit = 5) {
	const offset = (page - 1) * limit;

	try {
		// Ambil brand unik berdasarkan kategori
		const { count, rows } = await produkPrepaid.findAndCountAll({
			attributes: ["brand"],
			where: { category }, // filter berdasarkan category
			group: ["brand"], // pastikan unik
			order: [["brand", "ASC"]],
			limit,
			offset,
			raw: true
		});

		const brands = rows.map(b => b.brand);
		const totalPages = Math.ceil(count.length / limit);

		return {
			brands,
			count: count.length,
			totalPages
		};
	} catch (err) {
		console.error("Gagal mengambil brand:", err);
		return { brands: [], count: 0, totalPages: 0 };
	}
}

async function getCategory(page = 1, limit = 8) {
	try {
		const offset = (page - 1) * limit;

		const { count, rows } = await produkPrepaid.findAndCountAll({
			attributes: ["category"],
			group: ["category"],
			order: [["brand", "ASC"]],
			limit,
			offset,
			raw: true
		});
		const category = rows.map(c => c.category);
		const totalPages = Math.ceil(count.length / limit);

		return {
			category,
			totalPages,
			count: count.length
		};
	} catch (error) {
		console.error("Error fetching categories:", error);
		return [];
	}
}

async function getProdukByBrand(brand, category, page = 1, limit = 5) {
	const offset = (page - 1) * limit;

	const { count, rows } = await produkPrepaid.findAndCountAll({
		where: { brand: brand, category: category },
		offset,
		limit,
		order: [["id", "ASC"]]
	});
	const products = rows.map(p => ({
		name: p.product_name,
		sku_code: p.buyer_sku_code,
		price: p.price,
		desc: p.desc
	}));

	return {
		products,
		count,
		totalPages: Math.ceil(count / limit)
	};
}

function getConfig() {
	return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function saveConfig(config) {
	fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getmodeFee() {
	const config = getConfig();
	return config.mode_aktif;
}
function NominalFee(role) {
	const config = getConfig();
	const mode = config.mode_aktif;
	const data = config.biaya_admin[role];
	if (!data) return 0;
	if (mode === "persen") {
		return `${data.persen}%`;
	} else {
		return formatRupiah(data.nominal);
	}
}
function getBiayaAdmin(role, hargaProduk) {
	const config = getConfig();
	const mode = config.mode_aktif;
	const data = config.biaya_admin[role];

	if (!data) return 0;

	if (mode === "persen") {
		return (hargaProduk * (data.persen || 0)) / 100 + hargaProduk;
	} else {
		return (data.nominal || 0) + hargaProduk;
	}
}

function setBiayaAdmin(role, mode, nilai) {
	const config = getConfig();
	if (!config.biaya_admin[role]) config.biaya_admin[role] = {};
	config.biaya_admin[role][mode] = Number(nilai);
	saveConfig(config);
}

function setModeAktif(mode) {
	const config = getConfig();
	config.mode_aktif = mode;
	saveConfig(config);
}

async function getTransactionsThisMonth() {
	try {
		const startOfMonth = moment()
			.tz("Asia/Jakarta")
			.startOf("month")
			.toDate();
		const endOfMonth = moment().tz("Asia/Jakarta").endOf("month").toDate();

		const transactions = await historyTransaksi.findAll({
			where: {
				tanggal: {
					[Op.between]: [startOfMonth, endOfMonth]
				}
			},
			order: [["tanggal", "DESC"]],
			raw: true
		});

		const message =
			transactions.length === 0
				? "Anda Belum Melakukan Transaksi"
				: transactions
						.map(t => {
							return `tanggal: ${moment(t.tanggal)
								.tz("Asia/Jakarta")
								.format("YYYY-MM-DD HH:mm:ss")}
								User Id: ${t.user_id}
								Item: ${t.produk}
								Harga: ${t.harga}
								Order Id: ${t.order_id}
								Status: ${t.status}`;
						})
						.join("\n");
	} catch (error) {
		console.error("Gagal mengambil transaksi:", error);
	}
}

async function TotalTransactionsThisMount() {
	const startOfMonth = moment().tz("Asia/Jakarta").startOf("month").toDate();
	const endOfMonth = moment(startOfMonth).add(1, "month").toDate();
	const transactions = await historyTransaksi.count({
		where: {
			tanggal: {
				[Op.gte]: startOfMonth,
				[Op.lt]: endOfMonth
			}
		}
	});
	return transactions;
}
module.exports = {
	createUser,
	addSaldo,
	kurangiSaldo,
	changeRole,
	findHistorytransaksi,
	createHistoryTransaksi,
	updateProdukPrepaid,
	getBrandsByCategory,
	getCategory,
	getProdukByBrand,
	getBiayaAdmin,
	setBiayaAdmin,
	setModeAktif,
	getTransactionsThisMonth,
	TotalTransactionsThisMount,
	NominalFee,
	getmodeFee
};
