import React, { ComponentPropsWithoutRef } from 'react';

type SquareImageProps = ComponentPropsWithoutRef<'img'> & {
    width?: string | number;
};

const SquareImage = ({ width, style, ...props }: SquareImageProps) => {
    const formattedWidth = typeof width === 'number' ? `${width}px` : width;
    const formattedHeight = formattedWidth?.endsWith("px") ? formattedWidth : 'auto';

    return (
        <img
            {...props}
            className={'square-image'}
            style={{
                width: formattedWidth || '100%',
                height: formattedHeight || '100%',
                aspectRatio: '1/1',
                objectFit: 'cover',
                display: 'block',
                maxWidth: 'none', // 禁用默认最大宽度限制
                objectPosition: 'center center',
                ...style,
            }}
        />
    );
};

export default SquareImage;