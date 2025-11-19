const express = require("express");
const app = express();
const cors = require("cors");
const uuid = require("uuid-v4");
const bcrypt = require("bcrypt");

const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);
const jwt = require("jsonwebtoken");
app.use(express.json());
app.use(cors());
require("dotenv").config();

app.post("/register", async (req, res) => {
	const body = req.body;
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	const email = body.email;
	if (!email || !body.password || !body.username) {
		return res.status(400).json({
			error: "Gelieve de ontbrekende velden in te vullen",
			status: 400,
		});
	}
	if (email.match(emailRegex) == null) {
		return res
			.status(400)
			.json({ error: "Voer een geldig e-mailadres in", status: 400 });
	}

	try {
		await client.connect();
		const db = client.db("dev5").collection("users");

		const query = {
			email,
		};

		const existingUser = await db.findOne(query);

		if (existingUser) {
			return res.status(400).send({
				error: "Gebruiker met dit e-mailadres bestaat al",
				status: 400,
			});
		}

		const newUser = {
			id: uuid(),
			username: body.username,
			email: body.email,
			password: await bcrypt.hash(body.password, 10),
			amountOfLogins: 0,
		};
		await db.insertOne(newUser);
		return res
			.status(200)
			.json({ message: "Account succesvol aangemaakt", status: 200 });
	} catch (err) {
		res.status(500).send({
			error: "An error has occured",
			value: err,
		});
	}
});

app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res
			.status(400)
			.json({ error: "Gelieve de ontbrekende velden in te vullen" });
	}

	try {
		await client.connect();
		const db = client.db("dev5").collection("users");
		const query = {
			email,
		};

		const user = await db.findOne(query);
		const checkPassword = await bcrypt.compare(password, user.password);
		if (!user || !checkPassword) {
			return res.status(400).send({
				message: "Onjuiste gebruikersnaam of wachtwoord",
				status: 403,
			});
		}

		const token = jwt.sign(
			{
				id: user.id,
			},
			process.env.ACCES_TOKEN_SECRET,
			{
				algorithm: "HS256",
				expiresIn: "1d",
			}
		);

		await db.updateOne({ id: user.id }, { $inc: { amountOfLogins: 1 } });

		res.status(200).send({
			message: "Succesvol ingelogd",
			status: 200,
			token,
		});
	} catch (err) {
		res.status(500).send({
			error: "An error has occured",
			value: err,
		});
	}
});

// Middleware to check token if user is authenticated
const checkToken = (req, res, next) => {
	const token = req.headers["token"];
	if (token) {
		try {
			jwt.verify(token, process.env.ACCES_TOKEN_SECRET);
			next();
		} catch (err) {
			return res.status(410).send({
				error: "Invalid token",
				status: 410,
			});
		}
	} else {
		return res.status(401).send({
			error: "Unauhtorized",
			status: 401,
		});
	}
};

app.get("/profile", checkToken, async (req, res) => {
	const token = req.headers["token"];
	const userData = jwt.decode(token);

	try {
		await client.connect();
		const db = client.db("dev5").collection("users");
		const query = { id: userData.id };
		const user = await db.findOne(query);
		res.json({
			user,
			status: 200,
		});
	} catch (err) {
		res.status(500).send({
			error: "An error has occured",
			value: err,
		});
	}
});

app.get("/products", async (req, res) => {
	try {
		await client.connect();
		const db = client.db("dev5");
		const productsCollection = db.collection("products");

		const { category, color, brand, minPrice, maxPrice, search, sort } =
			req.query;

		const query = {};

		// simpele filters
		if (category && category !== "all") query.category = category;
		if (color && color !== "all") query.color = color;
		if (brand) query.brand = { $regex: brand, $options: "i" };

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ brand: { $regex: search, $options: "i" } },
			];
		}

		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = Number(minPrice);
			if (maxPrice) query.price.$lte = Number(maxPrice);
		}

		// sorteeropties
		let sortObj = { name: 1 };
		switch (sort) {
			case "name_desc":
				sortObj = { name: -1 };
				break;
			case "price_asc":
				sortObj = { price: 1 };
				break;
			case "price_desc":
				sortObj = { price: -1 };
				break;
		}

		const products = await productsCollection
			.find(query)
			.sort(sortObj)
			.toArray();

		return res.status(200).json({
			status: 200,
			products,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			status: 500,
			error: "Kon producten niet ophalen",
			value: err,
		});
	}
});

// Product aan mandje toevoegen
app.post("/cart/add", checkToken, async (req, res) => {
	const { productId } = req.body;

	if (!productId) {
		return res.status(400).json({
			status: 400,
			error: "productId is vereist",
		});
	}

	const token = req.headers["token"];
	const userData = jwt.decode(token); // { id: ... }
	const userId = userData?.id;

	if (!userId) {
		return res.status(401).json({
			status: 401,
			error: "Ongeldige gebruiker",
		});
	}

	try {
		await client.connect();
		const db = client.db("dev5");
		const cartCollection = db.collection("cart_items");
		const productsCollection = db.collection("products");

		// check of product bestaat
		const product = await productsCollection.findOne({ _id: productId });
		if (!product) {
			return res.status(404).json({
				status: 404,
				error: "Product niet gevonden",
			});
		}

		// als item al in mandje zit → quantity +1
		const existingItem = await cartCollection.findOne({ userId, productId });

		if (existingItem) {
			await cartCollection.updateOne(
				{ _id: existingItem._id },
				{ $inc: { quantity: 1 } }
			);
		} else {
			await cartCollection.insertOne({
				_id: uuid(), // eigen id voor cart-item
				userId,
				productId,
				quantity: 1,
				addedAt: new Date(),
			});
		}

		return res.status(200).json({
			status: 200,
			message: "Product toegevoegd aan mandje",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			error: "Er ging iets mis bij het toevoegen aan het mandje",
			value: err,
		});
	}
});

// Mandje ophalen voor ingelogde gebruiker
app.get("/cart/get", checkToken, async (req, res) => {
	const token = req.headers["token"];
	const userData = jwt.decode(token);
	const userId = userData?.id;

	try {
		await client.connect();
		const db = client.db("dev5");
		const cartCollection = db.collection("cart_items");
		const productsCollection = db.collection("products");

		// Alle cart_items voor deze gebruiker
		const items = await cartCollection.find({ userId }).toArray();

		// Product info eraan koppelen
		const detailedItems = [];

		for (const item of items) {
			const product = await productsCollection.findOne({ _id: item.productId });
			if (product) {
				detailedItems.push({
					...item,
					product,
				});
			}
		}

		return res.status(200).json({
			status: 200,
			cart: detailedItems,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			error: "Kon mandje niet ophalen",
			value: err,
		});
	}
});

// Item uit mandje verwijderen
app.delete("/cart/remove/:id", checkToken, async (req, res) => {
	const itemId = req.params.id;
	const token = req.headers["token"];
	const userData = jwt.decode(token);
	const userId = userData?.id;

	try {
		await client.connect();
		const db = client.db("dev5");
		const cartCollection = db.collection("cart_items");

		const item = await cartCollection.findOne({ _id: itemId });

		if (!item) {
			return res.status(404).json({
				status: 404,
				error: "Item niet gevonden",
			});
		}

		// extra check: item moet van deze user zijn
		if (item.userId !== userId) {
			return res.status(403).json({
				status: 403,
				error: "Je mag dit item niet verwijderen",
			});
		}

		await cartCollection.deleteOne({ _id: itemId });

		return res.status(200).json({
			status: 200,
			message: "Item verwijderd uit mandje",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			error: "Kon item niet verwijderen",
			value: err,
		});
	}
});


app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
