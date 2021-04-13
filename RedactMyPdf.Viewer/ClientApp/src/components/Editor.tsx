import React, { ReactElement } from 'react';
import PageDrawStage from './PageDrawStage';
import UploadService from '../services/FileUploadService';
import Rectangle from '../interfaces/Rectangle';
import Page from '../interfaces/Page';
import FileDownload from './FileDownload';
import Button from '@material-ui/core/Button';
import { Location } from 'history';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CreateIcon from '@material-ui/icons/Create';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import UndoIcon from '@material-ui/icons/Undo';
import IconButton from '@material-ui/core/IconButton';
import green from '@material-ui/core/colors/green';
import Tooltip from '@material-ui/core/Tooltip';
import DeviceType from '../services/DeviceType';
import ScreenSize from '../services/ScreenSize';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

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
        if (x > ScreenSize.GetScreenWidth() - 50) {
            x = 1;
        }
        if (y > ScreenSize.GetScreenWidth() - 50) {
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
        toast.info('Click on the page where you want to add the rectangle!');
    };

    const fileId: string = window.location.pathname.split('/')[2];
    const numberOfPages: number = parseInt(window.location.pathname.split('/')[3]);

    const cancelChangesClick = () => {
        if (window.confirm('Are you sure you wish to revert all redactions?')) setRectangles([]);
    };

    const saveDocumentClick = () => {
        setIsDownloadInProgress(true);
        const rectangleShapes = rectangles.map((r) => {
            let width: number;
            let height: number;
            let x: number;
            let y: number;
            //TODO = use real index instead of 0
            const pageWidth = props.location.state.pages[0].width;
            if (pageWidth > ScreenSize.GetScreenWidth()) {
                const shrinkRatio = pageWidth / ScreenSize.GetScreenWidth();
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
                    connection.invoke('getConnectionId').then((connectionId: string) => {
                        UploadService.save(fileId, shapes, connectionId);
                    });

                    connection.on('FileBurned', (docJson) => {
                        const fileId = JSON.parse(docJson);
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

    const useStyles = makeStyles((theme) => ({
        fixedBottomRight: {
            margin: theme.spacing(1),
            zIndex: 1,
            position: 'fixed',
            bottom: '1vh',
            right: '1px',
        },
        fixedTopRight: {
            margin: theme.spacing(1),
            zIndex: 1,
            position: 'fixed',
            top: '1vh',
            right: '1px',
        },
        marginBottom: {
            marginBottom: theme.spacing(2),
            opacity: '1',
        },
        downloadButton: {
            margin: theme.spacing(2),
            backgroundColor: '#00a152',
        },
        extendedIcon: {
            marginRight: theme.spacing(1),
        },
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
        },
    }));

    const classes = useStyles();

    const DownloadButton = withStyles(() => ({
        root: {
            color: green[500],
            '&:hover': {
                backgroundColor: green[50],
            },
        },
    }))(IconButton);
    let buttonSize: 'small' | 'medium' | 'large';
    let fontSize: 'inherit' | 'default' | 'small' | 'large';
    if (DeviceType.IsPhone()) {
        buttonSize = 'small';
        fontSize = 'small';
    } else if (DeviceType.IsTablet()) {
        buttonSize = 'medium';
        fontSize = 'default';
    } else {
        buttonSize = 'large';
        fontSize = 'large';
    }

    return (
        <>
            <Backdrop className={classes.backdrop} open={isDownloadInProgress}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <ButtonGroup
                orientation="vertical"
                color="primary"
                aria-label="vertical contained primary button group"
                variant="contained"
                className={classes.fixedBottomRight}
            >
                <Button
                    onClick={addRectanglesClick}
                    variant="contained"
                    color="primary"
                    size={buttonSize}
                    className={classes.marginBottom}
                    startIcon={<CheckBoxOutlineBlankIcon />}
                >
                    Erase
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    size={buttonSize}
                    // className={classes.margin}
                    startIcon={<CreateIcon />}
                >
                    Sign
                </Button>
            </ButtonGroup>
            <ButtonGroup
                color="primary"
                aria-label="contained primary button group"
                variant="contained"
                className={classes.fixedTopRight}
            >
                <Tooltip title={<span style={{ fontSize: '1.5vh' }}>Revert all changes</span>}>
                    <IconButton aria-label="Undo all" color="secondary" onClick={cancelChangesClick}>
                        <UndoIcon fontSize={fontSize} />
                    </IconButton>
                </Tooltip>
                <Tooltip title={<span style={{ fontSize: '1.5vh' }}>Download File</span>}>
                    <DownloadButton aria-label="download" onClick={saveDocumentClick}>
                        <CloudDownloadIcon fontSize={fontSize} />
                    </DownloadButton>
                </Tooltip>
                {downloadPath && (
                    <FileDownload downloadPath={downloadPath} onDownloadComplete={handleDownloadComplete} />
                )}
            </ButtonGroup>
            <div style={{ backgroundColor: '#f4f6f5', cursor: addRectanglePressed ? 'crosshair' : '' }}>
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
                                    if (pageWidth > ScreenSize.GetScreenWidth()) {
                                        const shrinkRatio = pageWidth / ScreenSize.GetScreenWidth();
                                        width = ScreenSize.GetScreenWidth();
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
                <div className="someSpace"></div>
            </div>
        </>
    );
};

export default Editor;
