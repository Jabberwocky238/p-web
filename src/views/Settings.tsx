import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import { Box, Button, Stack, TextField } from '@mui/material';
import { criticalRemoveEverything } from '@/core/indexedDB';

const AbleBtn = () => {
    return <Avatar><ImageIcon /></Avatar>;
}

const StateBtn = () => {
    return <Avatar><WorkIcon /></Avatar>;
}

const DeleteBtn = () => {
    return <Avatar><WorkIcon /></Avatar>;
}

export default function Settings() {
    return (
        <Stack spacing={2} direction="column">
            <List sx={{ bgcolor: 'background.paper' }}>
                {/* <Button variant="contained" endIcon={<AddCircleOutline />}>Three</Button> */}
                <ListItem>
                    <ListItemAvatar>
                        <AbleBtn />
                    </ListItemAvatar>
                    <ListItemAvatar>
                        <StateBtn />
                    </ListItemAvatar>
                    <TextField
                        required
                        id="outlined-required"
                        label="Required"
                        value={process.env.BACKEND_API!}
                        onChange={() => { }}
                    />
                    {/* <ListItemAvatar>
                        <DeleteBtn />
                    </ListItemAvatar> */}
                </ListItem>
                {/* <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <WorkIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Work" secondary="Jan 7, 2014" />
            </ListItem>
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <BeachAccessIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Vacation" secondary="July 20, 2014" />
            </ListItem> */}
            </List>
            <Button variant="contained" color='error' endIcon={<ImageIcon />}
                onClick={() => {
                    criticalRemoveEverything();
                }}
            >清理所有缓存内容</Button>
        </Stack>
    );
}
