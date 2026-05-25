function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function getMidtransTime() {
  const date = new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const wib = new Date(utc + (7 * 3600000));

  const pad = n => (n < 10 ? "0" + n : n);
  const year = wib.getFullYear();
  const month = pad(wib.getMonth() + 1);
  const day = pad(wib.getDate());
  const hours = pad(wib.getHours());
  const minutes = pad(wib.getMinutes());
  const seconds = pad(wib.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0700`;
}

module.exports = {delay, getMidtransTime};
