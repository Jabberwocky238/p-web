import * as React from 'react';
import { getMusicBlobUrl, getPlaylist } from '../core/api';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { bus, Handler } from '../core/bus';
import { Music, MusicParams } from '../core/models/music';
import { Playlist } from '../core/models/playlist';
import { useLocation } from 'wouter';
import { useSnackbar } from 'notistack';

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
        bus.emit('switchMusic', {
            musicUUID: music.uuid,
            playlistUUID: localStorage.getItem('playlistUUID'),
        });
    }

    async function fetchMusic(musicUUID: string, playlistUUID: string | null) {
        // console.log("Player fetchMusic", musicUUID, playlistUUID);
        // 判断是否修改了playlist
        let musicList: Music[] = tracks;
        if (!playlistUUID) {
            // 清空选择
            musicList = await Music.getAllMusic();
            setTracks(musicList);
        } else if (
            (playlistUUID !== localStorage.getItem('playlistUUID')) || // 修改了playlist
            (musicList.length === 0) // 首次加载
        ) {
            // 更新选择
            const playlist = await Playlist.fromUUID(playlistUUID);
            if (!playlist) {
                enqueueSnackbar(`404 Playlist not found, uuid: ${playlistUUID}`, { variant: "error" });
                return;
            }
            musicList = [];
            for (const uuid of playlist.contains) {
                const music = await Music.fromUUID(uuid);
                if (music) {
                    musicList.push(music);
                }
            }
            setTracks(musicList);
        } else {
            // 未修改playlist
        }
        // if musicList is still empty, then quit
        if (musicList.length === 0) {
            enqueueSnackbar(`Playlist is empty, uuid: ${playlistUUID}`, { variant: "info" });
            return;
        }
        // find index
        const index = musicList.findIndex(music => music.uuid === musicUUID);
        if (index === -1) {
            setIndex(0);
        } else {
            setIndex(index);
        }
        const music = musicList[index];
        // 修改html title，meta，icon
        document.title = music.title;
        const link = document.querySelector("link[rel~='icon']");
        if (link) {
            link.setAttribute('href', await music.getCoverSrc());
        }
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', music.title);
        }

        // console.log("Player music", musicList, index, music);
        const src = await music.getSrc();
        setSrcComputed(src);
    }


    React.useEffect(() => {
        // loading for first render
        const musicUUID = localStorage.getItem('musicUUID')!;
        const playlistUUID = localStorage.getItem('playlistUUID')!;
        fetchMusic(musicUUID, playlistUUID).then(() => {
            // console.log("Player fetchMusic done", tracks);
        });

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

        bus.on('switchMusic', _switchMusicHandler)
        return () => {
            // console.log("Player unmount");
            bus.off('switchMusic', _switchMusicHandler);
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
