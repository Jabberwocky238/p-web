import { useEffect, useLayoutEffect, useState } from "react";

import { Link, Redirect, Route, Router, Switch, useRouter } from "wouter";
import ButtonAppBar from "./components/TopBar";
import { Drawer } from "@mui/material";
import DrawerList from "./components/Drawer";
import Playlist from "./components/Playlist";
import { useHashLocation } from "wouter/use-hash-location";
import Settings from "./components/Settings";
const API_BASE_URL = process.env.BACKEND_API;

import { ThemeProvider, createTheme } from '@mui/material';
import Import from "./components/Import";

const theme = createTheme({
	colorSchemes: {
		dark: true,
	},
});

function App() {
	// const [tracks, setTracks] = useState<any[]>();
	const [open, setOpen] = useState(false);

	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
		// Notification.requestPermission().then(function (result) {
		// 	if (result === "granted") {
		// 		randomNotification();
		// 	}
		// });
	};

	return (
		<>
			<ThemeProvider theme={theme}>
				<Router hook={useHashLocation}>
					<ButtonAppBar
						toggleDrawer={toggleDrawer}
					/>
					<Drawer open={open} onClose={toggleDrawer(false)}>
						<DrawerList toggleDrawer={toggleDrawer} />
					</Drawer>
					<Switch >
						<Route path="/playlist">
							<Playlist />
						</Route>
						<Route path="/setting">
							<Settings />
						</Route>
						<Route path="/import">
							<Import />
						</Route>
						<Redirect to="/playlist" replace />
					</Switch>
				</Router>
			</ThemeProvider>
		</>
	);
}

export default App;

