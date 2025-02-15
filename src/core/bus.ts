import mitt, { Emitter, EventType } from "mitt";
import { MusicParams } from "./models/music";

interface ALL_EVENTS extends Record<EventType, unknown> {
    "toggleDrawer": {
        state: boolean,
    }
    "switchPlaylist": {
        playlistUUID: string | undefined,
    },
    "switchMusic": {
        musicUUID: string,
        index: number,
        direction: "next" | "prev",
    },
}

type Bus = Emitter<ALL_EVENTS>;

export const bus: Bus = mitt();