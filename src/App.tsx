import { useEffect, useState } from "react";
import { Redirect, Route, Router, Switch } from "wouter";
import ButtonAppBar from "./components/TopBar";
import { Container, Drawer } from "@mui/material";
import DrawerList from "./components/Drawer";
import { useHashLocation } from "wouter/use-hash-location";
import { ThemeProvider, createTheme } from '@mui/material';
import Player from "./components/Player";
import { useDB } from "./core/indexedDB";
import { bus } from "./core/bus";

const API_BASE_URL = process.env.BACKEND_API;

import { SnackbarProvider } from 'notistack';

const theme = createTheme({
	colorSchemes: {
		dark: true,
	},
});

function Warp({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider theme={theme}>
			<SnackbarProvider maxSnack={3}>
				{children}
			</SnackbarProvider>
		</ThemeProvider>
	);
}


export default function App() {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		(async () => {
			await useDB();
		})();

		bus.on("toggleDrawer", (payload) => {
			setOpen(payload.state);
		});
		return () => {
			bus.off("toggleDrawer");
		}
	}, []);

	return (
		<>
			<Warp>
				<Router hook={useHashLocation}>
					<ButtonAppBar />
					<Drawer open={open} onClose={() => setOpen(false)}>
						<DrawerList />
					</Drawer>
					<Container sx={{ flexGrow: 1 }}>
						<Switch>
							{SETTINGS.map((obj) => (
								<Route path={obj.link} key={obj.name}>
									{obj.component}
								</Route>
							))}
							<Route>
								<Redirect to="/playlist/" />
							</Route>
						</Switch>
					</Container>
				</Router>
				<Player />
			</Warp>
		</>
	);
}

import Import from "./components/Import";
import Playlist from "./components/Playlist";
import MusicDetail from "./components/MusicDetail";

const SETTINGS = [
	{
		name: "Import",
		link: "/import/*",
		component: <Import />,
	},
	{
		name: "Playlist",
		link: "/playlist/*",
		component: <Playlist />,
	},
	{
		name: "Music",
		link: "/music/*",
		component: <MusicDetail />,
	},
]