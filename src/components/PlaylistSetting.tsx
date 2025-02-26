
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { LOCAL_PLAYLIST_UUID, Playlist, PlaylistParams } from '../core/models/playlist';
import { generateUUIDv4 } from '../core/utils';
import { Notify } from '@/core/notify';
import ListItem from '@mui/material/ListItem';
import { Avatar, IconButton, List, ListItemAvatar, ListItemText, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlaylistContainModal from './PlaylistContainModal';

function NewPlaylist() {
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

const AvatarButton: React.FC<{
    onClick: () => void,
    icon: React.JSX.Element,
    disabled?: boolean
}> = ({ onClick, icon, disabled }) => {
    return (
        <ListItemAvatar sx={{ cursor: 'pointer' }}>
            <Avatar>
                <IconButton disabled={disabled ?? false} onClick={onClick} size="large">
                    {icon}
                </IconButton>
            </Avatar>
        </ListItemAvatar>
    );
}

interface SettingRemoteItemProps {
    playlist: PlaylistParams;
}

function PlaylistSettingItem({ playlist }: SettingRemoteItemProps) {
    const disabled = playlist.uuid === LOCAL_PLAYLIST_UUID;
    const secondary = () => {
        const musicCount = playlist.contains.length;
        if (playlist.uuid === LOCAL_PLAYLIST_UUID) {
            return `Local Storage: ${musicCount} musics`;
        }
        return `${musicCount} musics in playlist ${playlist.title}`;
    };

    const [open, setOpen] = React.useState<boolean>(false);

    const onChange = () => {
        setOpen(true);
    }
    const onDelete = async () => {
        const p = Playlist.fromParams(playlist);
        await p.delete();
    }
    return (
        <>
            <ListItem>
                <Tooltip placement="top-start" title={playlist.uuid}>
                    <ListItemText primary={playlist.title} secondary={secondary()} />
                </Tooltip>
                <AvatarButton disabled={disabled} onClick={onChange} icon={<EditIcon />} />
                <AvatarButton disabled={disabled} onClick={onDelete} icon={<DeleteIcon />} />
            </ListItem>
            <PlaylistContainModal
                open={open}
                handleClose={() => setOpen(false)}
                uuid={playlist.uuid}
            />
        </>
    )
}

export default function PlaylistSetting() {
    const [playlists, setPlaylists] = React.useState<Playlist[]>([]);

    React.useEffect(() => {
        Playlist.getAllPlaylist().then((ps) => {
            setPlaylists(ps);
        });
    }, []);

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <NewPlaylist />
            {playlists.map(item => (
                <PlaylistSettingItem
                    key={item.uuid}
                    playlist={item}
                />
            ))}
        </List>
    );
}
