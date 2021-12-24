/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Stack from '@mui/material/Stack';
import DrawLine from '../interfaces/DrawLine';
import ReactGa from 'react-ga';

interface IProps {
    setStageHeight: (height: number) => void;
    setStageWidth: (width: number) => void;
    setImage: (image: string) => void;
}

const FreeDrawStage = (props: IProps): ReactElement => {
    const [lines, setLines] = React.useState<DrawLine[]>([]);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
    const isDrawing = React.useRef(false);
    const stageRef = React.useRef(null);

    const handleMouseDown = (e: any) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        e.target.preventDefault();
        setLines([...lines, { points: [pos.x, pos.y] }]);
    };

    const handleMouseMove = (e: any) => {
        // no drawing - skipping
        if (!isDrawing.current) {
            return;
        }
        const stage = e.target.getStage();
        e.target.preventDefault();
        const point = stage.getPointerPosition();
        const lastLine = lines[lines.length - 1];
        // add point
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        // replace last
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
        const uri = (stageRef?.current as any).toDataURL();
        props.setImage(uri);
        const x = document.getElementById('drawStage');
        let w: number;
        let h: number;
        if (x) {
            w = (x as any).offsetWidth;
            h = (x as any).offsetHeight;
        } else {
            w = 200;
            h = 100;
        }
        props.setStageHeight(h);
        props.setStageWidth(w);
    };

    useEffect(() => {
        ReactGa.event({
            category: 'PageLoad',
            action: 'FreeDrawStage',
        });

        const x = document.getElementById('id1');
        if (x) {
            setDimensions({
                width: (x as any).offsetWidth, // * 0.8,
                height: (x as any).offsetHeight, // * 0.6,
            });
        } else {
            setDimensions({
                width: 200,
                height: 100,
            });
        }
    }, []);

    return (
        <div>
            <div className="drawStageBorder" id="drawStage">
                <Stage
                    width={dimensions.width}
                    height={dimensions.height}
                    onMouseDown={handleMouseDown}
                    onMousemove={handleMouseMove}
                    onMouseup={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    ref={stageRef}
                >
                    <Layer>
                        {lines.map((line: { points: number[] }, i: React.Key | null | undefined) => (
                            <Line
                                key={i}
                                points={line.points}
                                stroke="#000000"
                                strokeWidth={3}
                                tension={0.5}
                                lineCap="round"
                                globalCompositeOperation="source-over"
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>
            <Stack direction="row" alignItems="start" spacing={1}>
                <IconButton
                    aria-label="delete"
                    size="medium"
                    onClick={() => {
                        const uri = (stageRef?.current as any).toDataURL();
                        setLines([]);
                    }}
                >
                    <DeleteIcon fontSize="inherit" color="error" />
                </IconButton>
            </Stack>
        </div>
    );
};

export default FreeDrawStage;
