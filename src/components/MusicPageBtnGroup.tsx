import { useEffect, useState } from "react";
import { Music, MusicProperties } from "../core/models/music";
import { BUS, Handler } from "../core/bus";
import { useLocation, useRoute } from "wouter";
import SquareImage from "../components/SquareImage";
import Chip from "@mui/material/Chip";
import FaceIcon from '@mui/icons-material/Face';
import Stack from "@mui/material/Stack";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Notify } from "@/core/notify";
import PropertyBoard from "@/components/PropertyBoard";
import Box from "@mui/material/Box";
import { CacheControl } from "@/core/models/music/cache";
import { AddCircleOutlineOutlined } from "@mui/icons-material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { LOCAL_PLAYLIST_UUID, Playlist } from "@/core/models/playlist";

const API = process.env.BACKEND_API!;

const btnDelete = async (music: Music) => {
    const cache = new CacheControl(music);
    await cache.clear();
    Notify.success("Delete success");
}

const btnDownload = async (music: Music) => {
    Notify.info("Download start")
    const cache = new CacheControl(music);
    await cache.cache();
    Notify.success("Download success");
}

const btnUpload = async (music: Music) => {
    if (!music) {
        Notify.error("Music not found");
        return;
    }
    Notify.info("Uploading music...Plz Wait");
    try {
        const cache = new CacheControl(music);
        const data = await cache.upload(API);
        Notify.success("Upload success");
    } catch (error) {
        console.error(error);
        Notify.error("Upload failed");
    }
}

const btnExport = async (music: Music) => {
    const blob = await music.adapter().musicBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = music.title;
    a.click();
}

interface BtnAddToProps {
    musicUUID: string;
}

function BtnAddTo({ musicUUID }: BtnAddToProps) {
    const [open, setOpen] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [chosen, setChosen] = useState<boolean[]>([]);

    const handleClickOpen = async () => {
        const ps = await Playlist.getAllPlaylist()
        const ps2 = ps.filter(p => p.uuid !== LOCAL_PLAYLIST_UUID);
        const ps3 = ps2.map(p => p.contains.indexOf(musicUUID) !== -1);
        setPlaylists(ps2)
        setChosen(ps3);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    return (
        <>
            <Chip
                icon={<AddCircleOutlineOutlined />}
                label="Playlist"
                onClick={handleClickOpen}
                color="primary"
            />
            <Dialog
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries((formData as any).entries());
                            for (const item of playlists) {
                                if (item.title in formJson) {
                                    // console.log(item.title);
                                    item.addMusic(musicUUID).then(() => {
                                        Notify.success("Add to playlist success");
                                    })
                                } else {
                                    item.delMusic(musicUUID).then(() => {
                                        Notify.success("Remove from playlist success");
                                    })
                                }
                            }
                            handleClose();
                        },
                    },
                }}
            >
                <DialogTitle>Playlists</DialogTitle>
                <DialogContent>
                    <Stack spacing={1}>
                        {playlists.map((p, index) => (
                            <FormControlLabel
                                key={index}
                                control={<Checkbox
                                    checked={chosen[index]}
                                    onChange={() => setChosen(chosen.map((v, i) => i === index ? !v : v))}
                                    name={p.title}
                                />}
                                label={p.title}
                            />
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Subscribe</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

interface MusicPageBtnGroupProps {
    musicProperties: MusicProperties;
}

function MusicPageBtnGroup({ musicProperties }: MusicPageBtnGroupProps) {
    const music = Music.fromParams(musicProperties);
    const isLocal = music.status.local;
    const [location, navigate] = useLocation();

    return (
        <Stack direction="row" spacing={1} sx={{
            justifyContent: 'center'
        }}>
            {/* {isLocal && <Chip
                icon={<FaceIcon />}
                label={"Upload / Update"}
                onClick={() => {
                    btnUpload(music);
                }}
                color={"default"}
            />} */}
            {isLocal && <Chip
                icon={<DeleteIcon />}
                label={"Delete"}
                onClick={() => {
                    btnDelete(music);
                    // setIsLocal(false);
                }}
                color="error"
            />}
            {isLocal && <Chip
                icon={<FaceIcon />}
                label={"Export"}
                onClick={() => {
                    btnExport(music);
                }}
                color="primary"
            />}
            {!isLocal && <Chip
                icon={<DeleteIcon />}
                label={"Download"}
                onClick={async () => {
                    btnDownload(music);
                    // setIsLocal(true);
                }}
                color="success"
            />}
            <Chip
                icon={<EditIcon />}
                label="Edit"
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/import/${music.uuid}`);
                }}
                color="primary"
            />
            <BtnAddTo musicUUID={music.uuid} />
        </Stack>
    )
}

export default MusicPageBtnGroup;