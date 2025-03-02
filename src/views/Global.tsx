
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Music, MusicProperties } from '@/core/models/music';
import React from 'react';
import { Notify } from '@/core/notify';
import { BUS } from '@/core/bus';
import { useLocation, useRoute } from 'wouter';
import { Remote } from '@/core/models/remote';
import { Button } from '@mui/material';
import PlaylistView from '@/components/Playlist';
import { NO_PLAYLIST_UUID, TEMP_PLAYLIST_UUID, Playlist } from '@/core/models/playlist';


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
                await mm.dumpToDB();
                const tempPlaylist = await Playlist.fromUUID(TEMP_PLAYLIST_UUID);
                if (!tempPlaylist) {
                    throw new Error("No playlist found");
                }
                await tempPlaylist.addMusic(mm.uuid);
            }
            BUS.emit('switchMusic', {
                musicUUID: music.uuid,
                playlistUUID: TEMP_PLAYLIST_UUID,
            });
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
