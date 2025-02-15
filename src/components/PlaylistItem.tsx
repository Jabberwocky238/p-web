
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Music } from '../core/models/music';
import { bus } from '../core/bus';
import SquareImage from './SquareImage';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';

export default function MediaControlCard({ data }: { data: Music }) {
    const [imageSrc, setImageSrc] = useState<string>("/default-album-pic.jfif");
    const [location, navigate] = useLocation();

    useEffect(() => {
        (async () => {
            const music = Music.fromParams(data);
            const src = await music.getCoverSrc();
            setImageSrc(src);
        })();
    }, [data]);

    return (
        <Card sx={{ display: 'flex', flexDirection: 'row' }} onClick={() => {
            bus.emit('switchPlaylist', { obj: data });
            navigate(`/music/${data.uuid}`);
        }}>
            <SquareImage src={imageSrc} width={"20%"} />
            <CardContent sx={{ flex: '1 0 auto', flexGrow: 1, textWrap: 'wrap', padding: 'unset' }}>
                <strong>{data.title}</strong>
                <div>{data.artist}</div>
                <div>{data.album}</div>
                <Button variant="contained" endIcon={<EditIcon />} onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/import/${data.uuid}`);
                }}>
                    Edit
                </Button>
            </CardContent>
        </Card>
    );
}
