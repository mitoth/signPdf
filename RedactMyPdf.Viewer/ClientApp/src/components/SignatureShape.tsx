/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { KonvaEventObject } from 'konva/types/Node';
import React, { ReactElement } from 'react';
import { Text as TextKonvaShape } from 'konva/types/shapes/Text';

// import React, { Component } from "react";
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva';
import Signature from '../interfaces/Signature';
import { Transformer as TransformerKonvaShape } from 'konva/types/shapes/Transformer';
import ScreenSize from '../services/ScreenSize';

interface IProps {
    shapeProps: Signature;
    isSelected: boolean;
    // onSelect: any;
    // onChange: any;
    // onDelete: any;
}

const SignatureShape = ({ shapeProps, isSelected }: IProps): ReactElement => {
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

    // const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    //     if (e.keyCode === 13) {
    //         const { newTextObj } = properties;

    //         newTextObj.textEditVisible = false;
    //         setProperties({ newTextObj });
    //     }
    // };

    // const handleTextEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     const { newTextObj } = properties;
    //     newTextObj.textValue = e.target.value;
    //     setProperties({ newTextObj });
    // };

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
            {/* <div> */}
            <Text
                // fontSize={20}
                // align={'left'}
                draggable
                ref={textRef}
                {...shapeProps}
                // text={properties.newTextObj.textValue}
                x={shapeProps.x}
                y={shapeProps.y}
                // wrap="word"
                // fontFamily="Great Vibes"
                // width={properties.newTextObj.width}
                // align={properties.newTextObj.align}
                onDblClick={(e) => handleTextDblClick(e)}
                {...properties.newTextObj}
            />

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

            {/* <textarea
                value={properties.newTextObj.textValue}
                style={{
                    display: properties.newTextObj.textEditVisible ? 'block' : 'none',
                    position: 'absolute',
                    top: properties.newTextObj.textY + 'px',
                    left: properties.newTextObj.textX + 'px',
                }}
                onChange={(e) => handleTextEdit(e)}
                onKeyDown={(e) => handleTextareaKeyDown(e)}
            /> */}
            {/* </div> */}
        </React.Fragment>
    );
};

export default SignatureShape;
