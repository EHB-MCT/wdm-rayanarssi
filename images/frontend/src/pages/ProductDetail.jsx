// src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, data } from "react-router-dom";
import {
	Box,
	Flex,
	Image,
	Heading,
	Text,
	Badge,
	Stack,
	Button,
	Alert,
} from "@chakra-ui/react";
import { addToCart } from "../helpers/helpers";

function ProductDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const [loading, setLoading] = useState(true);
	const [product, setProduct] = useState(null);

	useEffect(() => {
		setLoading(true);
		fetch(`http://localhost:3000/product/${id}`)
			.then((res) => res.json())
			.then((data) => {
				setProduct(data.product);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Error fetching product:", err);
				setLoading(false);
			});
	}, [id]);

	// product komt rechtstreeks uit Home via navigate state

	const [feedback, setFeedback] = useState("");

	const handleAddToCart = async () => {
		if (!token) {
			navigate("/login");
			return;
		}

		try {
			await addToCart(token, id, data.size);
			setFeedback("Product toegevoegd aan mandje!");
		} catch (err) {
			setFeedback("Kon product niet toevoegen aan mandje.");
		}
	};

	if (loading) {
		return <Text mt={4}>Laden...</Text>;
	}

	if (!product) {
		return (
			<Alert status="error" mt={4}>
				Geen productdata beschikbaar. Ga terug naar de shop en klik op een item.
			</Alert>
		);
	}

	return (
		<>
			<Box>
				{product.stock < 3 && product.stock > 0 && (
					<Alert indicator status="warning" background={"orange"} mt={2}>
						Deze artikel is bijna uitverkocht!
					</Alert>
				)}

				{product.stock === 0 && (
					<Alert indicator status="error" background={"red"} mt={2}>
						Deze artikel is uitverkocht!
					</Alert>
				)}
			</Box>
			<Flex gap={10} direction={{ base: "column", md: "row" }} mt={4}>
				<Box flex="1">
					<Image
						src={product.image}
						alt={product.name}
						borderRadius="lg"
						w="100%"
						objectFit="cover"
						boxShadow="lg"
					/>
				</Box>

				<Box flex="1">
					<Stack spacing={3}>
						<Heading size="lg">{product.name}</Heading>

						<Stack direction="row" spacing={3}>
							<Badge colorScheme="teal">{product.category}</Badge>
							{product.brand && (
								<Badge variant="outline">{product.brand}</Badge>
							)}
						</Stack>

						{product.color && (
							<Text fontSize="sm" color="gray.300">
								Kleur: <strong>{product.color}</strong>
							</Text>
						)}

						<Heading size="md">€ {Number(product.price).toFixed(2)}</Heading>

						{product.description && (
							<Text mt={2} fontSize="md" color="gray.200">
								{product.description}
							</Text>
						)}

						<Heading size="md">Maat</Heading>

						<Text>{product.size}</Text>

						<Stack direction="row" mt={6} spacing={4}>
							<Button
								colorScheme="teal"
								onClick={handleAddToCart}
								disabled={!product.stock}
							>
								Voeg toe aan mandje
							</Button>
							<Button variant="outline" onClick={() => navigate("/home")}>
								Verder shoppen
							</Button>
						</Stack>

						{feedback && (
							<Text mt={2} fontSize="sm" color="teal.200">
								{feedback}
							</Text>
						)}
					</Stack>
				</Box>
			</Flex>
		</>
	);
}

export default ProductDetail;
