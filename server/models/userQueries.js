const supabase = require("../config/supabase");

// Get user by username
const findUserByUsername = async (username) => {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("username", username)
		.single();

	if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
	return data;
};

// Get user by email
const findUserByEmail = async (email) => {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("email", email)
		.single();

	if (error && error.code !== "PGRST116") throw error;
	return data;
};

// Get user by ID
const findUserById = async (id) => {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("id", id)
		.single();

	if (error && error.code !== "PGRST116") throw error;
	return data;
};

// Create new user
const createUser = async (username, email, password) => {
	const { data, error } = await supabase
		.from("users")
		.insert([
			{
				username,
				email,
				password,
				isAvatarImageSet: false,
				avatarImage: "",
			},
		])
		.select()
		.single();

	if (error) throw error;
	return data;
};

// Get all users except specified user
const getAllUsersExcept = async (userId) => {
	const { data, error } = await supabase
		.from("users")
		.select("id, email, username, avatarImage")
		.neq("id", userId);

	if (error) throw error;
	return data;
};

// Update user avatar
const updateUserAvatar = async (userId, image) => {
	const { data, error } = await supabase
		.from("users")
		.update({
			isAvatarImageSet: true,
			avatarImage: image,
		})
		.eq("id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

module.exports = {
	findUserByUsername,
	findUserByEmail,
	findUserById,
	createUser,
	getAllUsersExcept,
	updateUserAvatar,
};
