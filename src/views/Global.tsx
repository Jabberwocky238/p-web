
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { Music, MusicProperties } from '@/core/models/music';
import React from 'react';
import PlaylistItem from '@@/PlaylistItem';
import { Notify } from '@/core/notify';
import { BUS } from '@/core/bus';
import { useLocation, useRoute } from 'wouter';
import { Remote } from '@/core/models/remote';
import { Button } from '@mui/material';
import PlaylistView from '@/components/Playlist';
import { CacheControl } from '@/core/models/music/cache';

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

function RemotePlaylists({ uuid }: { uuid: string }) {
    const [musicList, setMusicList] = React.useState<Music[]>([]);
    const [location, navigate] = useLocation();

    React.useEffect(() => {
        (async () => {
            try {
                const remote = await Remote.fromUUID(uuid);
                if (!remote) {
                    Notify.error("Remote not found");
                    return;
                }
                const data = await Music.getAllRemoteMusic(remote.remoteUrl)
                setMusicList(data);
            } catch (e) {
                Notify.error("Failed to fetch remote music list");
            }
        })();
    }, []);

    const jump = (music: MusicProperties) => {
        const fn = async () => {
            // 如果拿的是远程的音乐，就先fetch再播放
            if (!music.status.local) {
                const mm = Music.fromParams(music);
                if (!mm.status.local) {
                    // console.log("fetching remote music", music.uuid);
                    await mm.dumpToDB();
                }
            }
            if (localStorage.getItem('musicUUID') === music.uuid) {
                // 如果点击的是当前正在播放的音乐，不做任何操作
            } else {
                BUS.emit('switchMusic', {
                    musicUUID: music.uuid,
                    playlistUUID: "NO_PLAYLIST",
                });
                // console.log("MediaControlCard switchMusic", musicParams.uuid, playlistUUID);
            }
            navigate(`/music/${music.uuid}`);
        }
        fn();
    }

    return (
        <PlaylistView musicList={musicList} onItemClick={jump} />
    );
}

export default function BasicStack() {
    const [ok, params] = useRoute("/global/:uuid");
    const [remotes, setRemotes] = React.useState<Remote[]>([]);
    const [location, navigate] = useLocation();

    React.useEffect(() => {
        (async () => {
            try {
                const data = await Remote.getAll();
                setRemotes(data);
            } catch (e) {
                Notify.error("Failed to fetch remote music list");
            }
        })();
    }, []);

    return (
        <Box sx={{ width: '100%' }}>
            {ok ?
                <RemotePlaylists uuid={params.uuid} />
                :
                <Stack spacing={2}>
                    {remotes.map((remote) => (
                        <Button
                            key={remote.uuid}
                            variant="contained"
                            onClick={() => {
                                navigate(`/global/${remote.uuid}`)
                            }}>{remote.name}
                        </Button>
                    ))}
                </Stack>
            }
        </Box>
    );
}
