import { useEffect, useMemo, useState } from "react";
import { Music } from "../core/models/music";
import { useDB } from "../core/indexedDB";
import { Box, Stack } from "@mui/material";
import { bus } from "../core/bus";

interface MusicDetailProps {
    uuid: string;
}

export default function MusicDetail({ uuid }: MusicDetailProps) {
    const [music, setMusic] = useState<Music | null>(null);
    const [coverUrl, setCoverUrl] = useState<string>("");

    useEffect(() => {
        (async () => {
            const music = await Music.fromUUID(uuid);
            setMusic(music);
            const cover = await music.getCoverSrc();
            setCoverUrl(cover);

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