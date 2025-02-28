
import * as React from 'react';
import { LOCAL_PLAYLIST_UUID, Playlist, PlaylistParams } from '../core/models/playlist';
import { Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlaylistContainModal from '../components/PlaylistContainModal';
import AvatarButton from './AvatarButton';
import ListItemText from './ListItemText';
import ListItem from './ListItem';

interface SettingRemoteItemProps {
    playlist: PlaylistParams;
}

export default function PlaylistSettingItem({ playlist }: SettingRemoteItemProps) {
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
