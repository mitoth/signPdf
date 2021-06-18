/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { KonvaEventObject } from 'konva/types/Node';
import React, { ReactElement } from 'react';
import { Text as TextKonvaShape } from 'konva/types/shapes/Text';
import { Label as LabelKonvaShape } from 'konva/types/shapes/Label';

// import React, { Component } from "react";
import { Text, Transformer, Tag, Label } from 'react-konva';
import Signature from '../interfaces/Signature';
import { Transformer as TransformerKonvaShape } from 'konva/types/shapes/Transformer';

interface IProps {
    shapeProps: Signature;
    isSelected: boolean;
    onSelect: any;
    onChange: any;
    onDelete: any;
}

const SignatureShape = ({ shapeProps, onSelect, isSelected, onChange, onDelete }: IProps): ReactElement => {
    const [labelPositionX, setLabelPostionX] = React.useState<number>(0);
    const [labelPositionY, setLabelPostionY] = React.useState<number>(0);

    const textRef = React.useRef<TextKonvaShape>(null);
    const labelRef = React.useRef<LabelKonvaShape>();

    const trRef: React.MutableRefObject<TransformerKonvaShape | null> = React.useRef<TransformerKonvaShape>() as React.MutableRefObject<TransformerKonvaShape | null>;

    React.useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            const current: any = trRef.current;
            if (current) {
                current!.nodes([textRef.current]);
                current!.getLayer()!.batchDraw();
                setLabelPostionX(getX());
                setLabelPostionY(getY());
            }
            labelRef.current?.show();
        } else {
            labelRef.current?.hide();
        }
    }, [isSelected]);

    React.useEffect(() => {
        if (!shapeProps.width) {
            onChange({
                ...shapeProps,
                width: textRef.current?.getWidth(),
                height: textRef.current?.getHeight(),
            });
        }
    }, []);

    function getX(): number {
        if (textRef.current) {
            return (
                textRef.current.attrs.x +
                textRef.current.width() * (textRef.current.attrs.scaleX ? textRef.current.attrs.scaleX : 1)
            );
        }
        return 0;
    }

    function getY(): number {
        if (textRef.current) {
            return textRef.current.attrs.y - 10;
        }
        return 0;
    }

    return (
        <React.Fragment>
            <Text
                draggable
                ref={textRef}
                {...shapeProps}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onDragMove={() => {
                    if (textRef.current) {
                        setLabelPostionX(getX());
                        setLabelPostionY(getY());
                    }
                }}
                onTransform={() => {
                    if (textRef.current) {
                        setLabelPostionX(getX());
                        setLabelPostionY(getY());
                    }
                }}
                onTransformEnd={() => {
                    const node: TextKonvaShape | null = textRef.current;
                    if (!node) return;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    const newX = node.x();
                    const newY = node.y();
                    const newWidth = Math.max(5, node.width() * scaleX);
                    const newHeigth = Math.max(node.height() * scaleY);
                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);

                    onChange({
                        ...shapeProps,
                        width: newWidth,
                        height: newHeigth,
                        fontSize: newHeigth / 1.3,
                        x: newX,
                        y: newY,
                    });
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

            <Label
                x={labelPositionX}
                y={labelPositionY}
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
        </React.Fragment>
    );
};

export default SignatureShape;
