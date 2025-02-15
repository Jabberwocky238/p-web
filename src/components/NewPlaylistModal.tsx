
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';
import { useDB } from '../core/indexedDB';
import { Playlist } from '../core/models/playlist';
import { generateUUIDv4 } from '../core/utils';

export default function NewPlaylistModal({ open, handleClose }: { open: boolean, handleClose: () => void }) {
    const [name, setName] = React.useState("");
    const { enqueueSnackbar } = useSnackbar();

    const handleCommit = async () => {
        if (name === "") {
            enqueueSnackbar("Playlist Name cannot be empty", { variant: 'error' });
            return;
        }
        console.log(name);
        const db = await useDB();
        const playlist = Playlist.fromParams({
            uuid: generateUUIDv4(),
            name,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: "1.0.0",
            contains: [],
        });
        await playlist.dumpToDB();

        handleClose();
        setName("");
        enqueueSnackbar("New Playlist Created", { variant: 'success' });
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleCommit}>Commit</Button>
            </DialogActions>
        </Dialog>
    );
}
