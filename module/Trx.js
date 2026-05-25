const axios = require("axios");
const crypto = require("crypto");
const coreApi = require("../config/midrans.js");
const apikey = process.env.api_key_digiflaz;
const username = process.env.usernameDigi;
const { delay } = require("../module/Time.js");
const {
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
	setBiayaAdmin,
	setModeAktif,
	getBiayaAdmin
} = require("../module/crud.js");
async function createTrx(refid, produk_sku, customer_no) {
	const sign = crypto
		.createHash("md5")
		.update(username + apikey + refid)
		.digest("hex");
	try {
		const data = {
			username: username,
			buyer_sku_code: produk_sku,
			ref_id: refid,
			customer_no: customer_no,
			sign: sign,
		};
		const res = await axios.post(
			"https://api.digiflazz.com/v1/transaction",
			data
		);
		return res.data.data;
	} catch (err) {
		return (
			"Server Tidak Dapat Memproses Transaksi Anda ", err.response.data
		);
	}
}

async function cekSaldo() {
	const sign = crypto
		.createHash("md5")
		.update(username + apikey + "depo")
		.digest("hex");
	try {
		const data = {
			cmd: "deposit",
			username: username,
			sign: sign
		};
		const res = await axios.post(
			"https://api.digiflazz.com/v1/cek-saldo",
			data
		);
		return res.data.data.deposit;
	} catch (err) {
		return "Gagal Mengecek Saldo";
	}
}

async function Deposit(Amount, bank, OwnerName) {
	const sign = crypto
		.createHash("md5")
		.update(username + apikey + "deposit")
		.digest("hex");
	try {
		const data = {
			username: username,
			amount: Amount,
			bank: bank,
			owner_name: OwnerName,
			sign: sign
		};
		const res = await axios.post(
			"https://api.digiflazz.com/v1/deposit",
			data
		);
		return res.data.data;
	} catch (err) {
		console.log(err.response.data);
		return "Server Gagal Memproses Deposit";
	}
}

function formatRupiah(amount) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}

async function cekStatusTransaksi(
	bot,
	orderId,
	chatId,
	messageid,
	amount,
	payment_method,
	userId
) {
	try {
		const respon = await coreApi.transaction.status(orderId);
		const status = respon.transaction_status;
		switch (status) {
			case "settlement":
				try {
					await bot.deleteMessage(chatId, messageid);
				} catch (err) {
					console.error("Error:", err);
				}
				const messagee = await bot.sendMessage(
					chatId,
					`<b>✅ Pembayaran Berhasil </b>
	<b>Nomor Pesanan:</b> <code>${orderId}</code>
<b>Jumlah:</b> <code>${formatRupiah(amount)}</code>
<b>Metode:</b> <code>${payment_method}</code>

<b>Terima kasih,  pesanan Anda sedang diproses...</b>`,
					{
						parse_mode: "HTML"
					}
				);
				await delay(1000);
				addSaldo(userId, amount);
				bot.editMessageText(
					`<pre>Saldo Anda Berhasil Ditambahkan Sebesar ${formatRupiah(
						amount
					)}</pre>`,
					{
						chat_id: chatId,
						message_id: messagee.message_id,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "Back To Menu",
										callback_data: "back_menu"
									}
								]
							]
						},
						parse_mode: "HTML"
					}
				);
				return true;
				break;
			case "expire":
				await bot.deleteMessage(chatId, messageid);
				await bot.sendMessage(
					chatId,
					`❌  <b>Transaksi  Berhasil Dibatalkan</b>×
<b>Nomor Pesanan:</b> <code>${orderId}</code>
<b>Jumlah:</b> <code>${formatRupiah(amount)}</code>

<b>Sayang sekali, transaksi Anda telah kadaluarsa karena pembayaran tidak diterima dalam batas waktu.</b>

<b>Anda dapat:</b>
<b>- Membuat transaksi baru</b>
<b>- Hubungi kami jika menurut Anda ini kesalahan</b>`,
					{
						parse_mode: "HTML"
					}
				);
				return true;
				break;
			case "deny":
				await bot.deleteMessage(chatId, messageid);
				await bot.sendMessage(
					chatId,
					`<b>⚠️ Pembayaran Ditolak</b>
<b>Order:</b> <code>${orderId}</code>
<b>Jumlah:</b> <code>${formatRupiah(amount)}</code>
<b>Metode:</b> <code>${payment_method}</code>

<b>Silakan Ulangi Pembayaran lain Atau Hubungi Admin.</b>`,
					{
						parse_mode: "HTML"
					}
				);
				return true;
				break;
			case "cancel":
				await bot.deleteMessage(chatId, messageid);
				await bot.sendMessage(
					chatId,
					`<b>🛑 Transaksi Dibatalkan</b>
<b>Order Id:</b> <code>${orderId}</code>
<b>Jumlah:</b> <code>${amount}</code>
<b>Metode:</b> <code>${payment_method}</code>

<b>Transaksi ini tidak diproses lebih lanjut.</b>`,
					{
						parse_mode: "HTML"
					}
				);
				return true;
				break;
			default:
				return false;
		}
	} catch (err) {
		console.log("Server Gagal Mengecek Status Transaksi", err);
		bot.sendMessage(
			chatId,
			"<b>Server Gagal Mengecek Status Transaksi.Silahkan Hubungi Admin</b>",
			{
				parse_mode: "HTML"
			}
		);
		return true;
	}
}

function generateOrderId() {
	return "Order-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

module.exports = {
	createTrx,
	cekSaldo,
	Deposit,
	formatRupiah,
	cekStatusTransaksi,
	generateOrderId
};
