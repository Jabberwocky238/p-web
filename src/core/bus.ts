import mitt, { Emitter } from "mitt";
import { MusicParams } from "./models/music";

interface _EVENTS {
    "switchPlaylist": {
        obj: MusicParams,
    }
}

type EVENTS = _EVENTS[keyof _EVENTS];

type Bus = Emitter<Record<keyof _EVENTS, EVENTS>>;

export const bus: Bus = mitt();