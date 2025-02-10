import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Link } from 'wouter';
import { useEffect } from 'react';

interface Props {
    toggleDrawer: (newOpen: boolean) => () => void;
}

interface PlaylistObject {
    uuid: string;
    name: string;
}

export default function DrawerList({ toggleDrawer }: Props) {
    const [playlistUUIDs, setPlaylistUUIDs] = React.useState<PlaylistObject[]>([]);
    useEffect(() => {
        fetch(`/playlist.json`)
            .then(res => res.json())
            .then((data: PlaylistObject[]) => {
                setPlaylistUUIDs(data);
            });
    }, []);

    return (
        <Box sx={{ width: 250 }} role="presentation" onClick={() => toggleDrawer(false)}>
            <List>
                {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem key={"addPlaylist"} disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        {/* <ListItemText primary={text} /> */}
                        <Link
                            href={`/`}
                        >
                            New Playlist
                        </Link>
                    </ListItemButton>
                </ListItem>
                {playlistUUIDs.map((playlist, index) => (
                    <ListItem key={playlist.uuid} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                            {/* <ListItemText primary={text} /> */}
                            <Link
                                href={`/playlist/${playlist.uuid}`}
                            >
                                {playlist.name}
                            </Link>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}