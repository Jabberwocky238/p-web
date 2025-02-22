
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Music, MusicProperties } from '../core/models/music';
import SquareImage from './SquareImage';
import { useEffect, useState } from 'react';

interface PlaylistItemProps {
    musicParams: MusicProperties;
    onClick?: () => void;
}

export default function MediaControlCard({ musicParams, onClick }: PlaylistItemProps) {
    const [thumb, setThumb] = useState<string>("/default-album-pic.jfif");

    useEffect(() => {
        setThumb(musicParams.thumbnail || "/default-album-pic.jfif");
    }, [musicParams]);

    return (
        <Card sx={{ display: 'flex', flexDirection: 'row' }} onClick={onClick}>
            <SquareImage src={thumb} forceSquare width={"20%"} />
            <CardContent sx={{ flex: '1 0 auto', flexGrow: 1, width: '80%' }}>
                <strong>{musicParams.title}</strong>
                <div style={{ width: '100%' }}>
                    {Object.entries(musicParams.properties).map(([key, value]) => {
                        return (
                            <Typography variant="body2" color="text.secondary" key={key}>
                                {key}: {Array.isArray(value) ? value.join(', ') : value}
                            </Typography>
                        );
                    })}
                </div>
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
