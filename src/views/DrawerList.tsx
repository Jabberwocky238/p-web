import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { useLocation } from 'wouter';
import { ListItemText } from '@mui/material';
import React from 'react';
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

    React.useEffect(() => {
        (async () => {
            const playlists = await Playlist.getAllPlaylist();
            setPlaylists(playlists.filter(p => p.uuid !== LOCAL_PLAYLIST_UUID));
        })();
    }, []);

    return (
        <>
            <Box role="presentation">
                <List>
                    {SETTINGS.map((obj, index) => (
                        <DrawerItem key={obj.name}
                            icon={index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            onClick={() => {
                                // setDrawer(false);
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
                            // setDrawer(false);
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
