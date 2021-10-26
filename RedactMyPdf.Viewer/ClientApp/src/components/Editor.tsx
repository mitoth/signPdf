import React, { ReactElement, useRef, ReactText } from 'react';
import PageDrawStage from './PageDrawStage';
import UploadService from '../services/FileUploadService';
import PageSignature from '../interfaces/PageSignature';
import Page from '../interfaces/Page';
import FileDownload from './FileDownload';
import Button from '@material-ui/core/Button';
import { Location } from 'history';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makeStyles } from '@material-ui/core/styles';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CreateIcon from '@material-ui/icons/Create';
import AddIcon from '@material-ui/icons/Add';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import UndoIcon from '@material-ui/icons/Undo';
import IconButton from '@material-ui/core/IconButton';
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
import Signature from '../interfaces/Signature';
import SignatureDto from '../dtos/SignatureDto';
import ReactTouchEvents from 'react-touch-events';
import { Redirect } from 'react-router-dom';

interface PageState {
    pages: Page[];
    fileId: string;
    numberOfPages: number;
}

interface IProps {
    location: Location<PageState>;
}

const Editor = (props: IProps): ReactElement => {
    const [selectedShapeId, setSelectedShapeId] = React.useState<string | undefined>(undefined);
    const [signatures, setSignatures] = React.useState<PageSignature[]>([]);

    const [downloadPath, setDownloadPath] = React.useState('');
    const [isDownloadInProgress, setIsDownloadInProgress] = React.useState(false);
    const [addSignaturePressed, setAddSignaturePressed] = React.useState(false);

    const [signatureWizardNameInput, setSignatureWizardNameInput] = React.useState<string>('');

    const [signatureName, setSignatureName] = React.useState<string>('');
    const toastId = React.useRef<ReactText | string>();
    const shapeSelected = React.useRef<boolean>(false);

    const addSignatureClick = () => {
        setAddSignaturePressed(true);
        let addText = 'Click where you want to add the signature!';
        if (DeviceType.IsTouchDevice()) {
            addText = 'Tap to add the signature!';
        }
        if (!toastId.current) {
            toastId.current = toast.info(addText, {
                position: toast.POSITION.TOP_CENTER,
                autoClose: false,
            });
        } else {
            toast.update(toastId.current, {
                type: toast.TYPE.SUCCESS,
            });
        }
    };

    if (!props.location.state) {
        return (
            <Redirect
                push
                to={{
                    pathname: '/',
                }}
            />
        );
    }

    const fileId: string = props.location.state.fileId;
    const numberOfPages: number = props.location.state.numberOfPages;

    const cancelChangesClick = () => {
        if (window.confirm('Are you sure you wish to revert all redactions?')) {
            setSignatures([]);
            setSignatureName('');
        }
    };

    const saveDocumentClick = () => {
        setIsDownloadInProgress(true);

        const shapes = signatures.map((s) => {
            if (
                !s.signature.width ||
                !s.signature.height ||
                !s.signature.x ||
                !s.signature.y ||
                !s.signature.text ||
                !s.signature.fontSize
            ) {
                return;
            }
            const [pageWidth, pageHeight] = ScreenSize.ComputePageSizeRelativeToScreen(
                props.location.state.pages[s.pageNumber - 1].width,
                props.location.state.pages[s.pageNumber - 1].height,
            );

            const signature: SignatureDto = {
                width: s.signature.width,
                height: s.signature.height,
                text: s.signature.text,
                x: s.signature.x,
                y: s.signature.y,
                fontSize: s.signature.fontSize,
                pageWidth: pageWidth,
                pageHeight: pageHeight,
            };

            const shape = {
                PageNumber: s.pageNumber,
                Signatures: [signature],
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

    const updateSignatures = (signs: Signature[], pageNumber: number) => {
        setSignatures((existingSignatures) => {
            const allSignaturesExceptPage = existingSignatures.filter((r) => r.pageNumber != pageNumber);
            const newSignatures = signs.map((s) => {
                const x: PageSignature = {
                    pageNumber: pageNumber,
                    signature: s,
                };

                return x;
            });

            allSignaturesExceptPage.push(...newSignatures);
            return allSignaturesExceptPage;
        });
    };

    const clickOnPageEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, pageNumber: number) => {
        if (addSignaturePressed) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left; //x position within the element.
            const y = e.clientY - rect.top; //y position within the element.
            const signature = {
                pageNumber: pageNumber,
                signature: CreateSignature(x, y, signatureName),
            };
            toast.dismiss(toastId.current);
            toastId.current = undefined;

            const existingSignature: PageSignature[] = [...signatures];
            existingSignature.push(signature);
            setSignatures(existingSignature);
            setSelectedShapeId(signature.signature.id);
            setAddSignaturePressed(false);
        } else {
            console.log('click1');
            if (!shapeSelected.current) {
                setSelectedShapeId(undefined);
            }
            shapeSelected.current = false;
        }
    };

    const touchStartEvent = (e: React.TouchEvent<HTMLDivElement>, pageNumber: number) => {
        if (addSignaturePressed) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = e.changedTouches[0].clientX - rect.left; //x position within the element.
            const y = e.changedTouches[0].clientY - rect.top; //y position within the element.
            const signature = {
                pageNumber: pageNumber,
                signature: CreateSignature(x, y, signatureName),
            };

            const existingSignature: PageSignature[] = [...signatures];
            existingSignature.push(signature);
            toast.dismiss(toastId.current);
            toastId.current = undefined;
            setSignatures(existingSignature);
            setSelectedShapeId(signature.signature.id);
            setAddSignaturePressed(false);
        } else {
            console.log('click1');
            if (!shapeSelected.current) {
                setSelectedShapeId(undefined);
            }
            shapeSelected.current = false;
        }
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

    let buttonSize: 'small' | 'medium' | 'large';
    let fontSize: 'inherit' | 'default' | 'small' | 'large';
    if (DeviceType.IsTablet() || DeviceType.IsPhone()) {
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

    function CreateSignature(x: number | undefined, y: number | undefined, text: string | undefined): Signature {
        const fontSize: number = (ScreenSize.GetScreenHeight() + ScreenSize.GetScreenWidth()) / 50;

        const height = fontSize * 1.3;

        return {
            x: x,
            y: y,
            text: text,
            id: Math.floor(Math.random() * 1000).toString(),
            fontSize: fontSize,
            textEditVisible: false,
            fill: 'black',
            fontFamily: 'Great Vibes',
            height: height,
            align: 'center',
            verticalAlign: 'middle',
        };
    }

    const handleNext = (isLast: boolean) => {
        if (!isLast) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
            setEasySignWizardOpen(false);
            const [pageWidth, pageHeight] = ScreenSize.ComputePageSizeRelativeToScreen(
                props.location.state.pages[0].width,
                props.location.state.pages[0].height,
            );

            const newSignatures: PageSignature[] = [];
            const numberOfPages = props.location.state.pages.length;
            if (signaturePosition === SetSignatureOnLastPageString) {
                newSignatures.push({
                    pageNumber: numberOfPages,
                    signature: CreateSignature(pageWidth / 15, pageHeight - pageHeight / 12, signatureWizardNameInput),
                });
                toast.info(
                    'Signature added on the last page! Now you can add it on other places using the "+ Sign" button',
                    {
                        toastId: 2,
                        position: toast.POSITION.BOTTOM_CENTER,
                        autoClose: 8000,
                    },
                );
            }
            if (signaturePosition === SetSignatureOnEachPageString) {
                for (let i = 1; i <= numberOfPages; i++) {
                    newSignatures.push({
                        pageNumber: i,
                        signature: CreateSignature(
                            pageWidth / 15,
                            pageHeight - pageHeight / 12,
                            signatureWizardNameInput,
                        ),
                    });
                }
                toast.info(
                    'A signature was added on each page! Now you can add it on other places using the "+ Sign" button',
                    {
                        toastId: 2,
                        position: toast.POSITION.BOTTOM_CENTER,
                    },
                );
            }

            setSignatureName(signatureWizardNameInput);

            if (signaturePosition === SetSignaturePositionLaterString) {
                addSignatureClick();
            } else {
                setSignatures(newSignatures);
                setSelectedShapeId(newSignatures[newSignatures.length - 1].signature.id);
                scroll.scrollToBottom();
            }
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const [signaturePosition, setSignaturePosition] = React.useState(SetSignaturePositionLaterString);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (event: any) => {
        setSignaturePosition(event.target.value);
    };

    function getStepContent(step: number) {
        switch (step) {
            case 0:
                return (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleNext(false);
                        }}
                    >
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
                            onChange={(event) => setSignatureWizardNameInput(event.target.value)}
                            value={signatureWizardNameInput}
                            error={signatureWizardNameInput.length > 0 ? false : true}
                            autoFocus={true}
                            required={true}
                        />
                    </form>
                );
            case 1:
                return (
                    <FormControl
                        component="fieldset"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onKeyPress={() => console.log('presat')}
                    >
                        <FormLabel component="legend">You can still remove or add signatures later</FormLabel>
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
                                label="I'll place it myself"
                            />
                        </RadioGroup>
                    </FormControl>
                );
            default:
                return 'Unknown step';
        }
    }

    const CreateSignatureClick = () => {
        setActiveStep(0);
        setEasySignWizardOpen(true);
    };

    const [easySignWizardOpen, setEasySignWizardOpen] = React.useState(false);

    const handleClose = () => {
        setEasySignWizardOpen(false);
    };
    const child1 = useRef(null);

    const showDownloadAndRevertButtons = signatures.length > 0;

    const showErrorInStepper = activeStep != 0 || signatureWizardNameInput.length > 0 ? false : true;

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
                {signatureName.length == 0 && (
                    <Button
                        onClick={CreateSignatureClick}
                        variant="contained"
                        color="primary"
                        size={buttonSize}
                        className={showDownloadAndRevertButtons ? classes.marginBottom : ''}
                        startIcon={<CreateIcon />}
                    >
                        Create Signature
                    </Button>
                )}
                {signatureName.length > 0 && (
                    <Button
                        onClick={addSignatureClick}
                        variant="contained"
                        color="primary"
                        size={buttonSize}
                        className={showDownloadAndRevertButtons ? classes.marginBottom : ''}
                        startIcon={<AddIcon />}
                    >
                        Sign
                    </Button>
                )}
                {showDownloadAndRevertButtons && (
                    <Button
                        onClick={saveDocumentClick}
                        variant="contained"
                        color="primary"
                        size={buttonSize}
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
                    {downloadPath && (
                        <FileDownload downloadPath={downloadPath} onDownloadComplete={handleDownloadComplete} />
                    )}
                </ButtonGroup>
            )}

            <div
                style={{
                    backgroundColor: '#f4f6f5',
                    cursor: addSignaturePressed ? 'crosshair' : '',
                }}
            >
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
                                                            type="submit"
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

                                    const singaturesForThisPage = signatures
                                        .filter((s) => s.pageNumber == i)
                                        .map((s) => s.signature);
                                    return (
                                        <React.Fragment key={i}>
                                            <tr className="height5percent">{i}</tr>
                                            <ReactTouchEvents
                                                onTap={(
                                                    e:
                                                        | React.MouseEvent<HTMLDivElement, MouseEvent>
                                                        | React.TouchEvent<HTMLDivElement>,
                                                ) => {
                                                    console.log('asd ', e);
                                                    if (e.type == 'touchend') {
                                                        touchStartEvent(e as React.TouchEvent<HTMLDivElement>, i);
                                                    } else {
                                                        clickOnPageEvent(
                                                            e as React.MouseEvent<HTMLDivElement, MouseEvent>,
                                                            i,
                                                        );
                                                    }
                                                }}
                                            >
                                                <tr>
                                                    <PageDrawStage
                                                        signatures={singaturesForThisPage}
                                                        setSignatures={(signs) => {
                                                            updateSignatures(signs, i);
                                                        }}
                                                        fileId={fileId}
                                                        pageNumber={i}
                                                        width={width}
                                                        height={height}
                                                        selectedShapeId={selectedShapeId}
                                                        setSelectedShapeId={(id) => {
                                                            shapeSelected.current = true;
                                                            setSelectedShapeId(id);
                                                        }}
                                                    ></PageDrawStage>
                                                    <Element name={scrollAnchorId} className="element"></Element>
                                                </tr>
                                            </ReactTouchEvents>
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
