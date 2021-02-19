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

let x = 0;
let y = 0;

const Editor = (props: IProps): ReactElement => {
    const initialRectangles: Rectangle[] = [];

    function generateRectangle(): Rectangle {
        if (x > window.innerWidth - 50) {
            x = 1;
        }
        if (y > window.innerHeight - 50) {
            y = 1;
        }

        x += 15;
        y += 15;

        return {
            id: Math.random(),
            x: x,
            y: y,
            width: 100,
            height: 100,
            fill: 'red',
        };
    }

    const [selectedShapeId, setSelectedShapeId] = React.useState<number | null>(null);
    const [rectangles, setRectangles] = React.useState<Rectangle[]>(initialRectangles);
    const [downloadPath, setDownloadPath] = React.useState('');
    const [isDownloadInProgress, setIsDownloadInProgress] = React.useState(false);
    const [addRectanglePressed, setAddRectanglePressed] = React.useState(false);
    console.log(downloadPath);

    const addRectanglesClick = () => {
        setAddRectanglePressed(true);
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

    const clickOnPageEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (addRectanglePressed) {
            const rectangle = generateRectangle();
            const updatedRectangles: Rectangle[] = [...rectangles];
            updatedRectangles.push(rectangle);
            setRectangles(updatedRectangles);
            setSelectedShapeId(rectangle.id);
            setAddRectanglePressed(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f0f0f0' }}>
            <nav className="navbar navbar-expand-lg sticky-top navbar-light bg-light">
                <div className="p-2">
                    <button className="btn btn-primary" type="button" onClick={addRectanglesClick}>
                        Add rectangle
                    </button>
                </div>
                <div className="p-2 ">
                    {downloadPath && (
                        <FileDownload downloadPath={downloadPath} onDownloadComplete={handleDownloadComplete} />
                    )}
                    <button className="btn btn-success" onClick={saveDocumentClick}>
                        {isDownloadInProgress && (
                            <span className="spinner-border spinner-border-sm " role="status" aria-hidden="true"></span>
                        )}
                        Download
                    </button>
                </div>
                <form className="form-inline ml-auto p-2">
                    <input
                        className="form-control mr-sm-2"
                        type="search"
                        placeholder="Search"
                        aria-label="Search"
                    ></input>
                    <button className="btn btn-outline-success my-2 my-sm-0" type="submit">
                        Search
                    </button>
                </form>
            </nav>
            <table className="center">
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
                                    <React.Fragment key={i}>
                                        <tr className="height5percent">{i}</tr>
                                        <tr>
                                            <PageDrawStage
                                                rectangles={rectangles}
                                                setRectangles={updateRectangles}
                                                fileId={fileId}
                                                pageNumber={i}
                                                width={width}
                                                height={height}
                                                selectedShapeId={selectedShapeId}
                                                setSelectedShapeId={setSelectedShapeId}
                                                clickOnPageEvent={clickOnPageEvent}
                                            ></PageDrawStage>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                </tbody>
            </table>
        </div>
    );
};

export default Editor;
