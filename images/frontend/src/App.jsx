import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
	return (
		<Routes>
			{" "}
			<Route path="/" element={<Register />} />
			<Route path="/login" element={<Login />} />
			<Route path="/home" element={<Home />} />
			<Route path="/profile" element={<Profile />} />
		</Routes>
	);
}

export default App;
