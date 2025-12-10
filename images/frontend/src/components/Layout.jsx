import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Flex, HStack, Link, Heading } from "@chakra-ui/react";

export default function Layout({ children }) {
	const navigate = useNavigate();

	return (
		<Box className="layout-root">
			<header className="layout-navbar">
				<Flex className="layout-navbar-inner">
					<Heading className="layout-logo" onClick={() => navigate("/home")}>
						StreetLab Store
					</Heading>

					<HStack className="layout-nav-links">
						<Link as={RouterLink} to="/home" className="layout-nav-link">
							Shop
						</Link>
						<Link as={RouterLink} to="/profile" className="layout-nav-link">
							Profile
						</Link>
						
						<Link as={RouterLink} to="/admin" className="layout-nav-link">
							Admin
						</Link>
					</HStack>
				</Flex>
			</header>

			<Box className="layout-content">{children}</Box>
		</Box>
	);
}
