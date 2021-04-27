import React, { ReactElement } from 'react';
import { Layer } from 'react-konva';
import RectangleShape from './RectangleShape';
import Rectangle from './../interfaces/Rectangle';
import SignatureBox from './../interfaces/SignatureBox';
import { KonvaEventObject } from 'konva/types/Node';
import SignatureBoxShape from './SignatureBoxShape';

interface IProps {
    rectangles: Rectangle[];
    signatures: SignatureBox[];
    setRectangles: (rectangles: Rectangle[]) => void;
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
                            key={i}
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
                        {/* <SignatureBox key={i}></SignatureBox> */}
                    </>
                );
            })}
            {props.signatures.map((signature, i) => {
                return (
                    <>
                        <SignatureBoxShape
                            key={i}
                            shapeProps={signature}
                            isSelected={signature.id === props.selectedShapeId}
                        />
                        {/* <SignatureBox key={i}></SignatureBox> */}
                    </>
                );
            })}
        </Layer>
    );
};

export default KonvaDrawLayer;
