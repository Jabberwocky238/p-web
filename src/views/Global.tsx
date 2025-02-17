
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { Music } from '@/core/models/music';
import { useDB } from '@/core/indexedDB';
import React from 'react';
import MediaControlCard from '@@/PlaylistItem';
import { useRoute } from 'wouter';
import Button from '@mui/material/Button';
import PlaylistContainModal from '@@/PlaylistContainModal';
import { useSnackbar } from 'notistack';
import { Playlist } from '@/core/models/playlist';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));

export default function BasicStack() {
    const [musicList, setMusicList] = React.useState<Music[]>([]);

    React.useEffect(() => {
        (async () => {
            const data = await Music.getAllRemoteMusic()
            setMusicList(data);
        })();
    }, []);

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Stack spacing={2}>
                    {musicList.map((music) => (
                        <Item key={music.uuid}>
                            <MediaControlCard musicParams={music} playlistUUID={undefined} />
                        </Item>
                    ))}
                </Stack>
            </Box>
        </>
    );
}
