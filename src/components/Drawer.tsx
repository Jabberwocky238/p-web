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
import { SETTINGS } from '../core/route';

interface Props {
    toggleDrawer: (newOpen: boolean) => () => void;
}

export default function DrawerList({ toggleDrawer }: Props) {
    return (
        <Box sx={{ width: 250 }} role="presentation">
            <List>
                {SETTINGS.map((obj, index) => (
                    <ListItem key={obj.name} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                            {/* <ListItemText primary={obj.name} onClick={() => {
                                window.location.href = "/#" + obj.link;
                                toggleDrawer(false)
                            }} /> */}
                            <Link
                                href={obj.link}
                            >
                                {obj.name}
                            </Link>
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
            </List>
        </Box>
    );
}