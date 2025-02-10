
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Music } from '../core/musicModel';
import { bus } from '../core/bus';

export default function MediaControlCard({ data }: { data: Music }) {
    return (
        <Card sx={{ display: 'flex' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <CardMedia
                    component="img"
                    sx={{ width: "20%", aspectRatio: "1 / 1" }}
                    image={data.cover instanceof File ? URL.createObjectURL(data.cover) : data.cover}
                    alt="Live from space album cover"
                />
                <CardContent sx={{ flex: '1 0 auto', flexGrow: 1 }}>
                    <Typography component="div" variant="h5">
                        {data.title}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{ color: 'text.secondary' }}
                    >
                        {data.artist}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{ color: 'text.secondary' }}
                    >
                        {data.album}
                    </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
                    <IconButton aria-label="play/pause" onClick={() => {
                        bus.emit('switchPlaylist', {
                            obj: data,
                        });
                    }}>
                        <PlayArrowIcon sx={{ height: 38, width: 38 }} />
                    </IconButton>
                    <IconButton aria-label="next">
                        <SettingsIcon sx={{ height: 38, width: 38 }} />
                    </IconButton>
                </Box>
            </Box>
        </Card>
    );
}
