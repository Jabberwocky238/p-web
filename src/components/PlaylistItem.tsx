
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
import SquareImage from './SquareImage';

export default function MediaControlCard({ data }: { data: Music }) {
    const imageSrc = data.cover instanceof File ? URL.createObjectURL(data.cover) : data.cover;
    return (
        <Card sx={{ display: 'flex', flexDirection: 'row' }} onClick={() => {
            bus.emit('switchPlaylist', {
                obj: data,
            });
            window.location.href = "#/music/" + data.uuid;
        }}>
            <SquareImage src={imageSrc} width={"20%"} />
            <CardContent sx={{ flex: '1 0 auto', flexGrow: 1, textWrap: 'wrap', padding: 'unset' }}>
                <strong>{data.title}</strong>
                <div>{data.artist}</div>
                <div>{data.album}</div>
            </CardContent>
        </Card>
    );
}
