import { useEffect, useMemo, useState } from "react";
import { Music } from "../core/musicModel";
import { useDB } from "../core/indexedDB";
import { Box, Stack } from "@mui/material";
import { bus } from "../core/bus";

interface MusicDetailProps {
    uuid: string;
}

interface MusicMetadata {
    uuid: string;
    title: string;
    cover: string | Blob;
}

export default function MusicDetail({ uuid }: MusicDetailProps) {
    const [music, setMusic] = useState<MusicMetadata | null>(null);

    const coverUrl = useMemo(() => {
        if (!music) {
            return '';
        }
        return typeof music.cover === 'string' ? music.cover : URL.createObjectURL(music.cover);
    }, [music && music.cover]);

    useEffect(() => {
        (async () => {
            const db = await useDB();
            const music = await db.getData(uuid) as Music;
            setMusic({
                uuid: music.uuid,
                title: music.title,
                cover: music.cover,
            });
            bus.emit('switchPlaylist', {
                obj: music
            });
        })();
    }, [uuid]);

    return (
        <>
            {music && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img style={{
                        width: '360px',
                        height: 'auto',
                        objectFit: 'cover',
                        aspectRatio: '1 / 1',
                    }} src={coverUrl} alt={music.title} />
                    <strong>{music.title}</strong>
                </div>
            )}
        </>
    );
}