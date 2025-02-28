
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { Playlist } from '../core/models/playlist';
import { generateUUIDv4 } from '../core/utils';
import { Notify } from '@/core/notify';

export default function PlaylistSettingNew() {
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleCommit = async (name: string) => {
        if (name === "") {
            Notify.error("Playlist Name cannot be empty");
            return;
        }
        const playlist = Playlist.fromParams({
            uuid: generateUUIDv4(),
            title: name,
            contains: [],
        });
        await playlist.update();
    }

    return (
        <>
            <Button sx={{
                width: '100%',
            }} variant="contained" onClick={handleOpen}>
                New Playlist
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries((formData as any).entries());
                            handleCommit(formJson['New Playlist Name']);
                            handleClose();
                        },
                    },
                }}
            >
                <DialogTitle>New Playlist</DialogTitle>
                <DialogContent>
                    {/* <DialogContentText>
                        To subscribe to this website, please enter your email address here. We
                        will send updates occasionally.
                    </DialogContentText> */}
                    <TextField
                        autoFocus
                        required
                        label="New Playlist Name"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Commit</Button>
                </DialogActions>
            </Dialog>
        </>
    );

}