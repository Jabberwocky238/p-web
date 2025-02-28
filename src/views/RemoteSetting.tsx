import ListItem from '@/components/ListItem';
import { Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import { DEFAULT_REMOTE_UUID, Remote, RemoteParams } from '@/core/models/remote';
import { useEffect, useState } from 'react';
import { generateUUIDv4 } from '@/core/utils';
import ListItemText from '@/components/ListItemText';
import AvatarButton from '@/components/AvatarButton';

interface ModalProps {
    open: boolean,
    handleClose: () => void,
    onSubmit: (data: {
        name: string
        url: string
    }) => void
    defaults?: {
        name: string
        url: string
    }
}
function AddModal({ open, handleClose, onSubmit, defaults }: ModalProps) {
    const { name: defaultName, url: defaultUrl } = defaults || { name: '', url: '' };
    return (
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
                        onSubmit({
                            name: formJson.objectName,
                            url: formJson.objectUrl
                        });
                        handleClose();
                    },
                },
            }}
        >
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="objectName"
                    label="Remote Name"
                    fullWidth
                    variant="standard"
                    defaultValue={defaultName}
                />
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="objectUrl"
                    label="Remote Url"
                    fullWidth
                    variant="standard"
                    defaultValue={defaultUrl}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Commit</Button>
            </DialogActions>
        </Dialog>
    );
}

interface SettingRemoteItemProps {
    remote: RemoteParams;
    onEdit: () => void;
    onDelete: () => void;
}

const SettingRemoteItem: React.FC<SettingRemoteItemProps> = ({ remote, onEdit, onDelete }) => {
    return (
        <ListItem>
            <ListItemText primary={remote.name} secondary={remote.remoteUrl} />
            <AvatarButton disabled={remote.uuid === DEFAULT_REMOTE_UUID} onClick={onEdit} icon={<EditIcon />} />
            <AvatarButton disabled={remote.uuid === DEFAULT_REMOTE_UUID} onClick={onDelete} icon={<DeleteIcon />} />
        </ListItem>
    );
};

export default function RemoteSetting() {
    const [remotes, setRemotes] = useState<Remote[]>([]);
    const [modal, setModal] = useState<React.JSX.Element>();

    type dataTy = { name: string, url: string };
    type onSubmitTy = (value: dataTy) => void;
    const createDialog = (onSubmit: onSubmitTy, defaults?: dataTy) => {
        console.log("createDialog");
        setModal(
            <AddModal open={true} handleClose={() => setModal(undefined)} onSubmit={onSubmit} defaults={defaults} />
        );
    }

    useEffect(() => {
        Remote.getAll().then(setRemotes);
    }, []);

    const onCreateBuilder = () => {
        const fn: onSubmitTy = async ({ name, url }) => {
            // console.log("create remote", name, url);
            const remote = new Remote(generateUUIDv4(), name, url);
            await remote.update();
            setRemotes(await Remote.getAll());
        }
        createDialog(fn);
    }

    const onDeleteBuilder = (uuid: string) => {
        const fn = async () => {
            const remote = await Remote.fromUUID(uuid);
            if (remote) {
                await remote.delete();
            }
            setRemotes(await Remote.getAll());
        }
        fn();
    }

    const onChangeBuilder = (uuid: string, name: string, remoteUrl: string) => {
        const fn: onSubmitTy = async ({ name, url }) => {
            const remote = await Remote.fromUUID(uuid);
            if (remote) {
                remote.name = name;
                remote.remoteUrl = url;
                await remote.update();
            }
            setRemotes(await Remote.getAll());
        }
        createDialog(fn, { name, url: remoteUrl });
    }

    return (
        <div>
            <Button variant="contained" endIcon={<AddCircleOutline />}
                sx={{ width: '100%' }}
                onClick={() => onCreateBuilder()}
            >
                Add Remote
            </Button>
            {remotes.map(remote => (
                <SettingRemoteItem
                    key={remote.uuid}
                    remote={remote}
                    onEdit={() => onChangeBuilder(remote.uuid, remote.name, remote.remoteUrl)}
                    onDelete={() => onDeleteBuilder(remote.uuid)}
                />
            ))}
            {modal}
        </div>
    );
}
