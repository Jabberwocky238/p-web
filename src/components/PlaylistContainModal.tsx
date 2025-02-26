import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

function not<T>(a: T[], b: T[]) {
    return a.filter((value) => !b.includes(value));
}

function intersection<T>(a: T[], b: T[]) {
    return a.filter((value) => b.includes(value));
}

interface TransferListProps {
    uuid: string,
    setContains: (c: string[]) => void
}

function MyTransferList({ uuid, setContains }: TransferListProps) {
    const [checked, setChecked] = React.useState<Music[]>([]);
    const [left, setLeft] = React.useState<Music[]>([]);
    const [right, setRight] = React.useState<Music[]>([]);

    React.useEffect(() => {
        (async () => {
            const list = await Playlist.fromUUID(uuid);
            if (!list) {
                return;
            }
            const contained: Music[] = [];
            for (const uuid of list.contains) {
                const music = await Music.fromUUID(uuid);
                if (music) {
                    contained.push(music);
                }
            }
            const all = await Music.getAllMusic();
            const notContained = all
                .map((music) => music.uuid)
                .filter((uuid) => !list.contains.includes(uuid))
                .map((uuid) => all.find((music) => music.uuid === uuid)!);

            setLeft(contained);
            setRight(notContained);
            setContains(left.map((music) => music.uuid));
        })();
    }, [uuid]);

    const handleCommit = (list: Music[]) => {
        console.log(list);
        setContains(list.map((music) => music.uuid));
    }

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = (value: Music) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const handleAllRight = () => {
        setRight(right.concat(left));
        const _L: Music[] = [];
        setLeft(_L);

        handleCommit(_L);
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        const _L = not(left, leftChecked);
        setLeft(_L);
        setChecked(not(checked, leftChecked));

        handleCommit(_L);
    };

    const handleCheckedLeft = () => {
        const _L = left.concat(rightChecked);
        setLeft(_L);
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));

        handleCommit(_L);
    };

    const handleAllLeft = () => {
        const _L = left.concat(right);
        setLeft(_L);
        setRight([]);

        handleCommit(_L);
    };

    const customList = (items: Music[]) => (
        <Paper sx={{
            width: "100%",
            height: "100%",
            overflow: 'auto'
        }}>
            <List dense component="div" role="list">
                {items.map((value) => {
                    const labelId = `transfer-list-item-${value}-label`;

                    return (
                        <ListItemButton
                            key={value.uuid}
                            role="listitem"
                            onClick={handleToggle(value)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.includes(value)}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{
                                        'aria-labelledby': labelId,
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={value.title} />
                        </ListItemButton>
                    );
                })}
            </List>
        </Paper>
    );

    return (
        <Grid
            container
            spacing={2}
            // direction={isMobile() ? 'column' : 'row'}
            sx={{
                justifyContent: 'center',
                alignItems: 'center',
                height: "100%",
            }}
        >
            <Grid sx={{
                width: "40%",
                height: "100%",
            }} item>{customList(left)}</Grid>
            <Grid sx={{
                width: "20%",
                height: "100%",
            }} item>
                <Grid container direction={'column'} sx={{ alignItems: 'center' }}>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleAllRight}
                        disabled={left.length === 0}
                        aria-label="move all right"
                    >
                        ≫
                    </Button>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleCheckedRight}
                        disabled={leftChecked.length === 0}
                        aria-label="move selected right"
                    >
                        &gt;
                    </Button>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleCheckedLeft}
                        disabled={rightChecked.length === 0}
                        aria-label="move selected left"
                    >
                        &lt;
                    </Button>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleAllLeft}
                        disabled={right.length === 0}
                        aria-label="move all left"
                    >
                        ≪
                    </Button>
                </Grid>
            </Grid>
            <Grid sx={{
                width: "40%",
                height: "100%",
            }} item>{customList(right)}</Grid>
        </Grid>
    );
}


import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Playlist } from '../core/models/playlist';
import { Music } from '../core/models/music';

interface PlaylistContainModalProps {
    open: boolean;
    handleClose: () => void;
    uuid: string;
}

import { TransitionProps } from '@mui/material/transitions';
import Slide from '@mui/material/Slide';
import { Notify } from '@/core/notify';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function PlaylistContainModal({ open, handleClose, uuid }: PlaylistContainModalProps) {
    const [contains, setContains] = React.useState<string[]>([]);

    const handleCommit = async () => {
        const playlist = await Playlist.fromUUID(uuid);
        if (!playlist) {
            Notify.error("Playlist not found");
            handleClose();
            return;
        }
        playlist.contains = contains;
        await playlist.update();
        Notify.success("Playlist updated");
        handleClose();
    }

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <DialogTitle>Edit Playlist</DialogTitle>
            <DialogContent>
                <MyTransferList uuid={uuid} setContains={(c) => setContains(c)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleCommit}>Commit</Button>
            </DialogActions>
        </Dialog>
    );
}
