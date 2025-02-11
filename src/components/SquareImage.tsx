import React, { ComponentPropsWithoutRef } from 'react';

type SquareImageProps = ComponentPropsWithoutRef<'img'> & {
    width?: string | number;
};

const SquareImage = ({ width, style, ...props }: SquareImageProps) => {
    const formattedWidth = typeof width === 'number' ? `${width}px` : width;

    return (
        <img
            {...props}
            style={{
                ...style,
                width: formattedWidth || '100%',
                height: 'auto', // 由 aspectRatio 自动计算
                aspectRatio: '1/1',
                objectFit: 'cover',
                display: 'block',
                maxWidth: 'none', // 禁用默认最大宽度限制
                objectPosition: 'center center',
            }}
        />
    );
};

export default SquareImage;