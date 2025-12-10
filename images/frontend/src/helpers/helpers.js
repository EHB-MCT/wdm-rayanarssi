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
};
