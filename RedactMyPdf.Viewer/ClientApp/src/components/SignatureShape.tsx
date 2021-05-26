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
import ScreenSize from '../services/ScreenSize';

interface IProps {
    shapeProps: Signature;
    isSelected: boolean;
    onSelect: any;
    onChange: any;
    onDelete: any;
}

const SignatureShape = ({ shapeProps, onSelect, isSelected, onChange, onDelete }: IProps): ReactElement => {
    const fontSize = (ScreenSize.GetScreenHeight() + ScreenSize.GetScreenWidth()) / 50;
    const [labelPositionX, setLabelPostionX] = React.useState<number>(0);
    const [labelPositionY, setLabelPostionY] = React.useState<number>(0);

    const [properties, setProperties] = React.useState({
        newTextObj: {
            textEditVisible: false,
            textX: 0,
            fill: 'black',
            textY: 0,
            fontSize: fontSize,
            padding: 10,
            fontFamily: 'Great Vibes',
            // width: 40,
            fontStyle: 'italic',
            align: 'center',
            wrap: 'word',
        },
    });

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

    const handleTextDblClick = (e: KonvaEventObject<MouseEvent>) => {
        const absPos = e.target.getAbsolutePosition();
        const { newTextObj } = properties;
        newTextObj.textEditVisible = true;
        newTextObj.textX = absPos.x;
        newTextObj.textY = absPos.y;
        setProperties({ newTextObj });
    };

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
                onDblClick={(e) => handleTextDblClick(e)}
                {...properties.newTextObj}
                onClick={onSelect}
                onTap={onSelect}
                onDragStart={() => {
                    if (isSelected) {
                        labelRef.current?.hide();
                    }
                }}
                onDragEnd={(e) => {
                    if (isSelected) {
                        labelRef.current?.show();
                        if (textRef.current) {
                            setLabelPostionX(getX());
                            setLabelPostionY(getY());
                        }
                    }
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransform={() => {
                    if (textRef.current) {
                        setLabelPostionX(getX());
                        setLabelPostionY(getY());
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
``;
