import { useEffect, useState } from "react";
import { Redirect, Route, Router, Switch } from "wouter";
import ButtonAppBar from "./views/TopBar";
import { Container, Drawer } from "@mui/material";
import DrawerList from "@/views/Drawer";
import { useHashLocation } from "wouter/use-hash-location";
import { ThemeProvider, createTheme } from '@mui/material';
import Player from "@/views/Player";
import { useDB } from "./core/indexedDB";
import { BUS, Handler } from "./core/bus";

import { SnackbarProvider, useSnackbar } from 'notistack';

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
	// const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		(async () => {
			await useDB();
		})();
		const toggle: Handler<'toggleDrawer'> = (payload) => {
			setOpen(payload.state);
		}
		BUS.on("toggleDrawer", toggle);

		// console.log("init Notify");
		// enqueueSnackbar("init Notify", { variant: "info" });

		return () => {
			BUS.off("toggleDrawer", toggle);
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
					<div style={{ flexGrow: 1 }}>
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
					</div>
					<Player />
				</Router>
			</Warp>
		</>
	);
}

import Import from "@/views/Import";
import Playlist from "@/views/Playlist";
import MusicDetail from "@/views/Music";
import Settings from "@/views/Settings";
import Global from "./views/Global";
import { Notify } from "./core/notify";

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
		name: "Global",
		link: "/global/*",
		component: <Global />,
	},
	{
		name: "Music",
		link: "/music/*",
		component: <MusicDetail />,
	},
	{
		name: "Settings",
		link: "/settings/",
		component: <Settings />,
	}
]