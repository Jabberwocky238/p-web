import { useEffect, useMemo, useState } from "react";
import { importMusicTransaction, Music } from "../core/models/music";
import { BUS, Handler } from "../core/bus";
import { useLocation, useRoute } from "wouter";
import SquareImage from "../components/SquareImage";
import Chip from "@mui/material/Chip";
import FaceIcon from '@mui/icons-material/Face';
import Stack from "@mui/material/Stack";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Notify } from "@/core/notify";
import { RemoteMusicAdapter } from "@/core/models/music/remote-adapter";
import Typography from "@mui/material/Typography";
import PropertyBoard from "@/components/PropertyBoard";
import Box from "@mui/material/Box";
import { LocalMusicAdapter } from "@/core/models/music/local-adapter";
import { CacheControl } from "@/core/models/music/cache";

const API = process.env.BACKEND_API!;

const btnDelete = async (music: Music) => {
    const cache = new CacheControl(music);
    await cache.clear();
    Notify.success("Delete success");
}

const btnDownload = async (music: Music) => {
    const cache = new CacheControl(music);
    await cache.cache();
    Notify.success("Download success");
}

const btnUpload = async (music: Music) => {
    // console.log("You clicked the Chip.");
    // enqueueSnackbar("Uploading music...Plz Wait", { variant: "info" });
    if (!music) {
        Notify.error("Music not found");
        return;
    }
    // if (music.status.remote.length > 0) {
    //     Notify.info("music is already uploaded to" + music.status.remote[0]);
    //     return;
    // }
    Notify.info("Uploading music...Plz Wait");
    try {
        const cache = new CacheControl(music);
        const data = await cache.upload(API);
        Notify.success("Upload success");
    } catch (error) {
        console.error(error);
        Notify.error("Upload failed");
    }
    // console.log(data);
}


export default function MusicDetail() {
    const [ok, params] = useRoute("/music/:uuid");

    const [music, setMusic] = useState<Music | null>(null);
    const [coverUrl, setCoverUrl] = useState<string>("");
    const [location, navigate] = useLocation();
    const [isLocal, setIsLocal] = useState(false);

    useEffect(() => {
        (async () => {
            if (!ok) {
                return;
            }
            // console.log(params.uuid);
            const { music, coverUrl } = await retrieveMusicMetadata(params.uuid);
            setMusic(music);
            setCoverUrl(coverUrl);
            setIsLocal(music.status.local);
        })();
    }, [params && params.uuid]);

    useEffect(() => {
        const handler: Handler<'switchMusic'> = ({ musicUUID }) => {
            retrieveMusicMetadata(musicUUID).then(({ music, coverUrl }) => {
                setMusic(music);
                setCoverUrl(coverUrl);
                setIsLocal(music.status.local);
            });
        };
        BUS.on("switchMusic", handler);
        return () => {
            BUS.off("switchMusic", handler);
        }
    }, []);

    return (
        <>
            {music && (
                <Stack spacing={2} sx={{ alignItems: 'center' }}>
                    <SquareImage src={coverUrl} width={'360px'} alt={music.title} />
                    <strong>{music.title}</strong>

                    <Stack direction="row" spacing={1}>
                        <Chip
                            icon={<FaceIcon />}
                            label={"Upload / Update"}
                            onClick={() => {
                                btnUpload(music);
                            }}
                            color={"default"}
                        />
                        {isLocal && <Chip
                            icon={<DeleteIcon />}
                            label={"Delete"}
                            onClick={() => {
                                btnDelete(music);
                                setIsLocal(false);
                            }}
                            color="error"
                        />}
                        {!isLocal && <Chip
                            icon={<DeleteIcon />}
                            label={"Download"}
                            onClick={async () => {
                                btnDownload(music);
                                setIsLocal(true);
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
                    </Stack>
                    <Box minWidth={360} justifyItems={'center'}>
                        <PropertyBoard
                            properties={music.properties}
                            onChange={() => { }} canModify={false}
                        />
                    </Box>
                </Stack>
            )}
        </>
    );
}

async function retrieveMusicMetadata(uuid: string) {
    const music = await Music.fromUUID(uuid);
    if (!music) {
        throw new Error("Music not found");
    }
    console.log(music);
    const coverUrl = await music.adapter().coverUrl();
    return { music, coverUrl } as {
        music: Music,
        coverUrl: string,
    };
}