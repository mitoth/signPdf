import React, { ReactElement, useRef } from 'react';
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
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import Popper from '@material-ui/core/Popper';

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
    const [noOfTimeInfoEraseShown, setNoOfTimeInfoEraseShown] = React.useState(0);

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
        if (noOfTimeInfoEraseShown < 2) {
            toast.info('Click on the page where you want to add the rectangle!');
        }
        setNoOfTimeInfoEraseShown(noOfTimeInfoEraseShown + 1);
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
        root: {
            width: '100%',
        },
        button: {
            marginTop: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        actionsContainer: {
            marginBottom: theme.spacing(2),
        },
        resetContainer: {
            padding: theme.spacing(3),
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

    function getSteps() {
        return ['Select campaign settings', 'Create an ad group', 'Create an ad'];
    }

    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    function getStepContent(step: number) {
        switch (step) {
            case 0:
                return `For each ad campaign that you create, you can control how much
                    you're willing to spend on clicks and conversions, which networks
                    and geographical locations you want your ads to show on, and more.`;
            case 1:
                return 'An ad group contains one or more ads which target a shared set of keywords.';
            case 2:
                return `Try out different ad text to see what brings in the most customers,
                    and learn how to enhance your ads using features like ad extensions.
                    If you run into any problems with your ads, find out how to tell if
                    they're running and how to resolve approval issues.`;
            default:
                return 'Unknown step';
        }
    }

    const [anchorEl, setAnchorEl] = React.useState<(EventTarget & HTMLElement) | null>();
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        // setAnchorEl(event.currentTarget);
        setAnchorEl(child1.current);
        console.log(child1);
    };

    const handleClose = () => {
        setAnchorEl(undefined);
    };
    const child1 = useRef(null);

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
                    onClick={handleClick}
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
                    <Popper
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        // onClose={handleClose}
                        // anchorOrigin={{
                        //     vertical: 'bottom',
                        //     horizontal: 'center',
                        // }}
                        // transformOrigin={{
                        //     vertical: 'top',
                        //     horizontal: 'center',
                        // }}
                    >
                        <div className={classes.root}>
                            <Stepper activeStep={activeStep} orientation="vertical">
                                {steps.map((label, index) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                        <StepContent>
                                            <Typography>{getStepContent(index)}</Typography>
                                            <div className={classes.actionsContainer}>
                                                <div>
                                                    <Button
                                                        disabled={activeStep === 0}
                                                        onClick={handleBack}
                                                        className={classes.button}
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={handleNext}
                                                        className={classes.button}
                                                    >
                                                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                            {activeStep === steps.length && (
                                <Paper square elevation={0} className={classes.resetContainer}>
                                    <Typography>All steps completed - you&apos;re finished</Typography>
                                    <Button onClick={handleReset} className={classes.button}>
                                        Reset
                                    </Button>
                                </Paper>
                            )}
                        </div>
                    </Popper>
                    <tbody>
                        <tr className="height5percent" ref={child1}></tr>
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
                                            {/* <Paper elevation={5}> */}
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
                                            {/* </Paper> */}
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
