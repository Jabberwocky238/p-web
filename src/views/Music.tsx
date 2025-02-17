import { useEffect, useMemo, useState } from "react";
import { Music } from "../core/models/music";
import { bus, Handler } from "../core/bus";
import { useLocation, useRoute } from "wouter";
import SquareImage from "../components/SquareImage";
import Chip from "@mui/material/Chip";
import FaceIcon from '@mui/icons-material/Face';
import Stack from "@mui/material/Stack";
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from "notistack";

export default function MusicDetail() {
    const [ok, params] = useRoute("/music/:uuid");

    const [music, setMusic] = useState<Music | null>(null);
    const [coverUrl, setCoverUrl] = useState<string>("");
    const [location, navigate] = useLocation();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        (async () => {
            if (!ok) {
                return;
            }
            // console.log(params.uuid);
            const { music, coverUrl } = await retrieveMusicMetadata(params.uuid);
            setMusic(music);
            setCoverUrl(coverUrl);
        })();
    }, [params && params.uuid]);

    useEffect(() => {
        const handler: Handler<'switchMusic'> = ({ musicUUID }) => {
            retrieveMusicMetadata(musicUUID).then(({ music, coverUrl }) => {
                setMusic(music);
                setCoverUrl(coverUrl);
            });
        };
        bus.on("switchMusic", handler);
        return () => {
            bus.off("switchMusic", handler);
        }
    }, []);

    const handleClick = async () => {
        // console.log("You clicked the Chip.");
        enqueueSnackbar("Uploading music...Plz Wait", { variant: "info" });
        try {
            const data = await music?.upload();
            if (data?.status !== 200) {
                enqueueSnackbar("You have already uploaded", { variant: "info" });
            } else {
                enqueueSnackbar("Upload success", { variant: "success" });
            }
        } catch (error) {
            enqueueSnackbar("Upload failed", { variant: "error" });
        }
        // console.log(data);
    }

    return (
        <>
            {music && (
                <Stack spacing={2} sx={{ alignItems: 'center' }}>
                    <SquareImage src={coverUrl} width={'360px'} alt={music.title} />
                    <strong>{music.title}</strong>

                    <Stack direction="row" spacing={1}>
                        <Chip
                            icon={<FaceIcon />}
                            label={"Upload"}
                            onClick={handleClick}
                            color={"default"}
                        />
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

                </Stack>
            )}
        </>
    );
}

async function retrieveMusicMetadata(uuid: string) {
    const music = await Music.fromLocalUUID(uuid);
    if (!music) {
        throw new Error("Music not found");
    }
    const coverUrl = await music.coverUrl();
    return { music, coverUrl } as {
        music: Music,
        coverUrl: string,
    };
}