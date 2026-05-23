const supabase = require("../config/supabase");

// Get messages between two users
const getMessagesBetweenUsers = async (from, to) => {
	const { data, error } = await supabase
		.from("messages")
		.select("*")
		.or(`and(users.cs.[${JSON.stringify([from, to])}]),and(users.cs.[${JSON.stringify([to, from])}])`)
		.order("created_at", { ascending: true });

	if (error) throw error;
	return data;
};

// Alternative implementation using direct query
const getMessages = async (from, to) => {
	const { data, error } = await supabase
		.from("messages")
		.select("id, message, sender, created_at, updated_at, users")
		.or(
			`and(users->>0.eq.${from},users->>1.eq.${to}),and(users->>0.eq.${to},users->>1.eq.${from})`
		)
		.order("created_at", { ascending: true });

	if (error) throw error;
	return data;
};

// Create a new message
const createMessage = async (from, to, messageText) => {
	const { data, error } = await supabase
		.from("messages")
		.insert([
			{
				message: messageText,
				users: [from, to],
				sender: from,
			},
		])
		.select()
		.single();

	if (error) throw error;
	return data;
};

module.exports = {
	getMessages,
	getMessagesBetweenUsers,
	createMessage,
};
