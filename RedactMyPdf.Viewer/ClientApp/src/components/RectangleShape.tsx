/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Rect as RectKonvaShape } from 'konva/types/shapes/Rect';
import { Label as LabelKonvaShape } from 'konva/types/shapes/Label';
import { Transformer as TransformerKonvaShape } from 'konva/types/shapes/Transformer';
import React, { ReactElement } from 'react';
import { Rect, Tag, Label, Text, Transformer } from 'react-konva';

interface IProps {
    shapeProps: any;
    isSelected: boolean;
    onSelect: any;
    onChange: any;
    onDelete: any;
}

const RectangleShape = ({ shapeProps, isSelected, onSelect, onChange, onDelete }: IProps): ReactElement => {
    const rectRef = React.useRef<RectKonvaShape>();
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
                    const node: RectKonvaShape | undefined = rectRef.current;
                    if (!node) return;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        // set minimal value
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        console.log('traassd');
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};

export default RectangleShape;
