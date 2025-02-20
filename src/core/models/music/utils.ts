import { Music } from ".";

export async function cropAndResizeImage(file: File): Promise<File> {
    // 创建图片对象
    const img = new Image();
    img.src = URL.createObjectURL(file);

    await new Promise((resolve) => (img.onload = resolve));

    // 计算裁剪区域
    const size = Math.min(img.width, img.height);
    const x = (img.width - size) / 2;
    const y = (img.height - size) / 2;

    // 创建 Canvas 并绘制
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
        img,
        x, y,         // 源图像裁剪起始点
        size, size,   // 源图像裁剪区域
        0, 0,         // Canvas 绘制起始点
        400, 400      // Canvas 绘制尺寸
    );

    // 转为 Blob（可上传或展示）
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const f = new File([blob!], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
            resolve(f);
        }, 'image/jpeg', 0.9);
    });
}

export async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
