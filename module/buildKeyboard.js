function buildKeyboard(
	products,
	type,
	query,
	page,
	totalPages,
	chatId,
	messageid,
	back = "back"
) {
	const keyboard = products.map(item => [
		{ text: item, callback_data: `${query}${item}` }
	]);
	const navRow = [];
	if (page > 1)
		navRow.push({
			text: "⬅️ Prev",
			callback_data: `page_${type}_${page - 1}`
		});
	if (page < totalPages)
		navRow.push({
			text: "➡️ Next",
			callback_data: `page_${type}_${page + 1}`
		});
	if (back) navRow.unshift({ text: `   Kembali   `, callback_data: back });

	if (navRow.length > 0) keyboard.push(navRow);

	return {
		chat_id: chatId,
		message_id: messageid,
		reply_markup: { inline_keyboard: keyboard }
	};
}

function buildKeyboardProducks(
	products,
	type,
	query,
	page,
	totalPages,
	chatId,
	messageid,
	back = "back"
) {
	const keyboard = products.map(item => [
		{ text: item.name, callback_data: `${query}${item.sku_code}` }
	]);
	const category = query.split("_")[1];
	const navRow = [];
	if (page > 1)
		navRow.push({
			text: "⬅️ Prev",
			callback_data: `page_${type}_${page - 1}_${category}`
		});
	if (page < totalPages)
		navRow.push({
			text: "➡️ Next",
			callback_data: `page_${type}_${page + 1}_${category}`
		});
	if (back) navRow.unshift({ text: `   Kembali   `, callback_data: back });

	if (navRow.length > 0) keyboard.push(navRow);

	return {
		chat_id: chatId,
		message_id: messageid,
		reply_markup: { inline_keyboard: keyboard }
	};
}

module.exports = {buildKeyboard,buildKeyboardProducks};
