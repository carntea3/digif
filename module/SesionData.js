const fs = require("fs");

const FILE_PATH = "./storage.json";

// Data utama yang disimpan
let data = {
	userStep: {},
	userData: {},
	lastMesage_id: {}
};

// 🔹 Fungsi untuk memuat data dari file
function loadStorage() {
	if (fs.existsSync(FILE_PATH)) {
		try {
			const raw = fs.readFileSync(FILE_PATH);
			data = JSON.parse(raw);
			console.log("✅ Storage berhasil dimuat dari file.");
		} catch (err) {
			console.error("⚠️ Gagal membaca storage.json:", err);
		}
	} else {
		console.log("ℹ️ Tidak ada file storage.json, membuat baru nanti.");
	}
}

// 🔹 Fungsi untuk menyimpan data ke file
function saveStorage() {
	try {
		fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
		console.log("💾 Storage berhasil disimpan.");
	} catch (err) {
		console.error("❌ Gagal menyimpan storage.json:", err);
	}
}

// 🔹 Getter dan Setter agar mudah digunakan
function setUserStep(userId, step) {
	data.userStep[userId] = step;
	saveStorage();
}

function setlastMesage_id(userId, mesage_id) {
	data.lastMesage_id[userId] = mesage_id;
	saveStorage();
}

function getUserStep() {
	return data.userStep || null;
}
function getlastMesage_id() {
	return data.lastMesage_id || null;
}

function setUserData(userId, userObj) {
	data.userData[userId] = userObj;
	saveStorage();
}

function getUserData() {
	return data.userData || null;
}

function clearUserData(userId) {
	delete data.userData[userId];
	saveStorage();
}
function clearlastMesage_id(userId) {
	delete data.lastMesage_id[userId];
	saveStorage();
}

function clearUserStep(userId) {
	delete data.userStep[userId];
	saveStorage();
}

module.exports = {
	loadStorage,
	saveStorage,
	setUserStep,
	getUserStep,
	setUserData,
	getUserData,
	clearUserData,
	clearUserStep,
	getlastMesage_id,
	setlastMesage_id,
	clearlastMesage_id
};
