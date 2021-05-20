/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { KonvaEventObject } from 'konva/types/Node';
import React, { ReactElement } from 'react';
import { Text as TextKonvaShape } from 'konva/types/shapes/Text';

// import React, { Component } from "react";
import { Text, Transformer } from 'react-konva';
import Signature from '../interfaces/Signature';
import { Transformer as TransformerKonvaShape } from 'konva/types/shapes/Transformer';
import ScreenSize from '../services/ScreenSize';

interface IProps {
    shapeProps: Signature;
    isSelected: boolean;
    onSelect: any;
    // onChange: any;
    // onDelete: any;
}

const SignatureShape = ({ shapeProps, onSelect, isSelected }: IProps): ReactElement => {
    const fontSize = (ScreenSize.GetScreenHeight() + ScreenSize.GetScreenWidth()) / 50;
    console.log('fontSize ' + fontSize);

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

    const trRef: React.MutableRefObject<TransformerKonvaShape | null> = React.useRef<TransformerKonvaShape>() as React.MutableRefObject<TransformerKonvaShape | null>;

    React.useEffect(() => {
        // we need to attach transformer manually
        const current: any = trRef.current;
        if (current) {
            current!.nodes([textRef.current]);
            current!.getLayer()!.batchDraw();
        }
        console.log({ ...properties.newTextObj });
    }, [isSelected]);

    const handleTextDblClick = (e: KonvaEventObject<MouseEvent>) => {
        const absPos = e.target.getAbsolutePosition();
        const { newTextObj } = properties;
        newTextObj.textEditVisible = true;
        newTextObj.textX = absPos.x;
        newTextObj.textY = absPos.y;
        setProperties({ newTextObj });
    };

    return (
        <React.Fragment>
            <Text
                draggable
                ref={textRef}
                {...shapeProps}
                x={shapeProps.x}
                y={shapeProps.y}
                onDblClick={(e) => handleTextDblClick(e)}
                {...properties.newTextObj}
                onClick={onSelect}
                onTap={onSelect}
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
                />
            )}
        </React.Fragment>
    );
};

export default SignatureShape;
