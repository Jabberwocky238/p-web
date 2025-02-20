
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Music, MusicParams } from '../core/models/music';
import { BUS } from '../core/bus';
import SquareImage from './SquareImage';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import ButtonGroup from '@mui/material/ButtonGroup';

interface PlaylistItemProps {
    musicParams: MusicParams;
    playlistUUID?: string;
}

export default function MediaControlCard({ musicParams, playlistUUID }: PlaylistItemProps) {
    const [thumb, setThumb] = useState<string>("/default-album-pic.jfif");
    const [location, navigate] = useLocation();

    useEffect(() => {
        (async () => {
            const music = await Music.fromParams(musicParams);
            setThumb(music.thumbUrl);
        })();
    }, [musicParams]);

    const jump = async () => {
        if (localStorage.getItem('musicUUID') === musicParams.uuid) {
            // 如果点击的是当前正在播放的音乐，不做任何操作
        } else {
            // 如果拿的是远程的音乐，就先fetch再播放
            if (musicParams.location.ty === "Remote") {
                // 检查是否已经下载
                const local = await Music.fromUUID(musicParams.uuid);
                if (!local) {
                    console.log("fetching remote music", musicParams.uuid);
                    const music = await Music.fromParams(musicParams);
                    // const musicBlob = await music.musicBlob();
                    // const coverBlob = await music.coverBlob();
                    await music.register('Remote')
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
                    playlistUUID: playlistUUID || null,
                });
            }

            // console.log("MediaControlCard switchMusic", musicParams.uuid, playlistUUID);
        }
        navigate(`/music/${musicParams.uuid}`);
    }

    return (
        <Card sx={{ display: 'flex', flexDirection: 'row' }} onClick={jump}>
            <SquareImage src={thumb} forceSquare width={"20%"} />
            <CardContent sx={{ flex: '1 0 auto', flexGrow: 1, textWrap: 'wrap', padding: 'unset' }}>
                <strong>{musicParams.title}</strong>
                <div>{musicParams.artist}</div>
                <div>{musicParams.album}</div>
            </CardContent>
            {/* <ButtonGroup
                orientation="vertical"
                variant="text"
                sx={{ justifyContent: 'center' }}
            >
                <IconButton key="one" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/import/${musicParams.uuid}`);
                }}>
                    <EditIcon />
                </IconButton >
                <IconButton key="two">Two</IconButton >
                <IconButton key="three">Three</IconButton >
            </ButtonGroup> */}
        </Card>
    );
}
