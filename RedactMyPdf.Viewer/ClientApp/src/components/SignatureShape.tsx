/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { ReactElement } from 'react';
import { Label as LabelKonvaShape } from 'konva/types/shapes/Label';
import { Image as ImageKonvaShape } from 'konva/types/shapes/Image';
import { Group } from 'react-konva';

// import React, { Component } from "react";
import { Text, Transformer, Tag, Label, Image as KonvaImage } from 'react-konva';
import SignaturePosition from '../interfaces/SignaturePosition';
import { Transformer as TransformerKonvaShape } from 'konva/types/shapes/Transformer';

interface IProps {
    shapeProps: SignaturePosition;
    isSelected: boolean;
    imageBase64: string;
    onSelect: any;
    onChange: any;
    onDelete: any;
}

const SignatureShape = ({
    shapeProps,
    onSelect,
    isSelected,
    onChange,
    onDelete,
    imageBase64,
}: IProps): ReactElement => {
    const [labelPositionX, setLabelPostionX] = React.useState<number>(0);
    const [labelPositionY, setLabelPostionY] = React.useState<number>(0);

    const textRef = React.useRef<ImageKonvaShape>(null);
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

    const getImage = (s: string) => {
        const myImage: HTMLImageElement = new Image();
        myImage.src = s;

        return myImage;
    };

    return (
        <React.Fragment>
            <Group>
                {imageBase64 && (
                    <KonvaImage
                        image={getImage(imageBase64)}
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
                            const node: ImageKonvaShape | null = textRef.current;
                            if (!node) return;
                            const sX = node.scaleX();
                            const sY = node.scaleY();

                            const newX = node.x();
                            const newY = node.y();
                            const newWidth = Math.max(5, node.width() * sX);
                            const newHeigth = Math.max(node.height() * sY);

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
                    ></KonvaImage>
                )}
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
