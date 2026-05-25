const produkPrepaid = require('../model/produkPrepaid.js')

async function getCategory(page = 1, limit= 8 ) {
  try {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await produkPrepaid.findAndCountAll({
      attributes: ["category"],
      group: ["category"],
      order: [['brand', 'ASC']],
      limit,
      offset,
      raw: true
      
    });
    const category = rows.map(c => c.category);
    const totalPages = Math.ceil(count.length / limit);
    
    return {
      category,
      totalPages,
      count: count.length
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

module.exports = getCategory;