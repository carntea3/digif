const produkPrepaid = require("../model/produkPrepaid.js");

async function getBrandsByCategory(category, page = 1, limit = 5) {
  const offset = (page - 1) * limit;

  try {
    // Ambil brand unik berdasarkan kategori
    const { count, rows } = await produkPrepaid.findAndCountAll({
      attributes: ["brand"],
      where: { category }, // filter berdasarkan category
      group: ["brand"], // pastikan unik
      order: [["brand", "ASC"]],
      limit,
      offset,
      raw: true,
    });

    const brands = rows.map((b) => b.brand);
    const totalPages = Math.ceil(count.length / limit);

    return {
      brands,
      count: count.length,
      totalPages,
    };
  } catch (err) {
    console.error("Gagal mengambil brand:", err);
    return { brands: [], count: 0, totalPages: 0 };
  }
}

module.exports = getBrandsByCategory;
