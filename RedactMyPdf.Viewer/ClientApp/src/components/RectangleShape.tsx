/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Rect as RectKonvaShape } from 'konva/types/shapes/Rect';
import { Label as LabelKonvaShape } from 'konva/types/shapes/Label';
import { Transformer as TransformerKonvaShape } from 'konva/types/shapes/Transformer';
import React, { ReactElement } from 'react';
import { Rect, Tag, Label, Text, Transformer } from 'react-konva';
import Rectangle from '../interfaces/Rectangle';

interface IProps {
    shapeProps: Rectangle;
    isSelected: boolean;
    onSelect: any;
    onChange: any;
    onDelete: any;
}

const RectangleShape = ({ shapeProps, isSelected, onSelect, onChange, onDelete }: IProps): ReactElement => {
    const rectRef = React.useRef<RectKonvaShape>(null);
    const labelRef = React.useRef<LabelKonvaShape>();

    const trRef: React.MutableRefObject<TransformerKonvaShape | null> = React.useRef<TransformerKonvaShape>() as React.MutableRefObject<TransformerKonvaShape | null>;

    React.useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            const current: any = trRef.current;
            if (current) {
                current!.nodes([rectRef.current]);
                current!.getLayer()!.batchDraw();
            }
            labelRef.current?.show();
        } else {
            labelRef.current?.hide();
        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <Label
                x={
                    rectRef.current?.attrs.x
                        ? rectRef.current?.attrs.x + rectRef.current.attrs.width
                        : shapeProps.x + shapeProps.width
                }
                y={rectRef.current?.attrs.y ? rectRef.current?.attrs.y - 10 : shapeProps.y - 10}
                ref={labelRef as React.MutableRefObject<LabelKonvaShape>}
                opacity={0.9}
            >
                <Tag pointerDirection="down" pointerHeight={5} pointerWidth={8} fill="red"></Tag>
                <Text
                    text="X"
                    onClick={() => {
                        onDelete();
                    }}
                    onTap={() => {
                        onDelete();
                    }}
                    padding={4}
                    align="center"
                    fontFamily="Calibri"
                    fontStyle="bold"
                    fontSize={15}
                    width={20}
                    height={20}
                ></Text>
            </Label>

            <Rect
                onClick={onSelect}
                onTap={onSelect}
                ref={rectRef}
                {...shapeProps}
                draggable
                onDragStart={() => {
                    if (isSelected) {
                        labelRef.current?.hide();
                    }
                }}
                onDragEnd={(e) => {
                    if (isSelected) {
                        labelRef.current?.show();
                    }
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransformStart={() => {
                    if (isSelected) {
                        labelRef.current?.hide();
                    }
                }}
                onTransformEnd={() => {
                    if (isSelected) {
                        labelRef.current?.show();
                    }
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node: RectKonvaShape | null = rectRef.current;
                    if (!node) return;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    const newX = node.x();
                    const newY = node.y();
                    const newWidth = Math.max(5, node.width() * scaleX);
                    const newHeigth = Math.max(node.height() * scaleY);
                    onChange({
                        ...shapeProps,
                        x: newX,
                        y: newY,
                        // set minimal value
                        width: newWidth,
                        height: newHeigth,
                    });

                    if (labelRef.current) {
                        labelRef.current.attrs.x = newX + newWidth;
                        labelRef.current.attrs.y = newY - 10;
                    }
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                    rotateEnabled={false}
                />
            )}
        </React.Fragment>
    );
};

export default RectangleShape;
