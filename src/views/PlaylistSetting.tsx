import PlaylistSettingItem from "@/components/PlaylistSettingItem";
import PlaylistSettingNew from "@/components/PlaylistSettingNew";
import { Playlist } from "@/core/models/playlist";
import React from "react";

export default function PlaylistSetting() {
    const [playlists, setPlaylists] = React.useState<Playlist[]>([]);

    React.useEffect(() => {
        Playlist.getAllPlaylist().then((ps) => {
            setPlaylists(ps);
        });
    }, []);

    return (
        <div>
            <PlaylistSettingNew />
            {playlists.map(item => (
                <PlaylistSettingItem
                    key={item.uuid}
                    playlist={item}
                />
            ))}
        </div>
    );
}
