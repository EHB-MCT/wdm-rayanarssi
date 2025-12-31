const express = require("express");
const app = express();
const cors = require("cors");
const uuid = require("uuid-v4");
const bcrypt = require("bcrypt");

const { MongoClient } = require("mongodb");
const { seedDatabase } = require("./seed");
const client = new MongoClient(process.env.MONGODB_URI);
const jwt = require("jsonwebtoken");
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://192.168.0.152:5173', 'http://0.0.0.0:5173'],
    credentials: true
}));
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
			type: 1, // standaard klant
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
				expiresIn: "30d",
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
	console.log("Received token:", token); // Debugging line
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

const getUserFromToken = async (token) => {
	const userData = jwt.decode(token); // { id: ... }
	if (!userData || !userData.id) return null;

	await client.connect();
	const db = client.db("dev5");
	const usersCollection = db.collection("users");
	const user = await usersCollection.findOne({ id: userData.id });
	return user;
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

		const { category, brand, sort } = req.query;

		const query = {};

		// Filter op categorie
		if (category && category !== "all") query.category = category;

		// Filter op merk
		if (brand && brand !== "all") query.brand = brand;

		// sorteeropties
		let sortOption = {};

		// Sorting: price_asc, price_desc, newest
		if (sort === "price_asc") {
			sortOption = { price: 1 };
		} else if (sort === "price_desc") {
			sortOption = { price: -1 };
		} else if (sort === "newest") {
			sortOption = { createdAt: -1 };
		} else {
			// default: naam oplopend
			sortOption = { name: 1 };
		}

		const products = await productsCollection
			.find(query)
			.sort(sortOption)
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

app.get("/product/:id", async (req, res) => {
	try {
		await client.connect();
		const db = client.db("dev5");
		const productsCollection = db.collection("products");

		const { id } = req.params;

		const query = { _id: id };

		const product = await productsCollection.findOne(query);

		if (!product) {
			return res.status(404).json({
				status: 404,
				error: "Product niet gevonden",
			});
		}

		return res.status(200).json({
			status: 200,
			product,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			status: 500,
			error: "Kon product niet ophalen",
			value: err,
		});
	}
});

app.put("/products/:id/stock", checkToken, async (req, res) => {
	const token = req.headers["token"];
	const { id } = req.params;
	const { stock } = req.body;

	try {
		const user = await getUserFromToken(token);

		// check of user admin is
		if (!user || user.type !== 0) {
			return res.status(403).json({
				status: 403,
				error: "Toegang geweigerd: enkel admin kan stock aanpassen",
			});
		}

		// check stock value
		const parsedStock = Number(stock);
		if (Number.isNaN(parsedStock) || parsedStock < 0) {
			return res.status(400).json({
				status: 400,
				error: "Stock moet een positief getal zijn",
			});
		}

		await client.connect();
		const db = client.db("dev5");
		const productsCollection = db.collection("products");

		const result = await productsCollection.updateOne(
			{ _id: id },
			{ $set: { stock: parsedStock } }
		);

		if (!result.matchedCount) {
			return res.status(404).json({
				status: 404,
				error: "Product niet gevonden",
			});
		}

		return res.status(200).json({
			status: 200,
			message: "Stock succesvol aangepast",
			productId: id,
			stock: parsedStock,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			error: "Kon stock niet updaten",
			value: err,
		});
	}
});

// Product aan mandje toevoegen
app.post("/cart/:productId", checkToken, async (req, res) => {
	const { productId } = req.params;
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
		const existingItem = await cartCollection.findOne({
			userId,
			productId,
		});

		if (existingItem) {
			await cartCollection.updateOne(
				{ _id: existingItem._id },
				{ $inc: { quantity: 1 } }
			);
		} else {
			await cartCollection.insertOne({
				_id: uuid(), // eigen id voor cart-item
				userId,
				productId: productId,
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
app.get("/cart", checkToken, async (req, res) => {
	const token = req.headers["token"];
	const userData = jwt.decode(token);
	const userId = userData?.id;

	try {
		await client.connect();
		const db = client.db("dev5");
		const cartCollection = db.collection("cart_items");
		const productsCollection = db.collection("products");
		const cart = await cartCollection.find({ userId }).toArray();
		const cartWithProducts = await Promise.all(
			cart.map(async (item) => {
				const productData = await productsCollection.findOne({
					_id: item.productId,
				});

				return {
					cartItemId: item._id,
					product: productData,
					quantity: item.quantity,
				};
			})
		);

		return res.status(200).json({
			status: 200,
			cart: cartWithProducts,
		});
	} catch (err) {
		return res.status(500).json({
			status: 500,
			error: "Kon mandje niet ophalen",
			value: err,
		});
	}
});

// Item uit mandje verwijderen
app.delete("/cart/:id", checkToken, async (req, res) => {
	const itemId = req.params.id;
	const token = req.headers["token"];
	try {
		await client.connect();
		const db = client.db("dev5");
		const cartCollection = db.collection("cart_items");

		const item = await cartCollection.findOne({ _id: itemId });

		const quantity = item.quantity;

		if (quantity > 1) {
			await cartCollection.updateOne(
				{ _id: itemId },
				{ $inc: { quantity: -1 } }
			);
		} else {
			await cartCollection.deleteOne({ _id: itemId });
		}

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

// Bestelling aanmaken (checkout)
app.post("/checkout", checkToken, async (req, res) => {
	const token = req.headers["token"];
	const userData = jwt.decode(token);
	const userId = userData?.id;

	const { items, total } = req.body;

	if (!items.length || !total) {
		return res.status(400).json({
			status: 400,
			error: "Ontbrekende velden",
		});
	}

	try {
		await client.connect();
		const db = client.db("dev5");

		const checkoutCollection = db.collection("checkout");
		const cartCollection = db.collection("cart_items");

		// Bestelling opslaan
		const order = {
			_id: uuid(),
			userId,
			items,
			total,
			createdAt: new Date(),
		};

		await checkoutCollection.insertOne(order);

		// Mandje leegmaken
		await cartCollection.deleteMany({ userId });

		return res.json({
			status: 200,
			message: "Bestelling succesvol geplaatst",
			order,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Kon bestelling niet opslaan" });
	}
});

app.post("/events", checkToken, async (req, res) => {
	const token = req.headers["token"];
	const userData = jwt.decode(token);
	const userId = userData?.id;
	const { type, timestamp, productId } = req.body;
	try {
		await client.connect();
		const db = client.db("dev5");
		const eventsCollection = db.collection("events");
		await eventsCollection.insertOne({
			userId,
			type,
			timestamp,
			productId,
		});

		return res.status(200).json({
			status: 200,
			message: "Event succesvol opgeslagen",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			error: "Kon event niet opslaan",
		});
	}
});

app.get("/events", checkToken, async (req, res) => {
	try {
		await client.connect();
		const db = client.db("dev5");
		const eventsCollection = db.collection("events");
		const events = await eventsCollection.find({}).toArray();
		return res.status(200).json({
			status: 200,
			events,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			error: "Kon event niet opslaan",
		});
	}
});

// Bestelgeschiedenis ophalen
app.get("/orders/history", checkToken, async (req, res) => {
	const token = req.headers["token"];
	const userData = jwt.decode(token);
	const userId = userData?.id;

	try {
		await client.connect();
		const db = client.db("dev5");
		const ordersCollection = db.collection("checkout");

		const orders = await ordersCollection
			.find({ userId })
			.sort({ createdAt: -1 })
			.toArray();

		return res.json({
			status: 200,
			orders,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			error: "Kon bestelgeschiedenis niet ophalen",
		});
	}
});

app.get("/adminprofile", checkToken, async (req, res) => {
	const token = req.headers["token"];
	const userData = jwt.decode(token);
	const userId = userData?.id;

	try {
		await client.connect();
		const db = client.db("dev5");
		const ordersCollection = db.collection("checkout");
		const usersCollection = db.collection("users");
		const eventsCollection = db.collection("events");
		const productsCollection = db.collection("products");

		const user = await usersCollection.findOne({ id: userId });
		if (!user || user.type !== 0) {
			return res.status(403).json({
				status: 403,
				error: "Toegang geweigerd",
			});
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0); // 00:00:00 start of today

		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1); // next day 00:00:00

		const totalUsers = await usersCollection.countDocuments({});
		const totalOrders = await ordersCollection.countDocuments({});
		const totalRevenue = await ordersCollection
			.aggregate([
				{ $group: { _id: null, total: { $sum: "$total" } } },
				{ $limit: 1 },
			])
			.next();
		const totalEvents = await eventsCollection.countDocuments();

		// Calculate most viewed products
		const productViews = await eventsCollection
			.aggregate([
				{ $match: { type: "product_view", productId: { $exists: true } } },
				{
					$group: {
						_id: "$productId",
						views: { $sum: 1 },
					},
				},
				{ $sort: { views: -1 } },
				{ $limit: 10 },
			])
			.toArray();

		// Calculate add to cart events
		const addToCartEvents = await eventsCollection
			.aggregate([
				{ $match: { type: "add_to_cart", productId: { $exists: true } } },
				{
					$group: {
						_id: "$productId",
						addToCart: { $sum: 1 },
					},
				},
			])
			.toArray();

		// Create maps for quick lookup
		const viewsMap = {};
		productViews.forEach((p) => {
			viewsMap[p._id] = p.views;
		});

		const cartMap = {};
		addToCartEvents.forEach((c) => {
			cartMap[c._id] = c.addToCart;
		});

		// Get product details for top viewed products
		const topProducts = await Promise.all(
			productViews.map(async (p) => {
				const product = await productsCollection.findOne({ _id: p._id });
				return {
					productId: p._id,
					name: product ? product.name : "Unknown Product",
					views: p.views,
					addToCart: cartMap[p._id] || 0,
				};
			})
		);

		const eventsPerUser = await eventsCollection
			.aggregate([
				{
					$group: {
						_id: "$userId",
						eventsCount: { $sum: 1 },
					},
				},
			])
			.toArray();

		const eventsMap = {};
		eventsPerUser.forEach((e) => {
			eventsMap[e._id] = e.eventsCount;
		});

		const allUsers = await usersCollection.find({ type: { $ne: 0 } }).toArray();

		const ordersPerUser = await ordersCollection
			.aggregate([
				{
					$group: {
						_id: "$userId",
						orderCount: { $sum: 1 },
					},
				},
			])
			.toArray();

		const ordersMap = {};
		ordersPerUser.forEach((o) => {
			ordersMap[o._id] = o.orderCount;
		});

		const usersWithStats = allUsers.map((u) => ({
			id: u.id,
			username: u.username,
			email: u.email,
			eventsCount: eventsMap[u.id] || 0,
			loginCount: u.amountOfLogins || 0,
			orderCount: ordersMap[u.id] || 0,
		}));

		return res.json({
			status: 200,
			totalUsers,
			totalOrders,
			totalRevenue: totalRevenue ? totalRevenue.total : 0,
			totalEvents,
			topProducts,
			users: usersWithStats,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			error: "Kon admin data niet ophalen",
		});
	}
});

// Start server with automatic database seeding
async function startServer() {
	try {
		// Auto-seed database before starting server
		console.log('🌱 Checking database for initial data...');
		await seedDatabase();
		console.log('✅ Database check completed');
		
		// Start the server after seeding
		app.listen(process.env.PORT, () => {
			console.log(`🚀 Server is running on port ${process.env.PORT}`);
		});
	} catch (error) {
		console.error('❌ Failed to start server:', error);
		process.exit(1);
	}
}

// Start the server
startServer();
