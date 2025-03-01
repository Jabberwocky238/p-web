import { useEffect } from "react";
import { Redirect, Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useDB } from "./core/indexedDB";
import { SnackbarProvider } from 'notistack';
import Layout from "./components/Layout";
import { MeucContextProvider } from "@/context/MeucContext";
import { ThemeProvider, createTheme } from '@mui/material/styles';

function Warp({ children }: { children: React.ReactNode }) {
	return (
		<SnackbarProvider maxSnack={3}>
			{children}
		</SnackbarProvider>
	);
}

// Create a dark theme
const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		background: {
			default: '#121212',
			paper: '#1e1e1e',
		},
		text: {
			primary: '#ffffff',
			secondary: '#b0b0b0',
		},
	},
});

export default function App() {
	useEffect(() => {
		(async () => {
			await useDB();
		})();
	}, []);

	return (
		<Warp>
			<ThemeProvider theme={darkTheme}>
				<MeucContextProvider>
					<Router hook={useHashLocation}>
						<Layout>
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
						</Layout>
					</Router>
				</MeucContextProvider>
			</ThemeProvider>
		</Warp>
	);
}

import Import from "@/views/Import";
import Playlist from "@/views/Playlist";
import MusicDetail from "@/views/Music";
import Settings from "@/views/Settings";
import Global from "./views/Global";

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
];