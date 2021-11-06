import React, { ReactElement } from 'react';
import { Stage, Layer } from 'react-konva';
import KonvaDrawLayer from './KonvaDrawLayer';
import Signature from '../interfaces/SignaturePosition';
import DrawLine from '../interfaces/DrawLine';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Image } from 'react-konva';
import useImage from 'use-image';

interface IProps {
    signatures: Signature[];
    signatureLines: DrawLine[];
    pageNumber: number;
    width: number;
    height: number;
    setSignatures: (signatures: Signature[]) => void;
    fileId: string;
    setSelectedShapeId: (selectedShapeId: string | undefined) => void;
    selectedShapeId: string | undefined;
}

const PageDrawStage = (props: IProps): ReactElement => {
    const url = `/api/v1/Document/${props.fileId}/page/${props.pageNumber}/file`;

    const divStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: `${props.height}px`,
    };

    const [image, loadingState] = useImage(url);
    if (image) {
        image.width = props.width;
        image.height = props.height;
    }

    if (loadingState == 'loaded') {
        return (
            <>
                <Stage width={props.width} height={props.height}>
                    <Layer>
                        <Image image={image} preventDefault={false} />
                    </Layer>
                    <KonvaDrawLayer
                        signatures={props.signatures}
                        setSignatures={props.setSignatures}
                        selectedShapeId={props.selectedShapeId}
                        setSelectedShapeId={props.setSelectedShapeId}
                        signatureLines={props.signatureLines}
                    ></KonvaDrawLayer>
                </Stage>
            </>
        );
    } else {
        return (
            <>
                <Box
                    sx={{
                        width: props.width,
                        height: props.height,
                        bgcolor: '#FFFFFF',
                        color: '#757ce8',
                    }}
                >
                    <div id="mata" style={divStyle}>
                        <CircularProgress color="inherit" />
                    </div>
                </Box>
            </>
        );
    }
};

export default PageDrawStage;
