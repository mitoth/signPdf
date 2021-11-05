/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { ReactElement } from 'react';
import { Text as TextKonvaShape } from 'konva/types/shapes/Text';
import { Label as LabelKonvaShape } from 'konva/types/shapes/Label';
import { Group as GroupKonvaShape } from 'konva/types/Group';
import { Group, Layer, Line, Rect } from 'react-konva';

// import React, { Component } from "react";
import { Text, Transformer, Tag, Label } from 'react-konva';
import Signature from '../interfaces/Signature';
import { Transformer as TransformerKonvaShape } from 'konva/types/shapes/Transformer';
import FreeDrawStage from './FreeDrawStage';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

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
    const [scaleX, setScaleX] = React.useState<number>(1);
    const [scaleY, setScaleY] = React.useState<number>(1);

    const textRef = React.useRef<GroupKonvaShape>(null);
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
            const w: number = textRef.current?.getClientRect().width as number;
            const h: number = textRef.current?.getClientRect().height as number;

            onChange({
                ...shapeProps,
                width: w,
                height: h,
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

    const enabledAnchors: string[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

    return (
        <React.Fragment>
            {console.log('1 ', shapeProps.width, '2   ', shapeProps.height)}

            <Group
                x={shapeProps.x}
                y={shapeProps.y}
                width={shapeProps.width}
                height={shapeProps.height}
                listening
                drawBorder
                draggable
                ref={textRef}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                    console.log('end');
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onDragMove={() => {
                    console.log('move');
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
                    const node: GroupKonvaShape | null = textRef.current;
                    if (!node) return;
                    const sX = node.scaleX();
                    const sY = node.scaleY();

                    const newX = node.x();
                    const newY = node.y();
                    const newWidth = Math.max(5, node.width() * sX);
                    const newHeigth = Math.max(node.height() * sY);

                    setScaleX(scaleX * sX);
                    setScaleY(scaleY * sY);
                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);

                    onChange({
                        ...shapeProps,
                        width: newWidth,
                        height: newHeigth,
                        x: newX,
                        y: newY,
                    });
                }}
            >
                {console.log('asd32f2fe ', shapeProps.width, 'a   ', shapeProps.height)}
                <Rect width={shapeProps.width} height={shapeProps.height}></Rect>
                {shapeProps.lines &&
                    shapeProps.lines.map((line: { points: number[] }, i: React.Key | null | undefined) => (
                        <Line
                            key={i}
                            points={line.points}
                            stroke="#000000"
                            strokeWidth={5}
                            tension={0.5}
                            lineCap="round"
                            globalCompositeOperation="source-over"
                            scaleX={scaleX}
                            scaleY={scaleY}
                        />
                    ))}
            </Group>

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
                    onClick={() => {
                        console.log('clicul');
                    }}
                    rotateEnabled={false}
                    enabledAnchors={enabledAnchors}
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
