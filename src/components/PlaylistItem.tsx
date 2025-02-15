
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Music, MusicParams } from '../core/models/music';
import { bus } from '../core/bus';
import SquareImage from './SquareImage';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';

interface PlaylistItemProps {
    musicParams: MusicParams;
    playlistUUID?: string;
}

export default function MediaControlCard({ musicParams, playlistUUID }: PlaylistItemProps) {
    const [imageSrc, setImageSrc] = useState<string>("/default-album-pic.jfif");
    const [location, navigate] = useLocation();

    useEffect(() => {
        (async () => {
            const music = Music.fromParams(musicParams);
            const src = await music.getCoverSrc();
            setImageSrc(src);
        })();
    }, [musicParams]);

    return (
        <Card sx={{ display: 'flex', flexDirection: 'row' }} onClick={() => {
            bus.emit('switchMusic', { musicUUID: musicParams.uuid, playlistUUID });
            navigate(`/music/${musicParams.uuid}`);
        }}>
            <SquareImage src={imageSrc} width={"20%"} />
            <CardContent sx={{ flex: '1 0 auto', flexGrow: 1, textWrap: 'wrap', padding: 'unset' }}>
                <strong>{musicParams.title}</strong>
                <div>{musicParams.artist}</div>
                <div>{musicParams.album}</div>
                <Button variant="contained" endIcon={<EditIcon />} onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/import/${musicParams.uuid}`);
                }}>
                    Edit
                </Button>
            </CardContent>
        </Card>
    );
}
