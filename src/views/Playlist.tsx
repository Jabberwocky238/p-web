
import Box from '@mui/material/Box';

import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { Music, MusicProperties } from '@/core/models/music';
import { useDB } from '@/core/indexedDB';
import React, { useEffect, useMemo } from 'react';
import PlaylistItem from '@@/PlaylistItem';
import { useLocation, useRoute } from 'wouter';
import Button from '@mui/material/Button';
import PlaylistContainModal from '@@/PlaylistContainModal';
import { LOCAL_PLAYLIST_UUID, Playlist } from '@/core/models/playlist';
import { Notify } from '@/core/notify';
import { BUS } from '@/core/bus';
import PlaylistView from '@/components/Playlist';


export default function BasicStack() {
    const [ok, params] = useRoute("/playlist/:uuid");
    const memoPlaylistUUID = useMemo(() => {
        return ok ? params && params.uuid : LOCAL_PLAYLIST_UUID;
    }, [ok, params]);

    const [musicList, setMusicList] = React.useState<Music[]>([]);
    const [showModal, setShowModal] = React.useState(false);
    const [location, navigate] = useLocation();

    useEffect(() => {
        (async () => {
            console.log(memoPlaylistUUID)
            const list = await Playlist.fromUUID(memoPlaylistUUID)
            if (list) {
                const data = await list.getAllMusic();
                setMusicList(data);
                console.log(memoPlaylistUUID, data)
            } else {
                await Playlist.initDefaults()
                const local = await Playlist.fromUUID(LOCAL_PLAYLIST_UUID);
                const data = await local!.getAllMusic();
                setMusicList(data);
                console.log(memoPlaylistUUID, data)
            }

        })();
    }, [memoPlaylistUUID]);

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
                <PlaylistView musicList={musicList} onItemClick={jump} />
            </Box>
            {ok && params.uuid && <PlaylistContainModal
                open={showModal}
                handleClose={() => setShowModal(false)}
                uuid={params.uuid}
            />}
        </>
    );
}
