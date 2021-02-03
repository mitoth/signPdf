import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';
import PropTypes from 'prop-types';

interface IProps {
    pageUrl: string;
    width: number;
    height: number;
}

const PageImage = ({ pageUrl, width, height }: IProps) => {
    const [image] = useImage(pageUrl);
    if (image) {
        image.width = width;
        image.height = height;
    }
    return <Image image={image} preventDefault={false} />;
};

PageImage.propTypes = {
    pageUrl: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export const MemoizedPageImage = React.memo(PageImage);
