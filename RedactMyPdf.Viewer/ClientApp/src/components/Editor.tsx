import React, { ReactElement, useRef } from 'react';
import PageDrawStage from './PageDrawStage';
import UploadService from '../services/FileUploadService';
import Rectangle from '../interfaces/Rectangle';
import PageRectangle from '../interfaces/PageRectangle';
import PageSignature from '../interfaces/PageSignature';
import Signature from '../interfaces/Signature';
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
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Modal from '@material-ui/core/Modal';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { Element, animateScroll as scroll } from 'react-scroll';

interface PageState {
    pages: Page[];
}

interface IProps {
    location: Location<PageState>;
}

const Editor = (props: IProps): ReactElement => {
    const initialRectangles: PageRectangle[] = [];
    const initialSignatures: PageSignature[] = [];

    const [selectedShapeId, setSelectedShapeId] = React.useState<string | null>(null);
    const [signatures, setSignatures] = React.useState<PageSignature[]>(initialSignatures);
    const [rectangles, setRectangles] = React.useState<PageRectangle[]>(initialRectangles);

    const [downloadPath, setDownloadPath] = React.useState('');
    const [isDownloadInProgress, setIsDownloadInProgress] = React.useState(false);
    const [addRectanglePressed, setAddRectanglePressed] = React.useState(false);
    const [noOfTimeInfoEraseShown, setNoOfTimeInfoEraseShown] = React.useState(0);

    const [signatureName, setSignatureName] = React.useState<string>('');

    function generateRectangle(): Rectangle {
        let x = 0;
        let y = 0;

        if (x > ScreenSize.GetScreenWidth() - 50) {
            x = 1;
        }
        if (y > ScreenSize.GetScreenWidth() - 50) {
            y = 1;
        }

        x += 15;
        y += 15;

        return {
            id: Math.random().toString(),
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
            toast.info('Click on the page where you want to add the rectangle!', {
                toastId: 1,
            });
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

        const shapes = rectangles.map((r) => {
            let width: number;
            let height: number;
            let x: number;
            let y: number;
            const pageWidth = props.location.state.pages[r.pageNumber - 1].width;
            const pageHeight = props.location.state.pages[r.pageNumber - 1].height;
            if (pageWidth > ScreenSize.GetScreenWidth()) {
                const widthShrinkRatio = pageWidth / ScreenSize.GetScreenWidth();
                const heightShrinkRatio = pageHeight / ScreenSize.GetScreenHeight();
                width = r.rectangle.width * widthShrinkRatio;
                height = r.rectangle.height * heightShrinkRatio;
                x = r.rectangle.x * widthShrinkRatio;
                y = r.rectangle.y * heightShrinkRatio;
            } else {
                width = r.rectangle.width;
                height = r.rectangle.height;
                x = r.rectangle.x;
                y = r.rectangle.y;
            }

            const rect = {
                width: width,
                height: height,
                borderHtmlColorCode: '#FF5733',
                borderLineWidth: 2,
                fillHtmlColorCode: '#FF5733',
                axis: { x: x, y: y },
            };

            const shape = {
                PageNumber: r.pageNumber,
                Shapes: [rect],
            };
            return shape;
        });

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

    const updateRectangles = (rects: Rectangle[], pageNumber: number) => {
        const allRectanglesExceptPage = rectangles.filter((r) => r.pageNumber != pageNumber);
        const newRectangles = rects.map((r) => {
            const x: PageRectangle = {
                pageNumber: pageNumber,
                rectangle: r,
            };

            return x;
        });
        allRectanglesExceptPage.push(...newRectangles);
        setRectangles(allRectanglesExceptPage);
    };

    const clickOnPageEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, pageNumber: number) => {
        if (addRectanglePressed) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left; //x position within the element.
            const y = e.clientY - rect.top; //y position within the element.
            addRectangleOnPage(x, y, pageNumber);
        }
    };

    const touchStartEvent = (e: React.TouchEvent<HTMLDivElement>, pageNumber: number) => {
        if (addRectanglePressed) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left; //x position within the element.
            const y = e.touches[0].clientY - rect.top; //y position within the element.
            addRectangleOnPage(x, y, pageNumber);
        }
    };

    const addRectangleOnPage = (x: number, y: number, pageNumber: number) => {
        const rectangle = generateRectangle();
        rectangle.x = x;
        rectangle.y = y;
        const pageRectanle: PageRectangle = {
            pageNumber: pageNumber,
            rectangle: rectangle,
        };
        const updatedRectangles: PageRectangle[] = [...rectangles];
        updatedRectangles.push(pageRectanle);
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
            backgroundColor: '#ff7961',
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
            // width: '95vw',
            // zIndex: 1,
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
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        return ['Easy Sign wizard. Type your name first', 'Choose on which pages to add the signature'];
    }

    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();

    const SetSignaturePositionLaterString = 'later';
    const SetSignatureOnLastPageString = 'last';
    const SetSignatureOnEachPageString = 'each';

    const handleNext = (isLast: boolean) => {
        // setActiveStep((prevActiveStep) => prevActiveStep + 1);
        if (!isLast) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
            setEasySignWizardOpen(false);
            const [pageWidth, pageHeight] = ScreenSize.ComputePageSizeRelativeToScreen(
                props.location.state.pages[0].width,
                props.location.state.pages[0].height,
            );

            const signatures: PageSignature[] = [];
            const numberOfPages = props.location.state.pages.length;
            if (signaturePosition === SetSignatureOnLastPageString) {
                signatures.push({
                    pageNumber: numberOfPages,
                    signature: {
                        x: pageWidth / 15, //aproximativ stanga jos
                        y: pageHeight - pageHeight / 12,
                        text: signatureName,
                        id: Math.random().toString(),
                    },
                });
                toast.info('Signature added on the last page!', {
                    toastId: 2,
                });
            }
            if (signaturePosition === SetSignatureOnEachPageString) {
                for (let i = 1; i <= numberOfPages; i++) {
                    signatures.push({
                        pageNumber: i,
                        signature: {
                            x: pageWidth / 15, //aproximativ stanga jos
                            y: pageHeight - pageHeight / 12,
                            text: signatureName,
                            id: Math.random().toString(),
                        },
                    });
                }
                toast.info('A signature was added on each page!', {
                    toastId: 2,
                });
            }
            if (signaturePosition === SetSignaturePositionLaterString) {
                toast.info('Signature created! You can place it on the document using the "Sign" button', {
                    toastId: 2,
                });
            }
            setSignatures(signatures);
            setSelectedShapeId(signatures[signatures.length - 1].signature.id);
            scroll.scrollToBottom();
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const [signaturePosition, setSignaturePosition] = React.useState(SetSignatureOnLastPageString);
    // const [signatureNameHasError, setSignatureNameHasError] = React.useState<bool>(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (event: any) => {
        setSignaturePosition(event.target.value);
    };

    function getStepContent(step: number) {
        switch (step) {
            case 0:
                return (
                    <>
                        <InputLabel
                            htmlFor="input-with-icon-adornment"
                            error={showErrorInStepper}
                            required={showErrorInStepper}
                        >
                            Type your name
                        </InputLabel>
                        <Input
                            id="input-with-icon-adornment"
                            startAdornment={
                                <InputAdornment position="start">
                                    <AccountCircle />
                                </InputAdornment>
                            }
                            onChange={(event) => setSignatureName(event.target.value)}
                            value={signatureName}
                            error={signatureName.length > 0 ? false : true}
                            autoFocus={true}
                            required={true}
                        />
                    </>
                );
            case 1:
                return (
                    <FormControl component="fieldset">
                        <FormLabel component="legend">
                            Pages to sign. (You can still remove or add signatures later)
                        </FormLabel>
                        <RadioGroup
                            aria-label="gender"
                            name="gender1"
                            value={signaturePosition}
                            onChange={handleChange}
                        >
                            <FormControlLabel
                                value={SetSignatureOnEachPageString}
                                control={<Radio />}
                                label="Each page"
                            />
                            <FormControlLabel
                                value={SetSignatureOnLastPageString}
                                control={<Radio />}
                                label="Last page"
                            />
                            <FormControlLabel
                                value={SetSignaturePositionLaterString}
                                control={<Radio />}
                                label="Skip... I'll place it myself"
                            />
                        </RadioGroup>
                    </FormControl>
                );
            default:
                return 'Unknown step';
        }
    }

    const signClick = () => {
        setActiveStep(0);
        setEasySignWizardOpen(true);
    };

    const [easySignWizardOpen, setEasySignWizardOpen] = React.useState(false);

    const handleClose = () => {
        setEasySignWizardOpen(false);
    };
    const child1 = useRef(null);

    const showDownloadAndRevertButtons = rectangles.length > 0 || signatures.length > 0;

    const showErrorInStepper = activeStep != 0 || signatureName.length > 0 ? false : true;

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
                    onClick={signClick}
                    variant="contained"
                    color="primary"
                    size={buttonSize}
                    className={showDownloadAndRevertButtons ? classes.marginBottom : ''}
                    startIcon={<CreateIcon />}
                >
                    Sign
                </Button>
                {showDownloadAndRevertButtons && (
                    <Button
                        onClick={saveDocumentClick}
                        variant="contained"
                        color="primary"
                        size={buttonSize}
                        // className={classes.margin}
                        startIcon={<CloudDownloadIcon />}
                    >
                        Download
                    </Button>
                )}
            </ButtonGroup>
            {showDownloadAndRevertButtons && (
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
                    {/* <Tooltip title={<span style={{ fontSize: '1.5vh' }}>Download File</span>}>
                    <DownloadButton aria-label="download" onClick={saveDocumentClick}>
                        <CloudDownloadIcon fontSize={fontSize} />
                    </DownloadButton>
                </Tooltip> */}
                    {downloadPath && (
                        <FileDownload downloadPath={downloadPath} onDownloadComplete={handleDownloadComplete} />
                    )}
                </ButtonGroup>
            )}

            <div style={{ backgroundColor: '#f4f6f5', cursor: addRectanglePressed ? 'crosshair' : '' }}>
                <table className="center">
                    <Modal
                        aria-labelledby="transition-modal-title"
                        aria-describedby="transition-modal-description"
                        className={classes.modal}
                        open={easySignWizardOpen}
                        onClose={handleClose}
                        closeAfterTransition
                        BackdropComponent={Backdrop}
                        BackdropProps={{
                            timeout: 500,
                        }}
                    >
                        <>
                            <div className={classes.root}>
                                <Stepper activeStep={activeStep} orientation="vertical">
                                    {steps.map((label, index) => (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                            <StepContent>
                                                {getStepContent(index)}
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
                                                            disabled={showErrorInStepper}
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => {
                                                                handleNext(activeStep === steps.length - 1);
                                                            }}
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
                        </>
                    </Modal>

                    <tbody>
                        <tr className="height5percentfixed" ref={child1}></tr>
                        {numberOfPages &&
                            numberOfPages > 0 &&
                            Array(numberOfPages)
                                .fill(0)
                                .map((_, idx) => 1 + idx)
                                .map((i) => {
                                    const [width, height] = ScreenSize.ComputePageSizeRelativeToScreen(
                                        props.location.state.pages[i - 1].width,
                                        props.location.state.pages[i - 1].height,
                                    );
                                    const scrollAnchorId = 'scrollId' + i;
                                    const rectanglesForThisPage = rectangles
                                        .filter((r) => r.pageNumber == i)
                                        .map((r) => r.rectangle);

                                    const singaturesForThisPage = signatures
                                        .filter((s) => s.pageNumber == i)
                                        .map((s) => s.signature);
                                    return (
                                        <React.Fragment key={i}>
                                            <tr className="height5percent">{i}</tr>
                                            {/* <Paper elevation={5}> */}
                                            <tr
                                                onClick={(e) => {
                                                    clickOnPageEvent(e, i);
                                                }}
                                                onTouchStart={(e) => {
                                                    touchStartEvent(e, i);
                                                }}
                                            >
                                                <PageDrawStage
                                                    rectangles={rectanglesForThisPage}
                                                    signatures={singaturesForThisPage}
                                                    setRectangles={(rects) => {
                                                        updateRectangles(rects, i);
                                                    }}
                                                    fileId={fileId}
                                                    pageNumber={i}
                                                    width={width}
                                                    height={height}
                                                    selectedShapeId={selectedShapeId}
                                                    setSelectedShapeId={setSelectedShapeId}
                                                ></PageDrawStage>
                                                <Element name={scrollAnchorId} className="element"></Element>
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
