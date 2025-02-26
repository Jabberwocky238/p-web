import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, ListItemText, Stack, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { criticalRemoveEverything } from '@/core/indexedDB';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import { Remote, RemoteParams } from '@/core/models/remote';
import { useEffect, useState } from 'react';
import { generateUUIDv4 } from '@/core/utils';
import PlaylistSetting from '@/components/PlaylistSetting';
import RemoteSetting from '@/components/RemoteSetting';

export default function Settings() {
    return (
        <Stack spacing={2} direction="column">
            <RemoteSetting />
            <PlaylistSetting />
            <Button variant="contained" color='error' endIcon={<ImageIcon />}
                onClick={() => {
                    criticalRemoveEverything().then(() => {
                        window.location.href = '/';
                    });
                }}
            >
                删除所有数据库
            </Button>
        </Stack>
    );
}
