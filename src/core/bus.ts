import mitt, { Emitter, EventType } from "mitt";

interface ALL_EVENTS extends Record<EventType, unknown> {
    "toggleDrawer": {
        state: boolean,
    }
    "switchPlaylist": {
        playlistUUID: string | undefined,
    },
    "switchMusic": {
        musicUUID: string,
        playlistUUID: string | undefined,
    },
}

type Bus = Emitter<ALL_EVENTS>;

export const bus: Bus = mitt();