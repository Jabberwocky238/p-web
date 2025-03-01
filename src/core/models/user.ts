import { useDB } from "../indexedDB";

export type UserParams = {
    uuid: string;
    nickname: string;
    avatar: string;
    token: string;
}

export class User {
    constructor(
        public uuid: string,
        public nickname: string,
        public avatar: string,
        public token: string,
    ) { }

    
}
