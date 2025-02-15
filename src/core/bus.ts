import mitt, { Emitter, EventType } from "mitt";
import { MusicParams } from "./models/music";

interface ALL_EVENTS extends Record<EventType, unknown> {
    "toggleDrawer": {
        state: boolean,
    }
    "switchPlaylist": {
        obj: MusicParams,
    }
}

type Bus = Emitter<ALL_EVENTS>;

export const bus: Bus = mitt();