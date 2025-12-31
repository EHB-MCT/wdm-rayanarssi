import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Flex, HStack, Link, Heading } from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ children }) {
	const navigate = useNavigate();
	const { isAuthenticated, isAdmin, isClient, loading } = useAuth();

	if (loading) {
		return (
			<Box className="layout-root">
				<header className="layout-navbar">
					<Flex className="layout-navbar-inner">
						<Heading className="layout-logo" onClick={() => navigate("/home")}>
							StreetLab Store
						</Heading>
					</Flex>
				</header>
				<Box className="layout-content">{children}</Box>
			</Box>
		);
	}

	return (
		<Box className="layout-root">
			<header className="layout-navbar">
				<Flex className="layout-navbar-inner">
					<Heading className="layout-logo" onClick={() => navigate("/home")}>
						StreetLab Store
					</Heading>

					<HStack className="layout-nav-links">
						{/* Shop - visible to everyone */}
						<Link as={RouterLink} to="/home" className="layout-nav-link">
							Shop
						</Link>

						{/* Profile - visible only to logged-in users (both client and admin) */}
						{isAuthenticated && (
							<Link as={RouterLink} to="/profile" className="layout-nav-link">
								Profile
							</Link>
						)}

						{/* Admin - visible only to logged-in admins */}
						{isAdmin && (
							<Link as={RouterLink} to="/admin" className="layout-nav-link">
								Admin
							</Link>
						)}
					</HStack>
				</Flex>
			</header>

			<Box className="layout-content">{children}</Box>
		</Box>
	);
}
