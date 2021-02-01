import React, { ReactElement } from 'react';
import { Stage, Layer } from 'react-konva';
import KonvaDrawLayer from './KonvaDrawLayer';
import { MemoizedPageImage } from './PageImage';
import Rectangle from './../interfaces/Rectangle';

interface IProps {
    rectangles: Rectangle[];
    pageNumber: number;
    width: number;
    height: number;
    setRectangles: (rectangles: Rectangle[]) => void;
    fileId: string;
}

const PageDrawStage = (props: IProps): ReactElement => {
    const rectangles = props.rectangles;
    const pageNumber = props.pageNumber;
    const pageWidth = props.width;
    const pageHeight = props.height;
    let width: number;
    let height: number;
    if (pageWidth > window.innerWidth) {
        const shrinkRatio = pageWidth / window.innerWidth;
        width = window.innerWidth;
        height = pageHeight / shrinkRatio;
    } else {
        width = pageWidth;
        height = pageHeight;
    }

    const url = `/api/v1/Document/${props.fileId}/page/${pageNumber}/file`;

    return (
        <>
            <Stage width={width} height={height}>
                <Layer>
                    <MemoizedPageImage pageUrl={url} width={width} height={height} />
                </Layer>
                <KonvaDrawLayer rectangles={rectangles} setRectangles={props.setRectangles}></KonvaDrawLayer>
            </Stage>
        </>
    );
};

export default PageDrawStage;
