import * as React from 'react';
import { getMusicBlobUrl, getPlaylist } from '../core/api';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { bus } from '../core/bus';
import { Music, MusicParams } from '../core/models/music';
import { Playlist } from '../core/models/playlist';
import { useLocation } from 'wouter';


export default function TitlebarBelowImageList() {
    const [tracks, setTracks] = React.useState<Music[]>([]);
    const [index, setIndex] = React.useState<number>(0);
    const [srcComputed, setSrcComputed] = React.useState<string>("");
    const [location, navigate] = useLocation();

    React.useEffect(() => {
        if (tracks.length === 0) {
            return;
        }
        (async () => {
            const music = tracks[index];
            const src = await music.getSrc();
            setSrcComputed(src);
            navigate(`#/music/${music.uuid}`);
        })()
    }, [index, tracks]);

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
        bus.emit('switchMusic', { musicUUID: music.uuid, index: newIndex, direction });
        navigate(`#/music/${music.uuid}`);
    }

    React.useEffect(() => {
        bus.on('switchPlaylist', ({ playlistUUID }) => {
            (async () => {
                if (!playlistUUID) {
                    const musicList = await Music.getAllMusic();
                    setTracks(musicList);
                    return;
                }
                const playlist = await Playlist.fromUUID(playlistUUID);
                if (!playlist) {
                    return;
                }
                const musicList: Music[] = [];
                for (const uuid of playlist.contains) {
                    const music = await Music.fromUUID(uuid);
                    if (music) {
                        musicList.push(music);
                    }
                }
                setTracks(musicList);
                setIndex(0);
            })();
        })
        return () => {
            bus.off('switchPlaylist');
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
                onPlay={e => console.log("onPlay")}
            />
        </div>
    );
}
