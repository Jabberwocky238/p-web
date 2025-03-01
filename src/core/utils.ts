export function generateUUIDv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const randomHex = Math.random() * 16 | 0; // 生成 0-15 的随机整数
        const value = char === 'x' ? randomHex : (randomHex & 0x3 | 0x8); // 生成符合规则的数字
        return value.toString(16); // 转换为十六进制字符串
    });
}

export function isMobile(): boolean {
    // return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    // 屏幕宽度小于 768px 时，认为是移动端
    // console.log(window.innerWidth);
    return window.innerWidth < 568;
}

