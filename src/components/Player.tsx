import * as React from 'react';
import { getMusicBlobUrl, getPlaylist } from '../api';

interface Props {
    uuid: string;

}
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

interface Track {
    UUID: string;
    title: string;
    cover: string;
}

export default function TitlebarBelowImageList({ uuid }: Props) {
    const [tracks, setTracks] = React.useState<Track[]>([]);
    const [index, setIndex] = React.useState<number>(0);
    const [srcComputed, setSrcComputed] = React.useState<string>("");

    React.useEffect(() => {
        if (tracks.length === 0) {
            return;
        }
        getMusicBlobUrl(tracks[index].UUID).then((url) => {
            setSrcComputed(url);
        });
    }, [index, tracks]);

    React.useEffect(() => {
        (async () => {
            const data = await getPlaylist(uuid);
            const _Tracks = data.musics.map((m) => {
                return {
                    UUID: m.uuid,
                    title: m.title,
                    cover: m.coverUrl,
                };
            });
            setTracks(_Tracks);
            setIndex(0);
        })()
    }, [uuid]);

    return (
        <div style={{ position: "sticky", bottom: 0, width: "100%", maxHeight: "30%", zIndex: 1000 }}>
            <AudioPlayer
                autoPlay
                src={srcComputed}
                showSkipControls
                showFilledVolume
                showJumpControls={false}
                onClickPrevious={() => {
                    setIndex((index - 1 + tracks.length) % tracks.length);
                }}
                onClickNext={() => {
                    setIndex((index + 1) % tracks.length);
                }}
                onPlay={e => console.log("onPlay")}
            />
        </div>
    );
}
