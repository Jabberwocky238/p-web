import { useDB } from "../indexedDB";
import request from "../request";

export type UserParams = {
    uid: string;
    nickname: string;
    avatar: string;
    token: string;
}

export class User {
    constructor(
        public uid: string,
        public nickname: string,
        public avatar: string,
        public token: string,
    ) { }

    static async register(api: string) {
        const url = `${api}/client/register`;
        const res = await fetch(url, {
            method: 'GET',
        });
        const data = await res.json() as {
            uid: string,
            token: string,
        }
        const user = new User(data.uid, "anonymous", "", data.token);
        user.dump();
        return user;
    }

    static async login(api: string, uid: string, token: string) {
        try {
            const url = `${api}/client/login`;
            const res = await request(url, 'POST', {
                uid: uid,
                token: token,
            })
            const data = await res.json() as {
                avatar: string,
                nickname: string,
            }
            const user = new User(uid, data.nickname, data.avatar, token);
            user.dump();
            return user;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    dump() {
        localStorage.setItem('Client_avatar', this.avatar);
        localStorage.setItem('Client_nickname', this.nickname);
        localStorage.setItem('Client_token', this.token);
        localStorage.setItem('Client_uuid', this.uid);
    }
    load() {
        const avatar = localStorage.getItem('Client_avatar') ?? "";
        const nickname = localStorage.getItem('Client_nickname') ?? "anonymous";
        const token = localStorage.getItem('Client_token');
        const uid = localStorage.getItem('Client_uid');
        if (!uid || !token) {
            return undefined;
        }
        return new User(uid, nickname, avatar, token);
    }
}
