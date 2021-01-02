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
    const width = props.width;
    const height = props.height;

    const url = `http://localhost:59048/api/v1/Document/${props.fileId}/page/${pageNumber}/file`;

    return (
        <>
            <Stage width={width} height={height}>
                <Layer>
                    <MemoizedPageImage pageUrl={url} />
                </Layer>
                <KonvaDrawLayer rectangles={rectangles} setRectangles={props.setRectangles}></KonvaDrawLayer>
            </Stage>
        </>
    );
};

export default PageDrawStage;
