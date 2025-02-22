
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { Music, MusicProperties } from '@/core/models/music';
import { useDB } from '@/core/indexedDB';
import React from 'react';
import PlaylistItem from '@@/PlaylistItem';
import { useLocation, useRoute } from 'wouter';
import Button from '@mui/material/Button';
import PlaylistContainModal from '@@/PlaylistContainModal';
import { useSnackbar } from 'notistack';
import { Playlist } from '@/core/models/playlist';
import { Notify } from '@/core/notify';
import { BUS } from '@/core/bus';

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
    const [location, navigate] = useLocation();

    React.useEffect(() => {
        (async () => {
            if (ok) {
                const uuid = params.uuid;
                const list = await Playlist.fromUUID(uuid);
                if (!list) {
                    Notify.error("Playlist not found");
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
                const data = await Music.getAllLocalMusic()
                setMusicList(data);
            }
        })();
    }, [params && params!.uuid]);

    const jump = (musicParams: MusicProperties) => {
        const fn = async () => {
            if (localStorage.getItem('musicUUID') === musicParams.uuid) {
                // 如果点击的是当前正在播放的音乐，不做任何操作
            } else {
                // 如果拿的是远程的音乐，就先fetch再播放
                if (!musicParams.status.local) {
                    // 检查是否已经下载
                    const local = await Music.fromUUID(musicParams.uuid);
                    if (!local) {
                        console.log("fetching remote music", musicParams.uuid);
                        const music = await Music.fromParams(musicParams);
                        await music.dumpToDB();
                    } else {
                        console.log("already downloaded", musicParams.uuid);
                    }

                    BUS.emit('switchMusic', {
                        musicUUID: musicParams.uuid,
                        playlistUUID: "NO_PLAYLIST",
                    });
                } else {
                    BUS.emit('switchMusic', {
                        musicUUID: musicParams.uuid,
                        playlistUUID: "NO_PLAYLIST",
                    });
                }

                // console.log("MediaControlCard switchMusic", musicParams.uuid, playlistUUID);
            }
            navigate(`/music/${musicParams.uuid}`);
        }
        fn();
    }


    return (
        <>
            <Box sx={{ width: '100%' }}>
                {ok && <Button onClick={() => setShowModal(true)}>Edit Playlist</Button>}
                <Stack spacing={2}>
                    {musicList.map((music) => (
                        <Item key={music.uuid}>
                            <PlaylistItem musicParams={music} onClick={() => jump(music)} />
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
