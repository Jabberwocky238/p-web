import mitt, { Emitter } from "mitt";
import { Music } from "./musicModel";

interface _EVENTS {
    "switchPlaylist": {
        obj: Music,
    }
}

type EVENTS = _EVENTS[keyof _EVENTS];

type Bus = Emitter<Record<keyof _EVENTS, EVENTS>>;

export const bus: Bus = mitt();