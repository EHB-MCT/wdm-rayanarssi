// src/pages/ProductDetail.jsx
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  Badge,
  Stack,
  Select,
  Button,
  Alert,
} from "@chakra-ui/react";

function ProductDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // product komt rechtstreeks uit Home via navigate state
  const productFromState = location.state?.product || null;

  const [product] = useState(productFromState);
  const [size, setSize] = useState(
    product?.sizes && product.sizes.length > 0
      ? String(product.sizes[0])
      : ""
  );
  const [feedback, setFeedback] = useState("");

  // Als er geen product in state zit (bv. user typt URL handmatig)
  if (!product) {
    return (
      <Alert status="error" mt={4}>
        Geen productdata beschikbaar. Ga terug naar de shop en klik op een item.
      </Alert>
    );
  }

  const handleAddToCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!size) {
      setFeedback("Kies eerst een maat aub.");
      return;
    }

    try {
      setFeedback("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token,
          },
          body: JSON.stringify({
            productId: product._id,
            size,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kon product niet toevoegen aan mandje");
      }

      setFeedback("Toegevoegd aan je mandje ✅");
    } catch (err) {
      console.error(err);
      setFeedback(err.message || "Er ging iets mis");
    }
  };

  return (
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

          {product.sizes && product.sizes.length > 0 && (
            <Box mt={4}>
              <Text mb={1} fontWeight="semibold">
                Kies je maat
              </Text>
              <Select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                maxW="200px"
                bg="gray.800"
                borderColor="whiteAlpha.300"
              >
                {product.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Box>
          )}

          <Stack direction="row" mt={6} spacing={4}>
            <Button colorScheme="teal" onClick={handleAddToCart}>
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
  );
}

export default ProductDetail;
