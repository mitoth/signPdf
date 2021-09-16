import React, { ReactElement } from 'react';
import { Stage, Layer } from 'react-konva';
import KonvaDrawLayer from './KonvaDrawLayer';
import { MemoizedPageImage } from './PageImage';
import Signature from '../interfaces/Signature';

interface IProps {
    signatures: Signature[];
    pageNumber: number;
    width: number;
    height: number;
    setSignatures: (signatures: Signature[]) => void;
    fileId: string;
    setSelectedShapeId: (selectedShapeId: string | undefined) => void;
    selectedShapeId: string | undefined;
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
                    signatures={props.signatures}
                    setSignatures={props.setSignatures}
                    selectedShapeId={props.selectedShapeId}
                    setSelectedShapeId={props.setSelectedShapeId}
                ></KonvaDrawLayer>
            </Stage>
        </>
    );
};

export default PageDrawStage;
