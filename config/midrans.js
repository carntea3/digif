const midtrans = require("midtrans-client");

const coreApi = new midtrans.CoreApi({
  isProduction: true,
  serverKey: process.env.server_key_midrans,
  clientKey: process.env.client_key_midrans,
});

module.exports = coreApi;
