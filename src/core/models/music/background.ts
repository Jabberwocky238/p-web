import { MusicParams } from ".";

class BackgroundTaskManager {

}


class MusicDownloadTask {
    constructor(
        public musicParams: MusicParams,
        public apiBaseUrl: string,
    ) { }

    private async checkDiff() {
        let diff = {
            blob: false,
            cover: false,
            meta: false,
        }
        // 确认是否需要更新音乐和cover等大文件

        // 确认是否有版本差异
        return diff;
    }

    async resolve() {
        const { blob, cover, meta } = await this.checkDiff();

    }
}