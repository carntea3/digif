const produkPrepaid = require("../model/produkPrepaid.js");

// Fungsi ambil produk dengan pagination
async function getProdukByBrand(brand, category, page = 1, limit = 5) {
  const offset = (page - 1) * limit;

  const { count, rows } = await produkPrepaid.findAndCountAll({
    where: { brand: brand, category: category },
    offset,
    limit,
    order: [["id", "ASC"]],
  });
  const products = rows.map((p) => ({
    name: p.product_name,
    sku_code: p.buyer_sku_code,
    price: p.price,
    desc: p.desc
  }));

  return {
    products,
    count,
    totalPages: Math.ceil(count / limit),
  };
}

module.exports = getProdukByBrand;
