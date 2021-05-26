import React, { ReactElement } from 'react';
import { Layer } from 'react-konva';
import RectangleShape from './RectangleShape';
import Rectangle from './../interfaces/Rectangle';
import Signature from '../interfaces/Signature';
import { KonvaEventObject } from 'konva/types/Node';
import SignatureShape from './SignatureShape';

interface IProps {
    rectangles: Rectangle[];
    signatures: Signature[];
    setRectangles: (rectangles: Rectangle[]) => void;
    setSignatures: (signatures: Signature[]) => void;
    setSelectedShapeId: (selectedShapeId: string | null) => void;
    selectedShapeId: string | null;
}

const KonvaDrawLayer = (props: IProps): ReactElement => {
    const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        // deselect when clicked on empty area
        if (e == null || e.target == null) {
            return;
        }
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            props.setSelectedShapeId(null);
        }
    };

    return (
        <Layer onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
            {props.rectangles.map((rect, i) => {
                return (
                    <>
                        <RectangleShape
                            key={rect.id}
                            shapeProps={rect}
                            isSelected={rect.id === props.selectedShapeId}
                            onSelect={() => {
                                props.setSelectedShapeId(rect.id);
                            }}
                            onChange={(newAttrs: Rectangle) => {
                                const rects = props.rectangles.slice();
                                rects[i] = newAttrs;
                                props.setRectangles(rects);
                            }}
                            onDelete={() => {
                                if (props.rectangles.length == 1) {
                                    props.setRectangles([]);
                                } else {
                                    const rects = props.rectangles.slice();
                                    rects.splice(i, 1);
                                    props.setRectangles(rects);
                                }
                            }}
                        />
                    </>
                );
            })}
            {props.signatures.map((signature, i) => {
                return (
                    <>
                        <SignatureShape
                            key={signature.id}
                            shapeProps={signature}
                            isSelected={signature.id === props.selectedShapeId}
                            onSelect={() => {
                                props.setSelectedShapeId(signature.id);
                            }}
                            onChange={(newAttrs: Signature) => {
                                const signs = props.signatures.slice();
                                signs[i] = newAttrs;
                                props.setSignatures(signs);
                            }}
                            onDelete={() => {
                                if (props.signatures.length == 1) {
                                    props.setSignatures([]);
                                } else {
                                    const signatures = props.signatures.slice();
                                    signatures.splice(i, 1);
                                    props.setSignatures(signatures);
                                }
                            }}
                        />
                    </>
                );
            })}
        </Layer>
    );
};

export default KonvaDrawLayer;
