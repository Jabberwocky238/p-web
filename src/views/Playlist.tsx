
import Box from '@mui/material/Box';

import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { Music, MusicProperties } from '@/core/models/music';
import { useDB } from '@/core/indexedDB';
import React, { useEffect, useMemo } from 'react';
import PlaylistItem from '@@/PlaylistItem';
import { useLocation, useRoute } from 'wouter';
import Button from '@mui/material/Button';
import PlaylistContainModal from '@/components/PlaylistTransferList';
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
            BUS.emit('switchMusic', {
                musicUUID: musicParams.uuid,
                playlistUUID: memoPlaylistUUID,
            });
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
