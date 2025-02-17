export default function Settings() {
    return (
        <div>
            <h1>Settings</h1>
            <FolderList />
        </div>
    );
}

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { Box, Button, TextField } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';

const AbleBtn = () => {
    return <Avatar><ImageIcon /></Avatar>;
}

const StateBtn = () => {
    return <Avatar><WorkIcon /></Avatar>;
}

const DeleteBtn = () => {
    return <Avatar><WorkIcon /></Avatar>;
}

function FolderList() {
    return (
        <Box sx={{ width: '100%' }}>
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
                        value={'localhost:3000'}
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
        </Box>
    );
}
