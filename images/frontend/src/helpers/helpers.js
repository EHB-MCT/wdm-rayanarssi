export const addToCart = async (token, productId, size) => {
	const res = await fetch(`http://localhost:3000/cart/${productId}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			token,
		},
		body: JSON.stringify({
			size,
		}),
	});
	const data = await res.json();
	console.log(data);
	if (data.status !== 200) {
		throw new Error(data.error || "Kon product niet toevoegen aan mandje");
	}

	// Track add to cart event
	try {
		await fetch(`http://localhost:3000/events`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				token,
			},
			body: JSON.stringify({
				type: "add_to_cart",
				timestamp: new Date().toISOString(),
				productId,
			}),
		});
	} catch (eventErr) {
		console.error("Failed to track add to cart event:", eventErr);
	}
};
