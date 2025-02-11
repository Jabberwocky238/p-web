import Import from "../components/Import";
import Playlist from "../components/Playlist";
import MusicDetail from "../components/MusicDetail";

export const SETTINGS = [
    // {
    //     name: "Upload",
    //     link: "/setting"
    // },
    {
        name: "Import",
        link: "/import",
        component: <Import />,
    },
    {
        name: "Playlist",
        link: "/playlist",
        component: <Playlist />,
    },
    {
        name: "Music",
        link: "/music/:uuid",
        component: (params: any) => <MusicDetail uuid={params.uuid} />,
    }
]