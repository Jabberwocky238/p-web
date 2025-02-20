import mitt, { Emitter, EventType, Handler as _Handler } from "mitt";

const AllEvents = {
    "toggleDrawer": (param: { state: boolean }) => { },
    "switchMusic": (param: { musicUUID: string, playlistUUID: string | null }) => { },
}

type AllEventTy = typeof AllEvents;
type KeyTy = keyof AllEventTy
type PayloadTy<K extends KeyTy> = Parameters<AllEventTy[K]>[0];
export type Handler<K extends KeyTy> = _Handler<PayloadTy<K>>;

class BusManager {
    bus: Emitter<Record<EventType, unknown>>;
    listenersMap: Map<KeyTy, Handler<KeyTy>[]>;

    constructor() {
        this.bus = mitt();
        this.listenersMap = new Map();

        for (const event in AllEvents) {
            const k = event as KeyTy;
            this.listenersMap.set(k, []);
            console.log("[BusManager] constructor: Registering event", k);
            this.bus.on(k, (e) => {
                const listeners = this.listenersMap.get(k) || [];
                console.log(`[BusManager] mitt resolve: ${k}, total: ${listeners.length}`);
                listeners.forEach((handler) => {
                    handler(e as any);
                });
            });
        }
    }

    on<K extends KeyTy>(type: K, listener: Handler<K>) {
        const listeners = this.listenersMap.get(type) || [];
        listeners.push(listener as Handler<KeyTy>);
        this.listenersMap.set(type, listeners);
    }
    off<K extends KeyTy>(type: K, listener: Handler<K>) {
        const listeners = this.listenersMap.get(type);
        if (!listeners) {
            console.error("[BusManager]: listeners not found for", type);
            return;
        }
        const index = listeners.indexOf(listener);
        if (index !== -1) {
            listeners.splice(index, 1);
        } else {
            console.error(`[BusManager]: '${type}' listener off failed`, listener);
        }
        this.listenersMap.set(type, listeners);
    }
    emit<K extends KeyTy>(type: K, event: PayloadTy<K>) {
        console.log("[BusManager] emit:", type, event);
        this.bus.emit(type, event);
    }
}

export const BUS = new BusManager();