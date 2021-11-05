import React, { ReactElement } from 'react';
import { Group, Layer, Stage } from 'react-konva';
import Signature from '../interfaces/Signature';
import { KonvaEventObject } from 'konva/types/Node';
import SignatureShape from './SignatureShape';

interface IProps {
    signatures: Signature[];
    setSignatures: (signatures: Signature[]) => void;
    setSelectedShapeId: (selectedShapeId: string | undefined) => void;
    selectedShapeId: string | undefined;
}

const KonvaDrawLayer = (props: IProps): ReactElement => {
    const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        // deselect when clicked on empty area
        if (e == null || e.target == null) {
            return;
        }
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            props.setSelectedShapeId(undefined);
        }
    };

    return (
        <Layer onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
            {props.signatures.map((signature, i) => {
                return (
                    <>
                        <SignatureShape
                            key={i}
                            shapeProps={signature}
                            isSelected={signature.id === props.selectedShapeId}
                            onSelect={() => {
                                console.log('click2');
                                props.setSelectedShapeId(signature.id);
                            }}
                            onChange={(newAttrs: Signature) => {
                                const signs = props.signatures.slice();
                                signs[i] = newAttrs;
                                props.setSignatures(signs);
                            }}
                            onDelete={() => {
                                if (props.signatures.length == 1) {
                                    props.setSignatures([]);
                                } else {
                                    const signatures = props.signatures.slice();
                                    signatures.splice(i, 1);
                                    props.setSignatures(signatures);
                                }
                            }}
                        />
                    </>
                );
            })}
        </Layer>
    );
};

export default KonvaDrawLayer;
