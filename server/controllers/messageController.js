const { getMessages, createMessage } = require("../models/messageQueries");

module.exports.getMessages = async (req, res, next) => {
	try {
		const { from, to } = req.body;

		const messages = await getMessages(from, to);

		const projectedMessages = messages.map((msg) => {
			return {
				fromSelf: msg.sender === from,
				message: msg.message,
			};
		});
		res.json(projectedMessages);
	} catch (ex) {
		next(ex);
	}
};

module.exports.addMessage = async (req, res, next) => {
	try {
		const { from, to, message } = req.body;
		const data = await createMessage(from, to, message);

		if (data) return res.json({ msg: "Message added successfully." });
		else return res.json({ msg: "Failed to add message to the database" });
	} catch (ex) {
		next(ex);
	}
};
