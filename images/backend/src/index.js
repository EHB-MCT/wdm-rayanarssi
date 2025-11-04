const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const client = new MongoClient(process.env.MONGODB_URI);
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
	try {
		await client.connect();
		const collection = client.db("sample_mflix").collection("comments");
		const movies = await collection.find({}).toArray();
		res.status(200).json(movies);
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
