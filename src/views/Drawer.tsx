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
import { bus } from '@/core/bus';
import EditIcon from '@mui/icons-material/Edit';
import React from 'react';
import NewPlaylistModal from '@@/NewPlaylistModal';
import { Playlist } from '@/core/models/playlist';

export const SETTINGS = [
    {
        name: "Import",
        link: "/import/",
    },
    {
        name: "Playlist",
        link: "/playlist/",
    },
]

export default function DrawerList() {
    const [openModal, setOpenModal] = React.useState(false);
    const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
    const [location, navigate] = useLocation();

    const closeDrawer = () => {
        bus.emit("toggleDrawer", { state: false });
    }

    React.useEffect(() => {
        (async () => {
            const playlists = await Playlist.getAll();
            setPlaylists(playlists);
        })();
    }, [openModal]);

    return (
        <>
            <Box sx={{ width: 250 }} role="presentation">
                <List>
                    {SETTINGS.map((obj, index) => (
                        <ListItem key={obj.name} disablePadding onClick={() => {
                            closeDrawer();
                            navigate(obj.link);
                        }} >
                            <ListItemButton>
                                <ListItemIcon>
                                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                                </ListItemIcon>
                                <ListItemText primary={obj.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List>
                    <ListItem key={"addPlaylist"} disablePadding onClick={() => {
                        setOpenModal(true);
                    }} >
                        <ListItemButton>
                            <ListItemIcon>
                                <InboxIcon />
                            </ListItemIcon>
                            <ListItemText primary={"New Playlist"} />
                        </ListItemButton>
                    </ListItem>
                    {playlists.map((obj) => (
                        <ListItem key={obj.uuid} disablePadding onClick={() => {
                            closeDrawer();
                            navigate(`/playlist/${obj.uuid}`);
                        }} >
                            <ListItemButton>
                                <ListItemIcon>
                                    <EditIcon />
                                </ListItemIcon>
                                <ListItemText primary={obj.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
            <NewPlaylistModal open={openModal} handleClose={() => setOpenModal(false)} />
        </>
    );
}
