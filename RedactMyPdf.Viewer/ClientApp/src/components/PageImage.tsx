import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';
import PropTypes from 'prop-types';

interface IProps {
    pageUrl: string;
}

const PageImage = ({ pageUrl }: IProps) => {
    const [image] = useImage(pageUrl);
    return <Image image={image} />;
};

PageImage.propTypes = {
    pageUrl: PropTypes.string.isRequired,
};

export const MemoizedPageImage = React.memo(PageImage);
