import React, { ReactElement } from 'react';
import { Layer } from 'react-konva';
import RectangleShape from './RectangleShape';
import Rectangle from './../interfaces/Rectangle';
import { KonvaEventObject } from 'konva/types/Node';

interface IProps {
    rectangles: Rectangle[];
    setRectangles: (rectangles: Rectangle[]) => void;
    setSelectedShapeId: (selectedShapeId: number | null) => void;
    selectedShapeId: number | null;
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
                );
            })}
        </Layer>
    );
};

export default KonvaDrawLayer;
