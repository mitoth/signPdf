import React, { ReactElement } from 'react';
import PageDrawStage from './PageDrawStage';
import UploadService from '../services/FileUploadService';
import Rectangle from '../interfaces/Rectangle';
import Page from '../interfaces/Page';
import FileDownload from './FileDownload';
import { Location } from 'history';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    const [selectedShapeId, setSelectedShapeId] = React.useState<number | null>(null);
    const [rectangles, setRectangles] = React.useState<Rectangle[]>(initialRectangles);
    const [downloadPath, setDownloadPath] = React.useState('');
    const [isDownloadInProgress, setIsDownloadInProgress] = React.useState(false);
    const [addRectanglePressed, setAddRectanglePressed] = React.useState(false);

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

    const addRectanglesClick = () => {
        setAddRectanglePressed(true);
        toast('Click on the page where you want to add the rectangle!');
    };

    const fileId: string = window.location.pathname.split('/')[2];
    const numberOfPages: number = parseInt(window.location.pathname.split('/')[3]);

    const cancelChangesClick = () => {
        if (window.confirm('Are you sure you wish to revert all redactions?')) setRectangles([]);
    };

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

    const clickOnPageEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (addRectanglePressed) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left; //x position within the element.
            const y = e.clientY - rect.top; //y position within the element.
            addRectangleOnPage(x, y);
        }
    };

    const touchStartEvent = (e: React.TouchEvent<HTMLDivElement>) => {
        if (addRectanglePressed) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left; //x position within the element.
            const y = e.touches[0].clientY - rect.top; //y position within the element.
            addRectangleOnPage(x, y);
        }
    };

    const addRectangleOnPage = (x: number, y: number) => {
        const rectangle = generateRectangle();
        rectangle.x = x;
        rectangle.y = y;
        const updatedRectangles: Rectangle[] = [...rectangles];
        updatedRectangles.push(rectangle);
        setRectangles(updatedRectangles);
        setSelectedShapeId(rectangle.id);
        setAddRectanglePressed(false);
    };

    return (
        <div style={{ backgroundColor: '#f4f6f5', cursor: addRectanglePressed ? 'crosshair' : '' }}>
            <div className="sticky-top flexbox-top-container">
                <div className="flexbox-container1 vw1-margin">
                    <div>
                        <button className="ui icon left labeled button green" onClick={addRectanglesClick}>
                            <i aria-hidden="true" className="edit icon"></i>Add Rectangle
                        </button>
                    </div>
                </div>
                {/* <div className="flexbox-container1">
                    {addRectanglePressed && (
                        <div className="ui green raised segment large">
                            <i aria-hidden="true" className="info icon"></i>
                            Click on the page where you want to add the rectangle.
                        </div>
                    )}
                </div> */}
                <div className="flexbox-container3">
                    <div className="vw1-margin">
                        <div className="ui buttons">
                            {downloadPath && (
                                <FileDownload downloadPath={downloadPath} onDownloadComplete={handleDownloadComplete} />
                            )}
                            <button className="ui button" onClick={cancelChangesClick}>
                                Cancel
                            </button>
                            <div className="or"></div>
                            {isDownloadInProgress && <button className="ui loading button green">Loading</button>}
                            {!isDownloadInProgress && (
                                <button className="ui positive button" onClick={saveDocumentClick}>
                                    Download
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="ui icon input vw1-margin-right">
                        <input type="text" placeholder="Search..." />
                        <i aria-hidden="true" className="search circular inverted link icon"></i>
                    </div>
                </div>
            </div>

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
                                    const shrinkRatio = pageWidth / window.innerWidth;
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
                                                touchStartEvent={touchStartEvent}
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
