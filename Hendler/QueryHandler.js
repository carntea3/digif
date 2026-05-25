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
	kurangiSaldo,
	changeRole,
	createHistoryTransaksi,
	updateProdukPrepaid,
	getBrandsByCategory,
	getCategory,
	getProdukByBrand,
	setBiayaAdmin,
	setModeAktif,
	getBiayaAdmin,
	findHistorytransaksi
} = require("../module/crud.js");
const {
	buildKeyboard,
	buildKeyboardProducks
} = require("../module/buildKeyboard.js");
const { delay, getMidtransTime } = require("../module/Time.js");
const {
	validasiGane,
	ValidateNumber,
	isOwner,
	isAdmin
} = require("../module/Validasi.js");
const {
	createTrx,
	formatRupiah,
	generateOrderId,
	Deposit
} = require("../module/Trx.js");
const coreApi = require("../config/midrans.js");
const storeName = process.env.nameStore

module.exports = bot => {
	bot.on("callback_query", async query => {
		const UserStep = getUserStep();
		const lastMesage_id = getlastMesage_id();
		const userdata = getUserData();
		const chatId = query.message.chat.id;
		const userId = query.from.id;
		const messageid = query.message.message_id;
		const name = query.from.first_name;
		const users = await user.findOne({
			where: { user_id: userId },
			raw: true
		});
		if (!users) {
			bot.editMessageText(
				"Anda Belum Mendaftar Silahkan Ketik /start untuk mendaftar!",
				{
					message_id: messageid,
					chat_id: chatId
				}
			);
			return;
		}
		setlastMesage_id(userId, messageid);

		const header = `<b>Nama: ${name}</b>
				<b>User Id: ${userId}</b>
				<b>Saldo: ${users.saldo}</b>`;

		if (query.data.startsWith("owner_")) {
			const queryy = query.data.replace("owner_", "");
			if (!(await isOwner(userId))) {
				bot.sendMessage(
					chatId,
					"Anda Tidak Memiliki Hak Akses ke Fitur Ini!"
				);
				return;
			}
			switch (queryy) {
				case "update_produk":
					try {
						updateProdukPrepaid();
						bot.editMessageText("produk Berhasil Di update", {
							chat_id: chatId,
							message_id: messageid
						});
					} catch (e) {
						bot.editMessageText("gagal memuat data", {
							chat_id: chatId,
							message_id: messageid
						});
						console.log(e);
					}
					break;
				case "add_admin":
					bot.editMessageText(
						"Masukan UserId Target.Contoh 6992387770 Note: untuk mendapatkan Userid Silahkan tulis Command /start lalu salin userid",
						{
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Batal",
											callback_data: "batalown"
										}
									]
								]
							},
							chat_id: chatId,
							message_id: messageid
						}
					);
					setUserStep(userId, { step: "add_admin" });
					break;
				case "add_saldo":
					bot.editMessageText(
						"Masukan UserId Target.Contoh 6992387770 Note: untuk mendapatkan Userid Silahkan tulis Command /start lalu salin userid",
						{
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Batal",
											callback_data: "batalown"
										}
									]
								]
							},
							chat_id: chatId,
							message_id: messageid
						}
					);
					setUserStep(userId, {
						step: "add_saldo"
					});
					break;
				case "ubah_role":
					bot.editMessageText(
						"Masukan UserId Target.Contoh 6992387770 Note: untuk mendapatkan Userid Silahkan tulis Command /start lalu salin userid",
						{
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Batal",
											callback_data: "batalown"
										}
									]
								]
							},
							chat_id: chatId,
							message_id: messageid
						}
					);
					setUserStep(userId, {
						step: "ubah_role"
					});
					break;
				case "bc_admin":
					bot.editMessageText(
						"Masukan Text Broadcast.Contoh hari ini semua Produk diakon 50%!",
						{
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Batal",
											callback_data: "batalown"
										}
									]
								]
							},
							chat_id: chatId,
							message_id: messageid
						}
					);
					setUserStep(userId, {
						step: "bc_admin"
					});
					break;
				case "bc_all":
					bot.editMessageText(
						"Masukan Text Broadcast.Contoh hari ini semua Produk diakon 50%!",
						{
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Batal",
											callback_data: "batalown"
										}
									]
								]
							},
							chat_id: chatId,
							message_id: messageid
						}
					);
					setUserStep(userId, {
						step: "bc_all"
					});
					break;
				case "SetBiayaAdmin":
					bot.editMessageText(`Pilih Mode Biaya Admin`, {
						chat_id: chatId,
						message_id: messageid,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "Mode Nominal",
										callback_data: "owner_nominal"
									},
									{
										text: "Mode Persen",
										callback_data: "owner_persen"
									}
								]
							]
						}
					});
					break;
				case "setModeFee":
					bot.editMessageText("Silahkan Pilih Mode:", {
						chat_id: chatId,
						message_id: messageid,
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "Mode Persen",
										callback_data: "owner_setModePersen"
									},
									{
										text: "Mode Nomibal",
										callback_data: "owner_setModeNominal"
									}
								]
							]
						}
					});
					break;
				case "setModePersen":
					try {
						setModeAktif("persen");
						bot.editMessageText(
							"Berhasil Mengubah Mode Biaya Admin Menjadi Persen",
							{
								chat_id: chatId,
								message_id: messageid
							}
						);
					} catch (err) {
						bot.editMessageText("Terjadi Kesalahan Server", {
							chat_id: chatId,
							messageid: messageid
						});
					}
					break;
				case "setModeNominal":
					try {
						setModeAktif("nominal");
						bot.editMessageText(
							"Berhasil Mengubah Mode Biaya Admin Menjadi Nominal",
							{
								chat_id: chatId,
								message_id: messageid
							}
						);
					} catch (err) {
						bot.editMessageText("Terjadi Kesalahan Server", {
							chat_id: chatId,
							messageid: messageid
						});
					}
					break;
				case "persen":
					bot.editMessageText(
						`Masukan Nominal Biaya Admin.
				  contoh 10%`,
						{
							chat_id: chatId,
							message_id: messageid,
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Kembali",
											callback_data: "owner_SetBiayaAdmin"
										}
									]
								]
							}
						}
					);
					setUserStep(userId, {
						step: "setFeePersen"
					});
					break;
				case "nominal":
					bot.editMessageText(
						`Masukan Nominal Biaya Admin.
				  contoh 1000`,
						{
							chat_id: chatId,
							message_id: messageid,
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Kembali",
											callback_data: "owner_SetBiayaAdmin"
										}
									]
								]
							}
						}
					);
					setUserStep(userId, { step: "setFeeNominal" });
					break;
				case "Setfee_reseller":
					setBiayaAdmin(
						"reseller",
						userdata[userId].mode,
						userdata[userId].inputsetfee
					);
					bot.editMessageText(
						"Berhasil Mengatur Biaya admin reseller.",
						{
							chat_id: chatId,
							message_id: messageid
						}
					);
					clearUserData(userId);
					break;
				case "depoDigi":
					bot.editMessageText("Masukan Nominal Deposit:", {
						chat_id: chatId,
						message_id: messageid
					});
					setUserStep(userId, { step: "depoDigi" });
					break;
				case "Setfee_member":
					setBiayaAdmin(
						"member",
						userdata[userId].mode,
						userdata[userId].inputsetfee
					);
					bot.editMessageText(
						"Berhasil Mengatur Biaya admin member.",
						{
							chat_id: chatId,
							message_id: messageid
						}
					);
					clearUserData(userId);
					break;
				case "Setfee_admin":
					setBiayaAdmin(
						"admin",
						userdata[userId].mode,
						userdata[userId].inputsetfee
					);
					bot.editMessageText("Berhasil Mengatur Biaya admin.", {
						chat_id: chatId,
						message_id: messageid
					});
					clearUserData(userId);
					break;
				case "Setfee_owner":
					setBiayaAdmin(
						"owner",
						userdata[userId].mode,
						userdata[userId].inputsetfee
					);
					bot.editMessageText(
						"Berhasil Mengatur Biaya admin owner.",
						{
							chat_id: chatId,
							message_id: messageid
						}
					);
					clearUserData(userId);
					break;
				default:
			}
			if (queryy.startsWith("changeRole_")) {
				const [_, role, useridd] = queryy.split("_");
				try {
					changeRole(useridd, role);
					bot.editMessageText(
						`Berhasil Mengubah Role: ${useridd} menjadi ${role}`,
						{
							chat_id: chatId,
							message_id: messageid
						}
					);
					bot.sendMessage(
						useridd,
						`<pre>❗❗❗ Role Anda Berhasil Diubah Oleh Admin Menjadi ${role}</pre>`,
						{
							parse_mode: "HTML"
						}
					);
				} catch (err) {
					bot.sendMessage(chatId, "gagal Mengubah role");
				}
			}
		}

		if (query.data.startsWith("admin_")) {
			const queryy = query.data.replace("admin_", "");
			if (!(await isAdmin(userId)) && !(await isOwner(userId))) {
				bot.sendMessage(
					chatId,
					"Anda Tidak Memiliki Hak Akses ke Fitur Ini!"
				);
				return;
			}
			switch (queryy) {
				case "add_admin":
					bot.editMessageText(
						"Masukan UserId Target.Contoh 6992387770 Note: untuk mendapatkan Userid Silahkan tulis Command /start lalu salin userid",
						{
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Batal",
											callback_data: "batalown"
										}
									]
								]
							},
							chat_id: chatId,
							message_id: messageid
						}
					);
					setUserStep(userId, { step: "add_admin" });
					break;
				case "add_saldo":
					bot.editMessageText(
						"Masukan UserId Target.Contoh 6992387770 Note: untuk mendapatkan Userid Silahkan tulis Command /start lalu salin userid",
						{
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Batal",
											callback_data: "batalown"
										}
									]
								]
							},
							chat_id: chatId,
							message_id: messageid
						}
					);
					setUserStep(userId, {
						step: "add_saldo"
					});
					break;
				case "update_produk":
					try {
						updateProdukPrepaid();
						bot.editMessageText("produk Berhasil Di update", {
							chat_id: chatId,
							message_id: messageid
						});
					} catch (e) {
						bot.editMessageText("gagal memuat data", {
							chat_id: chatId,
							message_id: messageid
						});
						console.log(e);
					}
					break;
				case "bc_all":
					bot.editMessageText(
						"Masukan Text Broadcast.Contoh hari ini semua Produk diakon 50%!",
						{
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Batal",
											callback_data: "batalown"
										}
									]
								]
							},
							chat_id: chatId,
							message_id: messageid
						}
					);
					setUserStep(userId, {
						step: "bc_all"
					});
					break;
				case "bc_admin":
					bot.editMessageText(
						"Masukan Text Broadcast.Contoh hari ini semua Produk diakon 50%!",
						{
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Batal",
											callback_data: "batalown"
										}
									]
								]
							},
							chat_id: chatId,
							message_id: messageid
						}
					);
					setUserStep(userId, {
						step: "bc_admin"
					});
					break;
				case "depoDigi":
					bot.editMessageText("Masukan Nominal Deposit:", {
						chat_id: chatId,
						message_id: messageid
					});
					setUserStep(userId, { step: "depoDigi" });
					break;
				default:
			}
		}

		if (query.data == "batalown") {
			clearUserStep(userId);
			bot.editMessageText("Fitur Dibatalkan", {
				chat_id: chatId,
				message_id: messageid
			});
		}
		if (query.data.startsWith("Metod_")) {
			const bank = query.data.split("_")[1];
			const amount = Number(userdata[userId].nominal);
			const Ownername = userdata[userId].Ownername;
			bot.deleteMessage(chatId, lastMesage_id[userId]);
			try {
				const data = await Deposit(amount, bank, Ownername);
				bot.sendMessage(
					chatId,
					`💰 INSTRUKSI DEPOSIT DIGIFLAZZ

🏦 Bank Tujuan: <b>${data.bank}</b>
💳 Nomor Rekening: <code><b>${data.account_no}</b></code>
💵 Jumlah Transfer: <code><b>${data.amount}</b></code>
📘 Berita Transfer: <code><b>${data.notes}</b></code>
💳 Metode: <b>${data.payment_method}</b>

<b>Penting:</b>
🔸 Transfer dengan nominal tepat Rp <code><b>${data.amount}</b></code>
🔸 Gunakan berita: <b><code>${data.notes}</code></b>  

Saldo otomatis masuk setelah pembayaran terverifikasi Oleh Admin Digiflaz ✅`,
					{ parse_mode: "HTML" }
				);
			} catch (err) {
				console.error("Error:", err);
			}
			clearlastMesage_id(userId);
		}
		if (query.data == "back_menu") {
			const data = await findHistorytransaksi(userId);
			const menu = {
				chat_id: chatId,
				message_id: messageid,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "Produk Digital",
								callback_data: "produk_digital"
							}
						],
						[{ text: "Top Up", callback_data: "topUp" }]
					]
				},
				parse_mode: "html"
			};
			bot.editMessageText(
				`<b>Selamat Datang Di ${storeName}</b>
  
Nama: <code>${name}</code>
User Id: <code>${userId}</code>
Saldo: <code>${formatRupiah(users.saldo)}</code>
Role: ${users.role}

<b>5 Transaksi Terakhir Anda:</b>
<pre>${data}</pre>`,
				menu
			);
		}

		if (query.data == "topUp") {
			bot.editMessageText(
				"Silahkan Tuliskan Nominal TopUp.Minimal 5000",
				{
					chat_id: chatId,
					message_id: messageid
				}
			);
			setUserStep(userId, {
				step: "topUp"
			});
		}

		if (query.data == "produk_digital") {
			const { category, totalPages } = await getCategory();
			await bot.editMessageText(
				"Silahkan Pilih Category Produk: ",
				buildKeyboard(
					category,
					"Digital_Digital",
					"category_",
					1,
					totalPages,
					chatId,
					messageid,
					"back_menu"
				)
			);
		}
		if (query.data.startsWith("category_")) {
			const type = query.data.split("_")[1];
			if (type) {
				const { brands, totalPages } = await getBrandsByCategory(type);
				await bot.editMessageText(
					"Silahkan Pilih:",
					buildKeyboard(
						brands,
						`brand_${type}`,
						`brand_${type}_`,
						1,
						totalPages,
						chatId,
						messageid,
						"produk_digital"
					)
				);
			}
		}

		if (query.data.startsWith("brand_")) {
			const [_, category, brand] = query.data.split("_");
			if (brand) {
				const { products, totalPages } = await getProdukByBrand(
					brand,
					category,
					1
				);
				await bot.editMessageText(
					"Silahkan Pilih Produk: ",
					buildKeyboardProducks(
						products,
						`produk_${brand}`,
						`products_${category}_`,
						1,
						totalPages,
						chatId,
						messageid,
						`category_${category}`
					)
				);
			}
		}

		if (query.data.startsWith("BatalQris_")) {
			const order_id = query.data.split("_")[1];
			try {
				const data = await coreApi.transaction.cancel(order_id);
			} catch (err) {
				bot.sendMessage(chatId, "Gagal Membatalkan transaksi");
			}
		}

		if (query.data.startsWith("products_")) {
			const [_, category, sku_code] = query.data.split("_");
			if (sku_code) {
				const DataProduks = await produkPrepaid.findOne({
					where: { buyer_sku_code: sku_code },
					raw: true
				});
				const hargaproduk = await formatRupiah(
					getBiayaAdmin(users.role, DataProduks.price)
				);

				const header = `==============
<b>Nama:  <code>${name}</code></b>
<b>User Id: <code>${userId}</code></b>
<b>Saldo: <code>${formatRupiah(users.saldo)}</code></b>
==============
<b>Detail Produk:</b>
==============
<b>Nama:  <code>${DataProduks.product_name}</code></b>
<b>Harga: <code>${hargaproduk}</code></b>
`;

				if (DataProduks.category == "Games") {
					const res = validasiGane(DataProduks.brand, users);
					bot.editMessageText(header + res, {
						chat_id: chatId,
						message_id: messageid,
						parse_mode: "HTML"
					});
					setlastMesage_id(userId, messageid);
					setUserStep(userId, {
						step: 1,
						produk: DataProduks.product_name,
						harga: hargaproduk,
						category: DataProduks.category,
						sku_code: DataProduks.buyer_sku_code,
						brand: DataProduks.brand
					});
				} else {
					const res = ValidateNumber(DataProduks.category, users);
					bot.editMessageText(header + res, {
						chat_id: chatId,
						message_id: messageid,
						parse_mode: "HTML"
					});
					setlastMesage_id(userId, messageid);
					setUserStep(userId, {
						step: 1,
						produk: DataProduks.product_name,
						harga: hargaproduk,
						category: DataProduks.category,
						sku_code: DataProduks.buyer_sku_code,
						brand: DataProduks.brand
					});
				}
			}
		}

		if (query.data.startsWith("BayarSld-")) {
			const [_, id, sku_code, harga] = query.data.split("-");
			const product = await produkPrepaid.findOne({
				where: { buyer_sku_code: sku_code },
				attributes: ["product_name"],
				raw: true
			});
			const hargaBersih = Number(String(harga).replace(/[^0-9]/g, ""));
			if (!id || !sku_code || !harga) {
				return;
			}
			const hargaInt = parseInt(harga.replace(/[^0-9]/g, ""), 10);
			if (hargaInt <= users.saldo) {
				try {
					const transaksi = await createTrx(
						generateOrderId(),
						sku_code,
						id
					);
					switch (transaksi.status) {
						case "Sukses":
							bot.editMessageText(
								`<b>✅ Transaksi Berhasil</b>

<b>ID Transaksi:</b> <code>${transaksi.ref_id}</code>
<b>Nomor SN / Keterangan:</b> <code>${transaksi.sn}</code>
<b>Produk:</b> ${product.product_name}
<b>Nominal:</b> <b>${harga}</b>
<b>Status:</b> <i>${transaksi.status}</i>

<b>Waktu:</b> ${getMidtransTime().replace(/ \+\d{4}$/, "")}`,
								{
									chat_id: chatId,
									message_id: messageid,
									parse_mode: "HTML"
								}
							);
							kurangiSaldo(userId, hargaBersih);
							createHistoryTransaksi(
								userId,
								"sukses",
								transaksi.ref_id,
								product.category,
								product.product_name,
								hargaBersih
							);

							break;
						case "Gagal":
							bot.editMessageText(
								`❌ <b>Transaksi Gagal</b>

<b>ID Transaksi:</b> <code>${transaksi.ref_id}</code>
<b>Produk:</b> ${product.product_name}
<b>Nominal:</b> <b>${harga}</b>
<b>Status:</b> <i>${transaksi.status}</i>

<b>Pesan error:</b>
<pre>${transaksi.message}</pre>

<b>Waktu:</b> ${getMidtransTime().replace(/ \+\d{4}$/, "")}

Silakan coba ulang atau hubungi support jika saldo berkurang tetapi transaksi tidak sukses.`,
								{
									chat_id: chatId,
									message_id: messageid,
									parse_mode: "HTML"
								}
							);
							createHistoryTransaksi(
								userId,
								"gagal",
								transaksi.ref_id,
								product.category,
								product.product_name,
								hargaBersih
							);
							break;
						default:
							bot.editMessageText(
								`⚠️ <b>Transaksi Pending</b>

<b>ID Transaksi:</b> <code>${transaksi.ref_id}</code>
<b>Produk:</b> ${product.product_name}
<b>Nominal:</b> <b>${harga}</b>
<b>Status saat ini:</b> <i>${transaksi.status}</i>

<b>Waktu:</b> ${getMidtransTime().replace(/ \+\d{4}$/, "")}

<b>Info:</b> Pending biasanya ter-update dalam 1—24 jam. Jika lebih lama, laporkan ke support.`,
								{
									chat_id: chatId,
									message_id: messageid,
									parse_mode: "HTML",
									reply_markup: {
										inline_keyboard: [
											[
												{
													text: "Cek Status",
													callback_data: `Cek-status-trx-digiflaz_`
												}
											]
										]
									}
								}
							);
							setUserData(userId, {
								orderId: transaksi.ref_id,
								sku_code,
								id,
								harga
							});
					}
				} catch (err) {
					console.error("Error:", err);
				}
			} else {
				bot.editMessageText(
					`<pre>Saldo Anda Tidak Cukup.Silahkan Melakukan Top up Terlebih Dahulu!</pre>`,
					{
						reply_markup: {
							inline_keyboard: [
								[{ text: "Top Up", callback_data: "topUp" }]
							]
						},
						chat_id: chatId,
						message_id: messageid,
						parse_mode: "HTML"
					}
				);
			}
		}

		if (query.data.startsWith("Cek-status-trx-digiflaz_")) {
			const { orderId, sku_code, id, harga } = userdata[userId];
			const hargaBersih = Number(String(harga).replace(/[^0-9]/g, ""));
			console.log(id);
			const transaksi = await createTrx(orderId, sku_code, id);
			const product = await produkPrepaid.findOne({
				where: { buyer_sku_code: sku_code },
				attributes: ["product_name"],
				raw: true
			});
			if (transaksi.status == "Sukses") {
				bot.editMessageText(
					`<b>✅ Transaksi Berhasil</b>

<b>ID Transaksi:</b> <code>${transaksi.ref_id}</code>
<b>Nomor SN / Keterangan:</b> <code>${transaksi.sn}</code>
<b>Produk:</b> ${product.product_name}
<b>Nominal:</b> <b>${harga}</b>
<b>Status:</b> <i>${transaksi.status}</i>

<b>Waktu:</b> ${getMidtransTime().replace(/ \+\d{4}$/, "")}`,
					{
						chat_id: chatId,
						message_id: messageid,
						parse_mode: "HTML"
					}
				);
				kurangiSaldo(userId, hargaBersih);
				createHistoryTransaksi(
					userId,
					"sukses",
					transaksi.ref_id,
					product.category,
					product.product_name,
					hargaBersih
				);
			} else if (transaksi.status == "Gagal") {
				bot.editMessageText(
					`❌ <b>Transaksi Gagal</b>

<b>ID Transaksi:</b> <code>${transaksi.ref_id}</code>
<b>Produk:</b> ${product.product_name}
<b>Nominal:</b> <b>${harga}</b>
<b>Status:</b> <i>${transaksi.status}</i>

<b>Pesan error:</b>
<pre>${transaksi.message}</pre>

<b>Waktu:</b> ${getMidtransTime().replace(/ \+\d{4}$/, "")}

Silakan coba ulang atau hubungi support jika saldo berkurang tetapi transaksi tidak sukses.`,
					{
						chat_id: chatId,
						message_id: messageid,
						parse_mode: "HTML"
					}
				);
				createHistoryTransaksi(
					userId,
					"gagal",
					transaksi.ref_id,
					product.category,
					product.product_name,
					hargaBersih
				);
			} else {
				bot.editMessageText("Mengeck Status transaksi...", {
					chat_id: chatId,
					message_id: messageid
				});
				await delay(3000);
				bot.editMessageText(
					`⚠️ <b>Transaksi Pending</b>

<b>ID Transaksi:</b> <code>${transaksi.ref_id}</code>
<b>Produk:</b> ${product.product_name}
<b>Nominal:</b> <b>${harga}</b>
<b>Status saat ini:</b> <i>${transaksi.status}</i>

<b>Waktu:</b> ${getMidtransTime().replace(/ \+\d{4}$/, "")}

<b>Info:</b> Pending biasanya ter-update dalam 1—24 jam. Jika lebih lama, laporkan ke support.`,
					{
						chat_id: chatId,
						message_id: messageid,
						parse_mode: "HTML",
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "Cek Status",
										callback_data: `Cek-status-trx-digiflaz_`
									}
								]
							]
						}
					}
				);
			}
		}

		if (query.data.startsWith("page_")) {
			const [_, queryy, type, pageStr] = query.data.split("_");
			const page = parseInt(pageStr);

			// list category
			if (queryy == "Digital") {
				const { category, totalPages } = await getCategory(page);
				await bot.editMessageText(
					"Silahkan Pilih Category Produk",
					buildKeyboard(
						category,
						"Digital_Digital",
						"category_",
						page,
						totalPages,
						chatId,
						messageid,
						"back_menu"
					)
				);
			}

			if (queryy == "brand") {
				const { brands, totalPages } = await getBrandsByCategory(
					type,
					page
				);
				await bot.editMessageText(
					"Silahkan Pilih:",
					buildKeyboard(
						brands,
						`brand_${type}`,
						`brand_${type}_`,
						page,
						totalPages,
						chatId,
						messageid,
						"produk_digital"
					)
				);
			}
			if (queryy == "produk") {
				const category = query.data.split("_")[4];
				const { products, totalPages } = await getProdukByBrand(
					type,
					category,
					page
				);
				await bot.editMessageText(
					"Silahkan Pilih Produk: ",
					buildKeyboardProducks(
						products,
						`produk_${type}`,
						`products_${category}_`,
						page,
						totalPages,
						chatId,
						messageid,
						`category_${category}`
					)
				);
			}
		}
	});
};
