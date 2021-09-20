import React, { ReactElement } from 'react';
import { Stage, Layer } from 'react-konva';
import KonvaDrawLayer from './KonvaDrawLayer';
import { MemoizedPageImage } from './PageImage';
import Signature from '../interfaces/Signature';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { Image } from 'react-konva';
import useImage from 'use-image';

interface IProps {
    signatures: Signature[];
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
                        bgcolor: '#e7e4ef',
                    }}
                >
                    <div id="mata" style={divStyle}>
                        <CircularProgress color="secondary" />
                    </div>
                </Box>
            </>
        );
    }
};

export default PageDrawStage;
