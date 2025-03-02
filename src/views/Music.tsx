import { useEffect, useState } from "react";
import { Music, MusicProperties } from "../core/models/music";
import { BUS, Handler } from "../core/bus";
import { useLocation, useRoute } from "wouter";
import SquareImage from "../components/SquareImage";
import Stack from "@mui/material/Stack";
import { Notify } from "@/core/notify";
import PropertyBoard from "@/components/PropertyBoard";
import Box from "@mui/material/Box";
import MusicPageBtnGroup from "@/components/MusicPageBtnGroup";
import { isMobile } from "@/core/utils";

export default function MusicDetail() {
    const [ok, params] = useRoute("/music/:uuid");

    const [music, setMusic] = useState<Music | null>(null);
    const [coverUrl, setCoverUrl] = useState<string>("");
    const [location, navigate] = useLocation();
    // const [isLocal, setIsLocal] = useState(false);

    useEffect(() => {
        (async () => {
            if (!ok) {
                return;
            }
            const music = await Music.fromUUID(params.uuid);
            if (!music) {
                Notify.error("Music not found");
                return;
            }
            setMusic(music);
            setCoverUrl(music.thumbnail);

            const bigCoverUrl = await music.adapter().coverUrl()
            setCoverUrl(bigCoverUrl);
            // setIsLocal(music.status.local);
        })();
    }, [params && params.uuid]);

    useEffect(() => {
        const handler: Handler<'switchMusic'> = ({ musicUUID }) => {
            navigate(`/music/${musicUUID}`);
        };
        BUS.on("switchMusic", handler);
        return () => {
            BUS.off("switchMusic", handler);
        }
    }, []);

    return (
        <>
            {music && (
                <Stack spacing={2} direction={isMobile() ? 'column' : 'row'} sx={{ position: 'relative', alignItems: 'center', width: '100%', height: '100%' }}>
                    <div style={bgPicStyle(coverUrl)}></div>
                    <FlexGrowBox grow={1} />
                    <SquareImage src={coverUrl} width={'400px'} alt={music.title} style={{
                        zIndex: 1,
                    }} />
                    <FlexGrowBox grow={1} />
                    <Stack spacing={2} style={{
                        zIndex: 1,
                        flex: isMobile() ? 'unset' : 3,
                        justifyContent: 'center',
                    }} >
                        <h2 style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                            {music.title}
                        </h2>

                        <MusicPageBtnGroup musicProperties={music} />
                        <Box minWidth={360} justifyItems={'center'}>
                            <PropertyBoard
                                properties={music.properties}
                                onChange={() => { }} canModify={false}
                            />
                        </Box>
                    </Stack>
                    <FlexGrowBox grow={1} />
                </Stack>
            )}
        </>
    );
}

const bgPicStyle = (coverUrl: string) => ({
    backgroundImage: `url(${coverUrl})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'repeat',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    filter: 'blur(10px) brightness(0.5)',
    transition: 'all 0.3s ease-in-out',
} as React.CSSProperties)

const FlexGrowBox = ({ grow }: { grow: number }) => {
    return <div style={{ flex: grow, display: isMobile() ? 'none' : 'flex' }}></div>
}
