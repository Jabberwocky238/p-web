import * as React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { BUS, Handler } from '../core/bus';
import { Music } from '../core/models/music';
import { useSnackbar } from 'notistack';
import { Notify } from '@/core/notify';
import { Playlist, TEMP_PLAYLIST_UUID } from '@/core/models/playlist';
import { useLocation } from 'wouter';

export default function () {
    const [tracks, setTracks] = React.useState<string[]>([]);
    const [index, setIndex] = React.useState<number>(0);
    const { enqueueSnackbar } = useSnackbar();
    const [location, navigate] = useLocation();

    const [srcComputed, setSrcComputed] = React.useState<string>("");

    const switchMusicFromUUID = async (musicUUID: string) => {
        const music = await Music.fromUUID(musicUUID);
        if (!music) {
            Notify.error(`404 Music not found, uuid: ${musicUUID}`);
            return;
        }
        changeMediaMetadata(music);
        const src = await music.adapter().musicUrl();
        setSrcComputed(src);
        if (location.startsWith('/music/')) {
            navigate(`/music/${musicUUID}`);
        }
    }

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
        switchMusicFromUUID(tracks[newIndex]);
    }

    async function fetchMusic(musicUUID: string, playlistUUID: string) {
        const oldPlaylistUUID = localStorage.getItem('playlistUUID') ?? TEMP_PLAYLIST_UUID;
        const oldMusicUUID = localStorage.getItem('musicUUID') ?? "";

        // 判断是否需要更换播放列表
        let _tracks: string[] = [];
        const tempPlaylist = await Playlist.fromUUID(TEMP_PLAYLIST_UUID)!;
        /// 1. 上次不是临时列表，这次也不是
        ///    Solve： 直接切换列表
        /// 2. 上次是临时列表，这次不是
        ///    Solve： 直接切换列表
        /// 3. 上次不是临时列表，这次是
        ///    Solve： 获取老列表所有音乐，插入临时列表，并且插入最新的音乐到最后
        /// 4. 上次是临时列表，这次也是
        ///    Solve： 追加最新的音乐到临时列表
        if (playlistUUID !== TEMP_PLAYLIST_UUID) {
            const p = await Playlist.fromUUID(playlistUUID);
            if (!p) {
                Notify.error(`404 Playlist not found, uuid: ${playlistUUID}`);
                return;
            }
            _tracks = p.contains;
            await tempPlaylist!.setMusics([]);
        } else if (oldPlaylistUUID !== TEMP_PLAYLIST_UUID && playlistUUID === TEMP_PLAYLIST_UUID) {
            // 选择了临时播放列表
            // 获取老列表所有音乐，插入临时列表，并且插入最新的音乐到最后
            const oldPlaylist = await Playlist.fromUUID(oldPlaylistUUID);
            if (oldPlaylist) {
                _tracks = [...oldPlaylist.contains, musicUUID];
            } else {
                _tracks = [musicUUID];
            }
            await tempPlaylist!.setMusics(_tracks);
        } else {
            // oldPlaylistUUID === TEMP_PLAYLIST_UUID && playlistUUID === TEMP_PLAYLIST_UUID
            // 追加最新的音乐到临时列表
            await tempPlaylist!.addMusic(musicUUID);
            _tracks = tempPlaylist!.contains;
        }
        setTracks(_tracks);
        const index = _tracks.indexOf(musicUUID);
        if (index === -1) {
            Notify.error(`404 Music not found in playlist, musicUUID: ${musicUUID}, playlistUUID: ${playlistUUID}`);
            return;
        }
        setIndex(index);

        const m = await Music.fromUUID(musicUUID);
        if (!m) {
            Notify.error(`404 Music not found, uuid: ${musicUUID}`);
            return;
        }
        if (oldMusicUUID === musicUUID) {
            return;
        }
        switchMusicFromUUID(musicUUID);
    }

    React.useEffect(() => {
        Notify.init((data) => {
            const { message, variant } = data;
            enqueueSnackbar(message, { variant });
        })

        // loading for first render
        const musicUUID = localStorage.getItem('musicUUID');
        const playlistUUID = localStorage.getItem('playlistUUID') ?? TEMP_PLAYLIST_UUID;
        if (musicUUID) {
            fetchMusic(musicUUID, playlistUUID)
        }
        const _switchMusicHandler: Handler<'switchMusic'> = ({ musicUUID, playlistUUID }) => {
            fetchMusic(musicUUID, playlistUUID).then(() => {
                localStorage.setItem('musicUUID', musicUUID);
                localStorage.setItem('playlistUUID', playlistUUID);
            })
        }
        BUS.on('switchMusic', _switchMusicHandler)
        return () => {
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
                // loop
                onClickPrevious={() => {
                    console.log("onClickPrevious");
                    switchMusic("prev");
                }}
                onClickNext={() => {
                    console.log("onClickNext");
                    switchMusic("next");
                }}
                onEnded={() => {
                    console.log("onEnded");
                    switchMusic("next");
                }}
            // onPlay={e => console.log("onPlay")}
            />
        </div>
    );
}

function changeMediaMetadata(music: Music) {
    document.title = music.title;
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
        link.setAttribute('href', music.thumbnail);
    }

    let artists = 'Unknown Artist';
    if (music.properties.hasOwnProperty('artist')) {
        if (Array.isArray(music.properties['artist'])) {
            artists = music.properties['artist'].join(', ');
        } else {
            artists = music.properties['artist'];
        }
    }
    let album = 'Unknown Album';
    if (music.properties.hasOwnProperty('album')) {
        if (Array.isArray(music.properties['album'])) {
            artists = music.properties['album'].join(', ');
        } else {
            artists = music.properties['album'];
        }
    }
    if ('mediaSession' in navigator) {
        const mediaMetadata = new MediaMetadata({
            title: music.title,
            artist: artists,
            album: album,
            // artwork: []
            artwork: [{
                src: music.thumbnail,
                sizes: '400x400',
                type: 'image/jpeg'
            }]
        });
        navigator.mediaSession.metadata = mediaMetadata
    }
}