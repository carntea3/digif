const OWNERS = process.env.OWNER.split(",").map(id => Number(id.trim()));
const { user, historyTransaksi } = require("../model/index.js");
function ValidateNumber(category, users) {
	let format = "";

	switch (category) {
		case "PLN":
			format = `
Masukkan Nomor Meter / ID Pelanggan:`;
			break;

		case "Pulsa":
		case "Paket SMS & Telpon":
		case "Masa Aktif":
		case "E-Money":
		case "Data":
		case "Voucher":
			format = `
Masukan Nomor Anda:`;
			break;

		case "Aktivasi Perdana":
			format = `
Pastikan memasukan nomor yang belum pernah di gunakan/Nomor masih tersegel`;
			break;
		default:
			format = "Masukan Data Anda:";
			break;
	}
	return format;
}

function validasiGane(game, users) {
	let format = "";
	switch (game) {
		case "ARENA OF VALOR":
			format = `
<b>Masukan Pleyer ID:</b>
      
<b>Note;</b>

Untuk menemukan User ID Anda, Ketuk ikon pengaturan, scroll ke bawah, temukan bagian "Umum", lalu Klik "Player ID". Contoh: <code>"888347346994333"</code>.`;
			break;
		case "Call of Duty MOBILE":
			format = `
<b>Masukan Pleyer ID:</b>
      
<b>Note;</b>

Untuk menemukan PlayerID Anda, klik ikon 'settings' yang terletak di sebelah kanan layar dan klik tab 'LEGAL AND PRIVACY'.`;
			break;
		case "FREE FIRE":
			format = `
<b>Masukan Pleyer ID:</b>
      
<b>Note;</b>

Untuk menemukan ID Anda, klik pada ikon karakter. User ID tercantum di bawah nama karakter Anda. Contoh: <code>'5363266446'</code>.`;
			break;
		case "Genshin Impact":
			format = `
<b>Masukkan UID Dan Pilih Server:</b>
      
<b>Note;</b>

Untuk menemukan UID Anda, masuk pakai akun Anda. Klik pada tombol profile di pojok kiri atas layar. Temukan UID dibawah avatar. Contoh Pengisian Id Dan Server: 

<b>List Server: Asia, America, Europe, TW, HK, MO.</b>
<b>Sesuikan Server Dengan Akun Anda!</b>

UID: <code>888347346994333</code>
Server: Asia
<b>Contoh: <code>888347346994333_Asia</code></b>
      `;
			break;
		case "Honkai Impact 3":
			format = `
<b>Masukan Pleyer ID:</b>
      
<b>Note;</b>

Untuk menemukan User ID Anda, buka aplikasi Honkai Impact 3, klik pada informasi level yang terletak di kiri atas layar, temukan User ID Anda disana.`;
			break;
		case "Magic Chess":
			format = `
<b>Masukkan User ID Dan Zone Id:</b>
      
<b>Note;</b>

Untok Formau Pengisian Id Dan Zone Id Pisahkan Dengan <b>"_"</b>

Untuk menemukan id dan zone id anda Login ke dalam Game, Tap pada Avatar di pojok kiri atas untuk memasuki halaman informasi dasar dan mengecek ID Anda. Contoh Pengisian Id Dan Zone Id:

id: <code>887876555776</code>
Zone Id = <code>75333</code>
contoh: <code>887876555776_75333</code>`;
			break;
		case "MOBILE LEGENDS":
			format = `
<b>Masukkan User ID Dan Zone Id:</b>
      
<b>Note;</b>

Untok Formau Pengisian Id Dan Zone Id Pisahkan Dengan <b>"_"</b>

Untuk menemukan Id dan Zone id Anda Login ke dalam Game, Tap pada Avatar di pojok kiri atas untuk memasuki halaman informasi dasar dan mengecek ID Anda. Contoh Pengisian Id Dan Zone Id:

id: <code>887876555776</code>
Zone Id = <code>75333</code>
contoh: <code>887876555776_75333</code>`;
			break;
		case "POINT BLANK":
			format = `
<b>Masukkan User ID:</b>
      
<b>Note;</b>
Untuk menemukan ID Anda, silakan kunjungi beranda kami untuk masuk dan ID Zepetto Anda ditampilkan di kanan atas.
      `;
			break;
		case "Super Sus":
			format = `
<b>Masukkan ID Space:</b>
      
<b>Note;</b>

Untuk menemukan ID Space Anda, login ke dalam akun permainan, klik tombol Avatar dan Anda dapat menemukan ID Space dibawah foto profile Anda.
      `;
			break;
		case "Valorant":
			format = `
<b>Masukkan Riot Id Anda:</b>
      
<b>Note;</b>

Untuk menemukan Riot ID Anda, buka halaman profil akun dan salin Riot ID+Tag menggunakan tombol yang tersedia disamping Riot ID. (Contoh: Westbourne#SEA)
      `;
			break;
		default:
			format = "masukan Id Game Anda";
			break;
	}
	return format;
}

// function validasiInput(teks) {
// 	// Regex: hanya huruf, angka, _, %, #
// 	const regex = /^[a-zA-Z0-9_%#]+$/;
// 	return regex.test(teks);
// }

function validasiInput(brand, input) {
	brand = brand.toLowerCase();

	// kalau ada underscore berarti UID + Zone
	const [uid, zone] = input.includes("_") ? input.split("_") : [input, null];
	switch (brand) {
		// --- GAME dengan UID + Zone ---
		case "mobile legends":
		case "ml":
		case "magic chess":
			// UID angka, Zone angka
			return /^\d+$/.test(uid) && /^\d+$/.test(zone || "");

		// --- GAME dengan UID saja ---
		case "arena of valor":
		case "aov":
		case "call of duty mobile":
		case "codm":
		case "free fire":
		case "ff":
		case "genshin impact":
		case "honkai impact 3":
		case "pubg mobile":
		case "pubg":
		case "super sus":
			return /^\d+$/.test(uid);

		case "point blank":
		case "pb":
			return /^[A-Za-z0-9]+$/.test(uid);

		case "valorant":
			return /^[A-Za-z0-9]+#[A-Za-z0-9]+$/.test(uid);

		// --- OPERATOR SELULER ---
		case "axis":
			return /^083[1-8]\d+$/.test(uid);

		case "by.u":
		case "byu":
			return /^(0851|0852|0853|0821|0822|0811|0812|0813)\d+$/.test(uid);

		case "indosat":
			return /^(0814|0815|0816|0855|0856|0857|0858)\d+$/.test(uid);

		case "smartfren":
			return /^088[1-9]\d+$/.test(uid);

		case "telkomsel":
			return /^(0811|0812|0813|0821|0822|0851|0852|0853)\d+$/.test(uid);

		case "tri":
		case "three":
			return /^089[5-9]\d+$/.test(uid);

		case "xl":
			return /^(0817|0818|0819|0859|0877|0878)\d+$/.test(uid);

		// --- E-WALLET ---
		case "go pay":
		case "gopay":
		case "ovo":
			return /^08\d+$/.test(uid);

		// --- UTILITAS ---
		case "pln":
			return /^\d+$/.test(uid);

		// fallback
		default:
			return /^\d+$/.test(uid);
	}
}

async function isOwner(userId) {
	const userid = await user.findAll({
		where: { role: "owner" },
		attributes: ["user_id"],
		raw: true
	});
	const ownersId = userid.map(u => Number(u.user_id));

	return OWNERS.includes(Number(userId)) || ownersId.includes(Number(userId));
}
async function isAdmin(userId) {
	const userid = await user.findAll({
		where: { role: "admin" },
		attributes: ["user_id"],
		raw: true
	});
	const adminId = userid.map(u => Number(u.user_id));
	return adminId.includes(Number(userId));
}

module.exports = {
	validasiGane,
	ValidateNumber,
	validasiInput,
	isOwner,
	isAdmin
};
