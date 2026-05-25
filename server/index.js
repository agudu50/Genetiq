require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");

app.use(cors());
app.use(express.json());



app.get("/ping", (_req, res) => {
	return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve Static Files in Production
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

app.all(/^\/(?!api)/, (req, res) => {
	res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server is ready and running on port ${PORT}`));
const io = socket(server, {
	cors: {
		origin: "http://localhost:3000",
		credentials: true,
	},
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
	global.chatSocket = socket;
	socket.on("add-user", (userId) => {
		global.onlineUsers.set(userId, socket.id);
	});

	socket.on("send-msg", (data) => {
		const sendUserSocket = global.onlineUsers.get(data.to);
		if (sendUserSocket) {
			socket.to(sendUserSocket).emit("msg-recieve", data.msg);
		}
	});
});
