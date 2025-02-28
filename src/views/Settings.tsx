import ImageIcon from '@mui/icons-material/Image';
import { Box, Button, Stack, TextField } from '@mui/material';
import { criticalRemoveEverything } from '@/core/indexedDB';
import PlaylistSetting from '@/views/PlaylistSetting';
import RemoteSetting from '@/views/RemoteSetting';

export default function Settings() {
    return (
        <Stack spacing={2} direction="column">
            <RemoteSetting />
            <PlaylistSetting />
            <Button variant="contained" color='error' endIcon={<ImageIcon />}
                onClick={() => {
                    criticalRemoveEverything().then(() => {
                        window.location.href = '/';
                    });
                }}
            >
                删除所有数据库
            </Button>
        </Stack>
    );
}
