const produkPrepaid = require("../model/produkPrepaid.js");
const db = require("../config/db.js");
const axios = require("axios");
const crypto = require("crypto");

const api = process.env.api_key_digiflaz;
const username = process.env.usernameDigi;

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
module.exports = { updateProdukPrepaid }
