import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Link, useLocation } from 'wouter';
import { Button, ListItemText } from '@mui/material';
import { BUS } from '@/core/bus';
import EditIcon from '@mui/icons-material/Edit';
import React from 'react';
import NewPlaylistModal from '@@/NewPlaylistModal';
import { LOCAL_PLAYLIST_UUID, Playlist } from '@/core/models/playlist';
import DrawerItem from '@/components/DrawerItem';


export const SETTINGS = [
    {
        name: "Import",
        link: "/import/",
    },
    {
        name: "Local",
        link: "/playlist/",
    },
    {
        name: "Global",
        link: "/global/",
    },
    {
        name: "Settings",
        link: "/settings/",
    }
]

export default function DrawerList() {
    const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
    const [location, navigate] = useLocation();

    const closeDrawer = () => {
        BUS.emit("toggleDrawer", { state: false });
    }

    React.useEffect(() => {
        (async () => {
            const playlists = await Playlist.getAllPlaylist();
            setPlaylists(playlists.filter(p => p.uuid !== LOCAL_PLAYLIST_UUID));
        })();
    }, []);

    return (
        <>
            <Box sx={{ width: 250 }} role="presentation">
                <List>
                    {SETTINGS.map((obj, index) => (
                        <DrawerItem key={obj.name}
                            icon={index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            onClick={() => {
                                closeDrawer();
                                navigate(obj.link);
                            }} >
                            <ListItemText primary={obj.name} />
                        </DrawerItem>
                    ))}
                </List>
                <Divider />
                <List>
                    {playlists.map((obj) => (
                        <DrawerItem key={obj.uuid} icon={<ListItemIcon />} onClick={() => {
                            closeDrawer();
                            navigate(`/playlist/${obj.uuid}`);
                        }} >
                            <ListItemText primary={obj.title} />
                        </DrawerItem>
                    ))}
                </List>
            </Box>
        </>
    );
}
