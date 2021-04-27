import React, { ReactElement } from 'react';
import { Stage, Layer } from 'react-konva';
import KonvaDrawLayer from './KonvaDrawLayer';
import { MemoizedPageImage } from './PageImage';
import Rectangle from './../interfaces/Rectangle';
import SignatureBox from './../interfaces/SignatureBox';

interface IProps {
    rectangles: Rectangle[];
    signatures: SignatureBox[];
    pageNumber: number;
    width: number;
    height: number;
    setRectangles: (rectangles: Rectangle[]) => void;
    fileId: string;
    setSelectedShapeId: (selectedShapeId: string | null) => void;
    selectedShapeId: string | null;
}

const PageDrawStage = (props: IProps): ReactElement => {
    const url = `/api/v1/Document/${props.fileId}/page/${props.pageNumber}/file`;

    return (
        <>
            <Stage width={props.width} height={props.height}>
                <Layer>
                    <MemoizedPageImage pageUrl={url} width={props.width} height={props.height} />
                </Layer>
                <KonvaDrawLayer
                    rectangles={props.rectangles}
                    signatures={props.signatures}
                    setRectangles={props.setRectangles}
                    selectedShapeId={props.selectedShapeId}
                    setSelectedShapeId={props.setSelectedShapeId}
                ></KonvaDrawLayer>
            </Stage>
        </>
    );
};

export default PageDrawStage;
