const {
	setUserStep,
	getUserStep,
	setUserData,
	getUserData,
	clearUserData,
	clearUserStep,
	getlastMesage_id,
	setlastMesage_id,
	clearlastMesage_id
} = require("../module/SesionData.js");
const produkPrepaid = require("../model/produkPrepaid.js");
const { user, historyTransaksi } = require("../model/index.js");
const {
	addSaldo,
	changeRole,
	setBiayaAdmin,
	setModeAktif,
	getBiayaAdmin
} = require("../module/crud.js");
const { isOwner } = require("../module/Validasi.js");
function validasiPersen(input) {
	return /^([0-9]{1,2}|100)%$/.test(input);
}
const { delay, getMidtransTime } = require("../module/Time.js");
const axios = require("axios");
const { validasiInput } = require("../module/Validasi.js");
const coreApi = require("../config/midrans.js");
const {
	formatRupiah,
	cekStatusTransaksi,
	generateOrderId
} = require("../module/Trx.js");
module.exports = bot => {
	bot.on("message", async msg => {
		const chatId = msg.chat.id;
		const userId = msg.from.id;
		const userdata = getUserData();
		const UserStep = getUserStep();
		const lastMesage_id = getlastMesage_id();
		async function safeSend(userId, message) {
			try {
				await bot.sendMessage(userId, message);
			} catch (err) {
				// Jika error rate limit (429)
				if (err.response && err.response.statusCode === 429) {
					const retryAfter =
						err.response.body.parameters?.retry_after || 1;
					console.log(`Kena rate limit, tunggu ${retryAfter}s`);
					await sleep((retryAfter + 0.5) * 1000);
					return safeSend(bot, userId, message);
				} else {
					console.error("Gagal kirim ke", userId, err.message);
				}
			}
		}
		const input = msg.text?.trim();
		if (!UserStep[userId] || input.startsWith("/")) return;
		if (UserStep[userId].step == 1) {
			const brand = UserStep[userId].brand;

			if (validasiInput(brand, input)) {
				setUserData(userId, {
					id: input
				});
			} else {
				bot.sendMessage(chatId, "Firmat Yang Anda Masukan Salah!");
				return;
			}
			const id = userdata[userId].id;
			const namaProduk = UserStep[userId].produk;
			const sku_code = UserStep[userId].sku_code;
			const harga = UserStep[userId].harga;
			if (!id) return;
			let data = {};
			let type = "";
			switch (brand) {
				case "ARENA OF VALOR":
					type = "aov";
					data = {
						id: id
					};
					break;
				case "Call of Duty MOBILE":
					type = "cod";
					data = {
						id: id
					};
					break;
				case "FREE FIRE":
					type = "ff";
					data = {
						id: id
					};
					break;
				case "Genshin Impact":
					type = "gi";
					data = {
						id: id.split("_")[0]
					};
					break;
				case "Honkai Impact 3":
					type = "hi";
					data = {
						id: id
					};
					break;
				case "Magic Chess":
					type = "mcgg";
					data = {
						id: id.split("_")[0],
						server: id.split("_")[1]
					};
					break;
				case "MOBILE LEGENDS":
					type = "ml";
					data = {
						id: id.split("_")[0],
						server: id.split("_")[1]
					};
					break;
				case "POINT BLANK":
					type = "pb";
					data = {
						id: id
					};
					break;
				case "Super Sus":
					type = "sus";
					data = {
						id: id
					};
					break;
				case "Valorant":
					type = "valo";
					data = {
						id: id
					};
					break;

				default:
					type = "";
					data = {
						id: id
					};
					break;
			}
			try {
				const res = await axios.get(
					`https://api.isan.eu.org/nickname/${type}`,
					{
						params: data
					}
				);
				clearUserStep(userId);
				const nameId = res.data.name;
				bot.deleteMessage(chatId, lastMesage_id[userId]);
				bot.sendMessage(
					chatId,
					`<b>Konfirmasi Pesanan Anda:</b>
			
<b>Produk: ${namaProduk}</b>
<b>Harga: ${harga}</b>
<b>Detail Acount: ${nameId}</b>`,
					{
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "💲 Bayar Dengan Saldo",
										callback_data: `BayarSld-${id}-${sku_code}-${harga}`
									}
								],
								[
									{
										text: "❌ Batal",
										callback_data: "batal_byr"
									}
								]
							]
						},
						parse_mode: "HTML"
					}
				);
				clearUserData(userId);
			} catch (err) {
				clearUserStep(userId);
				bot.deleteMessage(chatId, lastMesage_id[userId]);
				bot.sendMessage(
					chatId,
					`<b>Konfirmasi Pesanan Anda:</b>
			
<b>Produk: ${namaProduk}</b>
<b>Harga: ${harga}</b>
<b>Detail Acount: ${id.split("_")[0]}</b>`,
					{
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "💲 Bayar Dengan Saldo",
										callback_data: `BayarSld-${id}-${sku_code}-${harga}`
									}
								],
								[
									{
										text: "❌ Batal",
										callback_data: "batal_byr"
									}
								]
							]
						},
						parse_mode: "HTML"
					}
				);
				clearUserData(userId);
				console.log(err);
			}
		} else if (UserStep[userId].step == "topUp") {
			const input = msg.text?.trim();
			const amount = parseInt(input);
			if (!validasiInput("topUp", input)) {
				bot.sendMessage(chatId, "Mohon Masukan Angka!");
				return;
			}
			if (amount < 5000) {
				bot.sendMessage(chatId, "Minimal Nominal TopUo 5000");
				return;
			}
			const parameter = {
				payment_type: "qris",
				transaction_details: {
					order_id: generateOrderId(),
					gross_amount: amount
				},
				qris: {
					acquirer: "gopay"
				},
				custom_expiry: {
					order_time: getMidtransTime(),
					expiry_duration: 30,
					unit: "minute"
				}
			};
			clearUserStep(userId);
			try {
				const datatraa = await coreApi.charge(parameter);
				bot.deleteMessage(chatId, lastMesage_id[userId]);
				const message = await bot.sendPhoto(
					chatId,
					datatraa.actions[0].url,
					{
						caption: `Invoice Top Up Berhasil Dibuat

Order Id: ${datatraa.transaction_id}
Jumlah: ${formatRupiah(datatraa.gross_amount)}

Silakan scan QRIS di atas untuk menyelesaikan pembayaran, expired dalam 30 menit..`,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "❌ Batalkan",
										callback_data: `BatalQris_${datatraa.order_id}`
									}
								]
							]
						}
					}
				);
				let interval = setInterval(async function () {
					const stautus = await cekStatusTransaksi(
						bot,
						datatraa.order_id,
						chatId,
						message.message_id,
						amount,
						datatraa.payment_type,
						userId
					);
					if (stautus) {
						clearInterval(interval);
					}
				}, 3000);
			} catch (error) {
				console.log(error);
				bot.sendMessage(
					chatId,
					"Saat Ini Server Sedang Ada Masalah, Silahkan Hubungi Admin"
				);
			}
		} else if (UserStep[userId].step == "depoDigi") {
			const input = msg.text?.trim();
			if (!validasiInput("saldo", input)) {
				bot.sendMessage(chatId, "Mohon Masukan Format Yang Benar");
				return;
			}
			if (Number(input) < 200000) {
				bot.sendMessage(chatId, "Minimal Deposit Rp 200.000");
				return;
			}
			setUserData(userId, {
				inputDepodigi: input
			});
			bot.deleteMessage(chatId, lastMesage_id[userId]);
			const sent = await bot.sendMessage(
				chatId,
				"Masukan Nama Rekening Anda Yang Digunakan Untuk Deposit"
			);
			setlastMesage_id(userId, sent.message_id);
			setUserStep(userId, { step: "inputOwnerRek" });
		} else if (UserStep[userId].step == "inputOwnerRek") {
			const nominal = userdata[userId].inputDepodigi || null;
			const Ownername = msg.text?.trim();
			bot.editMessageText("Silahkan Pilih Metode Deposit:", {
				chat_id: chatId,
				message_id: lastMesage_id[userId],
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "Bca", callback_data: "Metod_BCA" },
							{
								text: "Bank Mandiri",
								callback_data: "Metod_MANDIRI"
							}
						],
						[
							{
								text: "Bri",
								callback_data: "Metod_BRI"
							},
							{
								text: "BNI",
								callback_data: "Metod_BNI"
							}
						]
					]
				}
			});
			setUserData(userId, {
				nominal,
				Ownername
			});
			clearUserStep(userId);
		} else if (UserStep[userId].step == "add_saldo") {
			const useridd = msg.text?.trim();
			if (!validasiInput("userIdTele", useridd)) {
				bot.sendMessage(chatId, "Mohon Masukan Format Yang Benar");
				return;
			}
			setUserData(userId, {
				userId: useridd
			});
			setUserStep(userId, {
				step: "inptsaldo"
			});
			bot.deleteMessage(chatId, lastMesage_id[userId]);
			const sent = await bot.sendMessage(
				chatId,
				"masukan jumlah saldo yang ingin di Ditambahkan.Contoh 12000"
			);
			setlastMesage_id(userId, sent.message_id);
		} else if (UserStep[userId].step == "setFeePersen") {
			const input = msg.text?.trim();
			if (!validasiPersen(input)) {
				bot.sendMessage(
					chatId,
					"Format yang abda masukan salah.Cojtoh format 10%"
				);
				return;
			}
			bot.deleteMessage(chatId, lastMesage_id[userId]);
			const sent = await bot.sendMessage(
				chatId,
				"Pilih Role yang mau di ubah",
				{
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "reseller",
									callback_data: "owner_Setfee_reseller"
								},
								{
									text: "member",
									callback_data: "owner_Setfee_member"
								}
							],
							[
								{
									text: "admin",
									callback_data: "owner_Setfee_admin"
								},
								{
									text: "owner",
									callback_data: "owner_Setfee_owner"
								}
							]
						]
					}
				}
			);
			setlastMesage_id(userId, sent.message_id);
			setUserData(userId, {
				inputsetfee: input.replace("%", ""),
				mode: "persen"
			});
			clearUserStep(userId);
		} else if (UserStep[userId].step == "setFeeNominal") {
			const input = msg.text?.trim();
			if (!validasiInput("saldo", input)) {
				bot.sendMessage(chatId, "Mohon masukan angka.contoh 1000");
				return;
			}
			bot.deleteMessage(chatId, lastMesage_id[userId]);
			const sent = await bot.sendMessage(
				chatId,
				"Pilih Role yang mau di ubah",
				{
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "reseller",
									callback_data: "owner_Setfee_reseller"
								},
								{
									text: "member",
									callback_data: "owner_Setfee_member"
								}
							],
							[
								{
									text: "admin",
									callback_data: "owner_Setfee_admin"
								},
								{
									text: "owner",
									callback_data: "owner_Setfee_owner"
								}
							]
						]
					}
				}
			);
			setlastMesage_id(userId, sent.message_id);
			setUserData(userId, {
				inputsetfee: input,
				mode: "nominal"
			});
			clearUserStep(userId);
		} else if (UserStep[userId].step == "inptsaldo") {
			const saldo = msg.text?.trim();
			if (!validasiInput("saldo", saldo)) {
				bot.sendMessage(chatId, "mohom masukan angka");
				return;
			}
			const useridd = userdata[userId].userId;
			try {
				await addSaldo(useridd, parseInt(saldo));
				bot.deleteMessage(chatId, lastMesage_id[userId]);
				const sent = await bot.sendMessage(
					chatId,
					`berhasil Menambahkan saldo user: ${useridd} Sebesar: ${formatRupiah(
						parseInt(saldo)
					)}`
				);
				await bot.sendMessage(
					useridd,
					`<pre>Selamat Saldo Anda Berhasil Ditambahkan Sebesar ${formatRupiah(
						parseInt(saldo)
					)} oleh admin</pre>`,
					{
						parse_mode: "HTML"
					}
				);
				setlastMesage_id(userId, sent.message_id);
				clearUserData(user);
				clearUserStep(userId);
			} catch (err) {
				console.log(err);
				bot.sendMessage(chatId, "gagal Menambahkan Saldo");
				clearUserData(userId);
				clearUserStep(userId);
			}
		} else if (UserStep[userId].step == "add_admin") {
			const useridd = msg.text?.trim();
			if (!validasiInput("userIdTele", useridd)) {
				bot.sendMessage(chatId, "Mohon Masukan Format Yang Benar");
				return;
			}
			try {
				await changeRole(useridd, "admin");
				bot.deleteMessage(chatId, lastMesage_id[userId]);
				const sent = await bot.sendMessage(
					chatId,
					`Berhasil Menambahkan admin. userId: ${useridd}`
				);
				bot.sendMessage(
					useridd,
					`<pre>Sekarang anda telah menjadi admin di bot ini.Silahkan kitik /adminMenu untuk melihat admin menu</pre>`,
					{
						parse_mode: "HTML"
					}
				);
				setlastMesage_id(userId, sent.message_id);
				clearUserStep(userId);
			} catch (err) {
				bot.sendMessage(chatId, "Gagal Menambahkan admin");
				clearUserStep(userId);
			}
		} else if (UserStep[userId].step == "ubah_role") {
			const useridd = msg.text?.trim();
			if (!validasiInput("userIdTele", useridd)) {
				bot.sendMessage(chatId, "Mohon Masukan Format Yang Benar");
				return;
			}
			bot.deleteMessage(chatId, lastMesage_id[userId]);
			const sent = await bot.sendMessage(
				chatId,
				"Silahkan Pilih Role Dibawah Ini:",
				{
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "member",
									callback_data: `owner_changeRole_member_${useridd}`
								},
								{
									text: "admin",
									callback_data: `owner_changeRole_admin_${useridd}`
								}
							],
							[
								{
									text: "owner",
									callback_data: `owner_changeRole_owner_${useridd}`
								},
								{
									text: "reseller",
									callback_data: `changeRole_reseller_${useridd}`
								}
							]
						]
					}
				}
			);
			setlastMesage_id(userId, sent.message_id);
		} else if (UserStep[userId].step == "bc_all") {
			const message = msg.text?.trim();
			const listUserid = await user.findAll({
				attributes: ["user_id"],
				raw: true
			});
			const msage = await bot.sendMessage(chatId, "proses...");
			for (const userid of listUserid) {
				await safeSend(userid.user_id, message);
				await delay(200);
			}
			bot.deleteMessage(chatId, lastMesage_id[userId]);
			const sent = await bot.sendMessage(
				chatId,
				"Berhasil Broadcast ke all user"
			);
			setlastMesage_id(userId, sent.message_id);
			clearUserStep(userId);
		} else if (UserStep[userId].step == "bc_admin") {
			const message = msg.text?.trim();
			const listUserid = await user.findAll({
				attributes: ["user_id"],
				where: {
					role: "admin"
				},
				raw: true
			});
			bot.deleteMessage(chatId, lastMesage_id[userId]);
			const sent = await bot.sendMessage(chatId, "proses...");
			for (const userid of listUserid) {
				await safeSend(userid.user_id, message);
				await delay(200);
			}
			setlastMesage_id(userId, sent.message_id);
			bot.editMessageText("Berhasil Broadcast ke all admin", {
				chat_id: chatId,
				message_id: lastMesage_id[userId]
			});
		}
	});
};
