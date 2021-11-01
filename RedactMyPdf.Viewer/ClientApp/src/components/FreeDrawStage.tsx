/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement, useEffect } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Stack from '@mui/material/Stack';

interface IProps {
    width: number;
    height: number;
}

const FreeDrawStage = (): ReactElement => {
    const [tool, setTool] = React.useState('pen');
    const [lines, setLines] = React.useState<any>([]);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
    const isDrawing = React.useRef(false);

    const handleMouseDown = (e: any) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    };

    const handleMouseMove = (e: any) => {
        // no drawing - skipping
        if (!isDrawing.current) {
            return;
        }
        const stage = e.target.getStage();
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
    };

    const getWidth = () => {
        return 300;
    };

    useEffect(() => {
        const x = document.getElementById('id1');
        if (x) {
            setDimensions({
                width: (x as any).offsetWidth * 0.8,
                height: (x as any).offsetHeight * 0.5,
            });
        }

        console.log('asd  ' + x);
    }, []);

    return (
        <div>
            <div className="drawStageBorder">
                <Stage
                    width={dimensions.width}
                    height={dimensions.height}
                    onMouseDown={handleMouseDown}
                    onMousemove={handleMouseMove}
                    onMouseup={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                >
                    <Layer>
                        {lines.map((line: { points: number[]; tool: string }, i: React.Key | null | undefined) => (
                            <Line
                                key={i}
                                points={line.points}
                                stroke="#000000"
                                strokeWidth={5}
                                tension={0.5}
                                lineCap="round"
                                globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>
            <Stack direction="row" alignItems="start" spacing={1}>
                <IconButton aria-label="delete" size="medium" onClick={() => setLines([])}>
                    <DeleteIcon fontSize="inherit" color="error" />
                </IconButton>
            </Stack>
        </div>
    );
};

export default FreeDrawStage;
