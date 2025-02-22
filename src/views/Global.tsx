
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { Music } from '@/core/models/music';
import React from 'react';
import PlaylistItem from '@@/PlaylistItem';
import { Notify } from '@/core/notify';
import { BUS } from '@/core/bus';
import { useLocation } from 'wouter';

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
    const [location, navigate] = useLocation();

    React.useEffect(() => {
        (async () => {
            try {
                const data = await Music.getAllRemoteMusic()
                setMusicList(data);
            } catch (e) {
                Notify.error("Failed to fetch remote music list");
            }
        })();
    }, []);

    const jump = (music: Music) => {
        const fn = async () => {
            if (localStorage.getItem('musicUUID') === music.uuid) {
                // 如果点击的是当前正在播放的音乐，不做任何操作
            } else {
                // 如果拿的是远程的音乐，就先fetch再播放
                if (!music.status.local) {
                    // 检查是否已经下载
                    const local = await Music.fromUUID(music.uuid);
                    if (!local) {
                        console.log("fetching remote music", music.uuid);
                        await music.dumpToDB();
                    } else {
                        console.log("already downloaded", music.uuid);
                    }

                    BUS.emit('switchMusic', {
                        musicUUID: music.uuid,
                        playlistUUID: "NO_PLAYLIST",
                    });
                } else {
                    BUS.emit('switchMusic', {
                        musicUUID: music.uuid,
                        playlistUUID: "NO_PLAYLIST",
                    });
                }

                // console.log("MediaControlCard switchMusic", musicParams.uuid, playlistUUID);
            }
            navigate(`/music/${music.uuid}`);
        }
        fn();
    }

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Stack spacing={2}>
                    {musicList.map((music) => (
                        <Item key={music.uuid}>
                            <PlaylistItem musicParams={{ ...music }} onClick={() => jump(music)} />
                        </Item>
                    ))}
                </Stack>
            </Box>
        </>
    );
}
