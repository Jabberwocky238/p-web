import { Music } from "./music";

class Remote {
    constructor(
        private readonly _url: string
    ) { }

}

class MusicSync {
    constructor(
        private readonly m: Music,
    ) { }

    async checkRemote() {
        // 检查UUID是否冲突
        // 检查有无同名音乐

        return remote.checkRemoteMusic(this.m);
    }

    async checkLocal() {
        // 检查是否存在
        return this.m.checkLocal();
    }
}