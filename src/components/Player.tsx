import * as React from 'react';
import { getMusicBlobUrl, getPlaylist } from '../core/api';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { bus } from '../core/bus';

interface Track {
    UUID: string;
    title: string;
    cover: string;
}

export default function TitlebarBelowImageList() {
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
        bus.on('switchPlaylist', ({ obj }) => {
            setSrcComputed(URL.createObjectURL(obj.file));
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
                // onClickPrevious={() => {
                //     setIndex((index - 1 + tracks.length) % tracks.length);
                // }}
                // onClickNext={() => {
                //     setIndex((index + 1) % tracks.length);
                // }}
                onPlay={e => console.log("onPlay")}
            />
        </div>
    );
}
