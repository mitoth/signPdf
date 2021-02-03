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
    const url = `/api/v1/Document/${props.fileId}/page/${props.pageNumber}/file`;

    return (
        <>
            <Stage width={props.width} height={props.height}>
                <Layer>
                    <MemoizedPageImage pageUrl={url} width={props.width} height={props.height} />
                </Layer>
                <KonvaDrawLayer rectangles={props.rectangles} setRectangles={props.setRectangles}></KonvaDrawLayer>
            </Stage>
        </>
    );
};

export default PageDrawStage;
