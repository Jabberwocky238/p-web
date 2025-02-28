import Typography from '@mui/material/Typography';
import { DEFAULT_THUMBNAIL, Music, MusicProperties } from '../core/models/music';
import SquareImage from './SquareImage';
import { useEffect, useState } from 'react';
import { isMobile } from '@/core/utils';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

interface PlaylistItemProps {
    musicParams: MusicProperties;
    onClick?: () => void;
}

const Item = styled(Paper)(({ theme }) => ({
    // backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    // ...theme.applyStyles('dark', {
    //     backgroundColor: '#1A2027',
    // }),
}));


export default function MediaControlCard({ musicParams, onClick }: PlaylistItemProps) {
    const [thumb, setThumb] = useState<string>(DEFAULT_THUMBNAIL);

    useEffect(() => {
        setThumb(musicParams.thumbnail || DEFAULT_THUMBNAIL);
    }, [musicParams]);

    return (
        <Item sx={{ display: 'flex', flexDirection: 'row' }} onClick={onClick}>
            <SquareImage src={thumb} width={isMobile() ? '100px' : '240px'} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', marginLeft: '10px' }}>
                <div style={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.2',
                    maxHeight: '2.4em',
                    fontSize: 'large',
                    fontWeight: 'bold',
                }}>
                {musicParams.title}
                </div>
                <div style={{ width: '100%' }}>
                    {Object.entries(musicParams.properties).map(([key, value]) => {
                        return (
                            <Typography variant="body2" color="text.secondary" key={key}>
                                {key}: {Array.isArray(value) ? value.join(', ') : value}
                            </Typography>
                        );
                    })}
                    <strong>status: {
                        musicParams.status.local ? 'local' : musicParams.status.remote.length !== 0 ? 'remote' : 'unknown'
                    }</strong>
                    {musicParams.status.remote.length !== 0 && (
                        <Typography variant="body2" color="text.secondary">
                            remote: {musicParams.status.remote.join(', ')}
                        </Typography>
                    )}
                </div>
            </div>
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
        </Item>
    );
}
