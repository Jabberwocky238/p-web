import { useEffect, useMemo, useState } from "react";
import { Music } from "../core/models/music";
import { useDB } from "../core/indexedDB";
import { Box, Stack } from "@mui/material";
import { bus } from "../core/bus";
import { useRoute } from "wouter";
import SquareImage from "../components/SquareImage";

interface MusicDetailProps {
    uuid: string;
}

export default function MusicDetail() {
    const [ok, params] = useRoute("/music/:uuid");

    const [music, setMusic] = useState<Music | null>(null);
    const [coverUrl, setCoverUrl] = useState<string>("");

    useEffect(() => {
        (async () => {
            if (!ok) {
                return;
            }
            console.log(params.uuid);
            const { music, coverUrl } = await retrieveMusicMetadata(params.uuid);
            setMusic(music);
            setCoverUrl(coverUrl);
        })();
    }, [params && params.uuid]);

    useEffect(() => {
        bus.on("switchMusic", ({ musicUUID, playlistUUID }) => {
            retrieveMusicMetadata(musicUUID).then(({ music, coverUrl }) => {
                setMusic(music);
                setCoverUrl(coverUrl);
            });
        });
        return () => {
            bus.off("switchMusic");
        }
    }, []);

    return (
        <>
            {music && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <SquareImage src={coverUrl} width={'360px'} alt={music.title} />
                    <strong>{music.title}</strong>
                </div>
            )}
        </>
    );
}

async function retrieveMusicMetadata(uuid: string) {
    const music = await Music.fromUUID(uuid);
    if (!music) {
        throw new Error("Music not found");
    }
    const coverUrl = await music.getCoverSrc();
    return { music, coverUrl } as {
        music: Music,
        coverUrl: string,
    };
}