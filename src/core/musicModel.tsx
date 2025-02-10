
interface MusicBuilderParams {
    uuid: string,
    title: string,
    artist: string,
    album: string,
    version: string,
    file: File,
    cover: File | string,
}

export function MusicBuilder(data: MusicBuilderParams): Music {
    const { uuid, title, artist, album, version, file, cover } = data;
    return new Music(uuid, title, artist, album, version, file, cover);
}

export class Music {
    constructor(
        public uuid: string,
        public title: string,
        public artist: string,
        public album: string,
        public version: string,
        public file: File,
        public cover: File | string,
    ) { }
}

import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';

export default function MediaControlCard({ data }: { data: Music }) {
    const theme = useTheme();

    return (
        <Card sx={{ display: 'flex' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <CardMedia
                    component="img"
                    sx={{ width: 151, aspectRatio: "1 / 1" }}
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
                    <IconButton aria-label="play/pause">
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
