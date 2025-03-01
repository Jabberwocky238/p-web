import Stack from '@mui/material/Stack';
import { MusicProperties } from '@/core/models/music';
import PlaylistItem from '@@/PlaylistItem';
import { styled } from '@mui/material/styles';

const Item = styled('div')(({ theme }) => ({
    // backgroundColor: '#fff',
    // ...theme.typography.body2,
    // padding: theme.spacing(1),
    // color: theme.palette.text.secondary,
    margin: theme.spacing(1),
    marginTop: theme.spacing(1),
    // ...theme.applyStyles('dark', {
    //     backgroundColor: '#1A2027',
    // }),
}));

interface PlaylistViewProps {
    musicList: MusicProperties[];
    onItemClick: (properties: MusicProperties) => void;
}

export default function PlaylistView({ musicList, onItemClick }: PlaylistViewProps) {
    return (
        <Stack spacing={2} sx={{ padding: 1 }}>
            {musicList.map((music) => (
                <Item key={music.uuid} >
                    <PlaylistItem musicParams={music} onClick={() => onItemClick(music)} />
                </Item>
            ))}
        </Stack>
    );
}
