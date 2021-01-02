import React, { ReactElement } from 'react';
import { Layer } from 'react-konva';
import RectangleShape from './RectangleShape';
import Rectangle from './../interfaces/Rectangle';
import { KonvaEventObject } from 'konva/types/Node';

interface IProps {
    rectangles: Rectangle[];
    setRectangles: (rectangles: Rectangle[]) => void;
}

const KonvaDrawLayer = (props: IProps): ReactElement => {
    const rectangles = props.rectangles;

    const [selectedId, selectShape] = React.useState<number | null>(null);

    const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        // deselect when clicked on empty area
        if (e == null || e.target == null) {
            return;
        }
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShape(null);
        }
    };

    return (
        <Layer onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
            {rectangles.map((rect, i) => {
                return (
                    <RectangleShape
                        key={i}
                        shapeProps={rect}
                        isSelected={rect.id === selectedId}
                        onSelect={() => {
                            selectShape(rect.id);
                        }}
                        onChange={(newAttrs: Rectangle) => {
                            const rects = rectangles.slice();
                            rects[i] = newAttrs;
                            props.setRectangles(rects);
                        }}
                    />
                );
            })}
        </Layer>
    );
};

export default KonvaDrawLayer;
