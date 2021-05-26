import React, { ReactElement } from 'react';
import { Stage, Layer } from 'react-konva';
import KonvaDrawLayer from './KonvaDrawLayer';
import { MemoizedPageImage } from './PageImage';
import Rectangle from './../interfaces/Rectangle';
import Signature from '../interfaces/Signature';

interface IProps {
    rectangles: Rectangle[];
    signatures: Signature[];
    pageNumber: number;
    width: number;
    height: number;
    setRectangles: (rectangles: Rectangle[]) => void;
    setSignatures: (signatures: Signature[]) => void;
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
                    setSignatures={props.setSignatures}
                    selectedShapeId={props.selectedShapeId}
                    setSelectedShapeId={props.setSelectedShapeId}
                ></KonvaDrawLayer>
            </Stage>
        </>
    );
};

export default PageDrawStage;
