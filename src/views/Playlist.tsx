
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
    const [ok, params] = useRoute("/playlist/:uuid");
    const [musicList, setMusicList] = React.useState<Music[]>([]);
    const [showModal, setShowModal] = React.useState(false);
    const { enqueueSnackbar } = useSnackbar();

    React.useEffect(() => {
        (async () => {
            if (ok) {
                const uuid = params.uuid;
                localStorage.setItem("playlistUUID", uuid);

                const list = await Playlist.fromUUID(uuid);
                if (!list) {
                    enqueueSnackbar("Playlist not found", { variant: "error" });
                    return;
                }
                let musicList: Music[] = [];
                for (const uuid of list.contains) {
                    const music = await Music.fromUUID(uuid);
                    if (music) {
                        musicList.push(music);
                    }
                }
                setMusicList(musicList);
            } else {
                localStorage.removeItem("playlistUUID");
                const data = await Music.getAllMusic()
                setMusicList(data);
            }
        })();
    }, [params && params!.uuid]);

    return (
        <>
            <Box sx={{ width: '100%' }}>
                {ok && <Button onClick={() => setShowModal(true)}>Edit Playlist</Button>}
                <Stack spacing={2}>
                    {musicList.map((music) => (
                        <Item key={music.uuid}>
                            <MediaControlCard musicParams={music} playlistUUID={ok ? params.uuid : undefined} />
                        </Item>
                    ))}
                </Stack>
            </Box>
            {ok && params.uuid && <PlaylistContainModal
                open={showModal}
                handleClose={() => setShowModal(false)}
                uuid={params.uuid}
            />}
        </>
    );
}
