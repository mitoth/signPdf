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
        console.log(rectangles);
        const rectangleShapes = rectangles.map((r) => {
            return {
                width: r.width,
                height: r.height,
                borderHtmlColorCode: '#FF5733',
                borderLineWidth: 2,
                fillHtmlColorCode: '#FF5733',
                axis: { x: r.x, y: r.y },
            };
        });

        const shapes = [
            {
                PageNumber: 1,
                Shapes: rectangleShapes,
                // {
                //   width: 100,
                //   height: 100,
                //   borderHtmlColorCode: "#FF5733",
                //   borderLineWidth: 2,
                //   fillHtmlColorCode: "#FF5733",
                //   axis: { x: 100, y: 100 },
                // },
            },
        ];

        const connection = new HubConnectionBuilder()
            .withUrl('http://localhost:59048/hubs/files')
            .withAutomaticReconnect()
            .build();
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
                        setDownloadPath(`http://localhost:59048/api/v1/Document/${fileId}/burn`);
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

    return (
        <>
            {downloadPath && <FileDownload downloadPath={downloadPath} onDownloadComplete={handleDownloadComplete} />}
            <button onClick={addRectanglesClick}>Add rectangle</button>
            <button onClick={saveDocumentClick}>Download</button>
            {numberOfPages &&
                numberOfPages > 0 &&
                Array(numberOfPages)
                    .fill(0)
                    .map((_, idx) => 1 + idx)
                    .map((i) => {
                        return (
                            <PageDrawStage
                                key={i}
                                rectangles={rectangles}
                                setRectangles={updateRectangles}
                                fileId={fileId}
                                pageNumber={i}
                                width={props.location.state.pages[i - 1].width}
                                height={props.location.state.pages[i - 1].height}
                            ></PageDrawStage>
                        );
                    })}
        </>
    );
};

export default Editor;
