import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
	config: {
		initialColorMode: "dark",
		useSystemColorMode: false,
	},
	colors: {
		gray: {
			50: "#f9fafb",
			100: "#f3f4f6",
			200: "#e5e7eb",
			300: "#d1d5db",
			400: "#9ca3af",
			500: "#6b7280",
			600: "#4b5563",
			700: "#374151",
			800: "#1f2937",
			900: "#111827",
		},
	},
	components: {
		Select: {
			variants: {
				dark: {
					field: {
						bg: "#020617",
						borderColor: "#1f2937",
						color: "#e5e7eb",
						_hover: {
							borderColor: "#374151",
						},
						_focus: {
							borderColor: "#3b82f6",
							boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.5)",
						},
					},
					icon: {
						color: "#e5e7eb",
					},
				},
			},

			baseStyle: {
				field: {
					bg: "#020617",
					borderColor: "#1f2937",
					color: "#e5e7eb",
				},
				icon: {
					color: "#e5e7eb",
				},
			},
		},
	},

	styles: {
		global: {
			option: {
				bg: "#020617 !important",
				color: "#e5e7eb !important",
			},
			".chakra-select__wrapper": {
				select: {
					bg: "#020617 !important",
					color: "#e5e7eb !important",
					option: {
						bg: "#020617 !important",
						color: "#e5e7eb !important",
					},
				},
			},
		},
	},
});

export default customTheme;
