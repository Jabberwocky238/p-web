import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Link } from 'wouter';
import { ListItemText } from '@mui/material';
import { bus } from '../core/bus';

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
    return (
        <Box sx={{ width: 250 }} role="presentation">
            <List>
                {SETTINGS.map((obj, index) => (
                    <Link key={obj.name} href={obj.link} >
                        <ListItem key={obj.name} disablePadding onClick={() => {
                            bus.emit("toggleDrawer", { state: false });
                        }} >
                            <ListItemButton>
                                <ListItemIcon>
                                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                                </ListItemIcon>
                                <ListItemText primary={obj.name} />
                            </ListItemButton>
                        </ListItem>
                    </Link>
                ))}
            </List>
            <Divider />
            {/* <List>
                <ListItem key={"addPlaylist"} disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={text} />
                    </ListItemButton>
                </ListItem>
            </List> */}
        </Box>
    );
}