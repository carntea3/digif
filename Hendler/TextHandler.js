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
const {
	findHistorytransaksi,
	createUser,
	getTransactionsThisMonth,
	TotalTransactionsThisMount,
	getmodeFee,
	NominalFee
} = require("../module/crud.js");
const { isOwner, isAdmin } = require("../module/Validasi.js");
const { formatRupiah } = require("../module/Trx.js");
const storeName = process.env.nameStore

module.exports = bot => {
	// Command Start
	bot.onText(/\/start/, async msg => {
		const chatId = msg.chat.id;
		const name = msg.from.first_name;
		const messageid = msg.message_id;
		const userId = msg.from.id;
		clearUserStep(userId);
		clearUserData(userId);
		const data = await findHistorytransaksi(userId);
		console.log(data);
		const lastMesage_id = getlastMesage_id();
		try {
			if (lastMesage_id[userId]) {
				bot.deleteMessage(chatId, lastMesage_id[userId]);
			}
		} catch (err) {
			return;
		}
		const { users, created } = await createUser(userId);
		const menu = {
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

		const sent = await bot.sendMessage(
			chatId,
			`<b>Selamat Datang Di ${storeName}</b>
  
Nama: <code>${name}</code>
User Id: <code>${users.user_id}</code>
Saldo: <code>${formatRupiah(users.saldo)}</code>
Role: ${users.role}

<b>5 Transaksi Terakhir Anda:</b>
<pre>${data}</pre>`,
			menu
		);
		setlastMesage_id(userId, sent.message_id);
	});

	// Command owner panel
	bot.onText(/\/ownerpanel/, async msg => {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		const lastMesage_id = getlastMesage_id();
		const countTransaksiThisMount = await TotalTransactionsThisMount();
		if (!(await isOwner(userId))) {
			bot.sendMessage(
				chatId,
				"Anda Tidak Memeliki Hak Akses Ke Command Ini!"
			);
			return;
		}
		if (lastMesage_id[userId]) {
			bot.deleteMessage(chatId, lastMesage_id[userId]);
		} else {
		}
		const menuOwner = {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: "Add Admin",
							callback_data: "owner_add_admin"
						},
						{
							text: "Ubah Role",
							callback_data: "owner_ubah_role"
						}
					],
					[
						{
							text: " Add Saldo User",
							callback_data: "owner_add_saldo"
						},
						{
							text: "Update Produk",
							callback_data: "owner_update_produk"
						}
					],
					[
						{
							text: "Broadcast All User",
							callback_data: "owner_bc_all"
						},
						{
							text: "Broadcast All Admin",
							callback_data: "owner_bc_admin"
						}
					],
					[
						{
							text: "Set Biaya Admin",
							callback_data: "owner_SetBiayaAdmin"
						},
						{
							text: "Set Mode Biaya Admin ",
							callback_data: "owner_setModeFee"
						}
					],
					[
						{
							text: "Deposit digifalz",
							callback_data: "owner_depoDigi"
						}
					]
				]
			},
			parse_mode: "HTML"
		};
		const sent = await bot.sendMessage(
			chatId,
			`<b>Selamat Datang Di Owner Panel</b>
			
<b>Stastistik Bot:</b>
<b>Jumlah Transaksi Bulan Ini: ${countTransaksiThisMount}</b>
<b>Jumlah Transaksi Hari Ini: 100</b>
			
<b>Informasi Bot:</b>
<b>Mode Biaya Admin: ${getmodeFee()}</b>
<b>Biaya Admin:</b>
Member: ${NominalFee("member")}
Reseller: ${NominalFee("reseller")}
Admin: ${NominalFee("admin")}
Owner: ${NominalFee("owner")}`,
			menuOwner
		);
		setlastMesage_id(userId, sent.message_id);
	});

	// Command Admin Panel
	bot.onText(/\/adminpanel/, async msg => {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		const lastMesage_id = getlastMesage_id();
		if (!(await isAdmin(userId)) && !(await isOwner(userId))) {
			bot.sendMessage(
				chatId,
				"Anda Tidak Memeliki Hak Akses Ke Command Ini!"
			);
			return;
		}
		if (lastMesage_id[userId]) {
			bot.deleteMessage(chatId, lastMesage_id[userId]);
		} else {
		}
		const menuAdmin = {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: "Add Admin",
							callback_data: "admin_add_admin"
						}
					],
					[
						{
							text: " Add Saldo User",
							callback_data: "admin_add_saldo"
						},
						{
							text: "Update Produk",
							callback_data: "admin_update_produk"
						}
					],
					[
						{
							text: "Broadcast All User",
							callback_data: "admin_bc_all"
						},
						{
							text: "Broadcast All Admin",
							callback_data: "admin_bc_admin"
						}
					],
					[
						{
							text: "Deposit digifalz",
							callback_data: "admin_depoDigi"
						}
					]
				]
			}
		};
		const sent = await bot.sendMessage(
			chatId,
			`Selamat Datang Di Admin Panel: `,
			menuAdmin
		);
		setlastMesage_id(userId, sent.message_id);
	});
};
