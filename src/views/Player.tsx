import * as React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { BUS, Handler } from '../core/bus';
import { Music } from '../core/models/music';
import { Playlist } from '../core/models/playlist';
import { useLocation } from 'wouter';
import { useSnackbar } from 'notistack';
import { Notify } from '@/core/notify';

export default function () {
    const [tracks, setTracks] = React.useState<Music[]>([]);
    const [index, setIndex] = React.useState<number>(0);
    const { enqueueSnackbar } = useSnackbar();

    const [srcComputed, setSrcComputed] = React.useState<string>("");

    const switchMusic = (direction: "next" | "prev") => {
        let newIndex: number;
        if (direction === "prev") {
            newIndex = (index - 1 + tracks.length) % tracks.length;
        }
        else if (direction === "next") {
            newIndex = (index + 1) % tracks.length;
        }
        else {
            throw new Error("Invalid direction");
        }
        setIndex(newIndex);
        const music = tracks[newIndex];
        // console.log("switchMusic tracks", tracks);
        BUS.emit('switchMusic', {
            musicUUID: music.uuid,
            playlistUUID: localStorage.getItem('playlistUUID'),
        });
    }

    async function fetchMusic(musicUUID: string, playlistUUID: string | null) {
        const m = await Music.fromUUID(musicUUID);
        if (m) {
            setTracks([m]);
            setIndex(0);
            // console.log("Player music", m);
            // 修改html title，meta，icon
            document.title = m.title;
            const link = document.querySelector("link[rel~='icon']");
            if (link) {
                link.setAttribute('href', m.thumbnail!);
            }
            const meta = document.querySelector('meta[name="description"]');
            if (meta) {
                meta.setAttribute('content', m.title);
            }

            // console.log("Player music", musicList, index, music);
            const src = await m.adapter().musicUrl();
            // console.log("Player music src", src);
            setSrcComputed(src);
        }
        else {
            Notify.error(`404 Music not found, uuid: ${musicUUID}`);
            return;
        }
    }

    React.useEffect(() => {
        // loading for first render
        const musicUUID = localStorage.getItem('musicUUID');
        const playlistUUID = localStorage.getItem('playlistUUID');
        if (musicUUID) {
            fetchMusic(musicUUID, playlistUUID)
        }


        Notify.init((data) => {
            const { message, variant } = data;
            enqueueSnackbar(message, { variant });
        })
        Notify.success("Notify init");

        const _switchMusicHandler: Handler<'switchMusic'> = ({ musicUUID, playlistUUID }) => {
            localStorage.setItem('musicUUID', musicUUID);
            if (!playlistUUID) {
                localStorage.removeItem('playlistUUID');
            } else if (playlistUUID !== localStorage.getItem('playlistUUID')) {
                localStorage.setItem('playlistUUID', playlistUUID);
            } else {
                // 未修改playlist
            }
            fetchMusic(musicUUID, playlistUUID);
        }

        BUS.on('switchMusic', _switchMusicHandler)
        return () => {
            // console.log("Player unmount");
            BUS.off('switchMusic', _switchMusicHandler);
        }
    }, []);

    return (
        <div style={{ position: "sticky", bottom: 0, width: "100%", maxHeight: "30%", zIndex: 1000 }}>
            <AudioPlayer
                autoPlay
                src={srcComputed}
                showSkipControls
                showFilledVolume
                showJumpControls={false}
                loop
                onClickPrevious={() => {
                    switchMusic("prev");
                }}
                onClickNext={() => {
                    switchMusic("next");
                }}
            // onPlay={e => console.log("onPlay")}
            />
        </div>
    );
}
