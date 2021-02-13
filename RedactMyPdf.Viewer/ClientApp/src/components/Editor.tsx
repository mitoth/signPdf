import React, { ReactElement } from 'react';
import PageDrawStage from './PageDrawStage';
import UploadService from '../services/FileUploadService';
// import FileDownload from './FileDownload';
import Rectangle from '../interfaces/Rectangle';
import Page from '../interfaces/Page';
import FileDownload from './FileDownload';
import { Location } from 'history';
import { HubConnectionBuilder } from '@microsoft/signalr';

interface PageState {
    pages: Page[];
}

interface IProps {
    location: Location<PageState>;
}

const Editor = (props: IProps): ReactElement => {
    const initialRectangles: Rectangle[] = [
        {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            fill: 'red',
            id: 1,
        },
        {
            x: 150,
            y: 150,
            width: 100,
            height: 100,
            fill: 'green',
            id: 2,
        },
    ];

    function generateRectangle(): Rectangle {
        return {
            id: Math.random(),
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            width: 100,
            height: 100,
            fill: 'red',
        };
    }

    const [rectangles, setRectangles] = React.useState<Rectangle[]>(initialRectangles);
    const [downloadPath, setDownloadPath] = React.useState('');
    const [isDownloadInProgress, setIsDownloadInProgress] = React.useState(false);
    console.log(downloadPath);

    const addRectanglesClick = () => {
        const rectangle = generateRectangle();
        const updatedRectangles: Rectangle[] = [...rectangles];
        updatedRectangles.push(rectangle);
        setRectangles(updatedRectangles);
    };

    const fileId: string = window.location.pathname.split('/')[2];
    const numberOfPages: number = parseInt(window.location.pathname.split('/')[3]);

    const saveDocumentClick = () => {
        setIsDownloadInProgress(true);
        console.log(rectangles);
        const rectangleShapes = rectangles.map((r) => {
            let width: number;
            let height: number;
            let x: number;
            let y: number;
            //TODO = use real index instead of 0
            const pageWidth = props.location.state.pages[0].width;
            if (pageWidth > window.innerWidth) {
                const shrinkRatio = pageWidth / window.innerWidth;
                width = r.width * shrinkRatio;
                height = r.height * shrinkRatio;
                x = r.x * shrinkRatio;
                y = r.y * shrinkRatio;
            } else {
                width = r.width;
                height = r.height;
                x = r.x;
                y = r.y;
            }

            return {
                width: width,
                height: height,
                borderHtmlColorCode: '#FF5733',
                borderLineWidth: 2,
                fillHtmlColorCode: '#FF5733',
                axis: { x: x, y: y },
            };
        });

        const shapes = [
            {
                PageNumber: 1,
                Shapes: rectangleShapes,
            },
        ];

        const connection = new HubConnectionBuilder().withUrl('/hubs/files').withAutomaticReconnect().build();
        if (connection) {
            connection
                .start()
                .then(() => {
                    console.log('Connected from editor!');
                    connection.invoke('getConnectionId').then((connectionId: string) => {
                        console.log('getConnectionId ' + connectionId);
                        UploadService.save(fileId, shapes, connectionId);
                    });

                    connection.on('FileBurned', (docJson) => {
                        const fileId = JSON.parse(docJson);
                        console.log('FileBurned' + fileId);
                        setDownloadPath(`/api/v1/Document/${fileId}/burn`);
                        setIsDownloadInProgress(false);
                    });
                })
                .catch((e) => console.log('Connection failed: ', e));
        }
    };

    const handleDownloadComplete = () => {
        setDownloadPath('');
    };

    const updateRectangles = (rects: Rectangle[]) => {
        setRectangles(rects);
    };

    const maxWidth = window.innerWidth > 960 ? 960 : window.innerWidth;

    return (
        <table className="center">
            <thead className="d-flex bd-highlight">
                <td className="p-2 flex-grow-1">
                    <button className="btn btn-primary" type="button" onClick={addRectanglesClick}>
                        Add rectangle
                    </button>
                </td>
                <td className="p-2">
                    {downloadPath && (
                        <FileDownload downloadPath={downloadPath} onDownloadComplete={handleDownloadComplete} />
                    )}
                    <button className="btn btn-success" onClick={saveDocumentClick}>
                        {isDownloadInProgress && (
                            <span className="spinner-border spinner-border-sm " role="status" aria-hidden="true"></span>
                        )}
                        Download
                    </button>
                </td>
            </thead>
            <tbody>
                <tr className="height5percent"></tr>
                {numberOfPages &&
                    numberOfPages > 0 &&
                    Array(numberOfPages)
                        .fill(0)
                        .map((_, idx) => 1 + idx)
                        .map((i) => {
                            let width: number;
                            let height: number;
                            const pageWidth = props.location.state.pages[i - 1].width;
                            const pageHeight = props.location.state.pages[i - 1].height;
                            if (pageWidth > window.innerWidth) {
                                const shrinkRatio = pageWidth / maxWidth;
                                width = window.innerWidth;
                                height = pageHeight / shrinkRatio;
                            } else {
                                width = pageWidth;
                                height = pageHeight;
                            }
                            return (
                                <tr key={i}>
                                    <PageDrawStage
                                        rectangles={rectangles}
                                        setRectangles={updateRectangles}
                                        fileId={fileId}
                                        pageNumber={i}
                                        width={width}
                                        height={height}
                                    ></PageDrawStage>
                                </tr>
                            );
                        })}
            </tbody>
        </table>
    );
};

export default Editor;
