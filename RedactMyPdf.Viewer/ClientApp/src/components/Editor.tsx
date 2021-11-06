import React, { ReactElement, useRef, ReactText } from 'react';
import PageDrawStage from './PageDrawStage';
import FreeDrawStage from './FreeDrawStage';
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
import Modal from '@material-ui/core/Modal';
import SignaturePosition from '../interfaces/SignaturePosition';
import SignatureDto from '../dtos/SignatureDto';
import ReactTouchEvents from 'react-touch-events';
import { Redirect } from 'react-router-dom';
import ReactGa from 'react-ga';
import DrawLine from '../interfaces/DrawLine';
import { Element, animateScroll as scroll } from 'react-scroll';

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
    const [signaturesPositions, setSignaturesPositions] = React.useState<PageSignature[]>([]);

    const [downloadPath, setDownloadPath] = React.useState('');
    const [isDownloadInProgress, setIsDownloadInProgress] = React.useState(false);
    const [addSignaturePressed, setAddSignaturePressed] = React.useState(false);
    const [imageBase64, setImageBase64] = React.useState<string>('');
    const [signatureHeight, setSignatureHight] = React.useState<number>();
    const [signatureWidth, setSignatureWidth] = React.useState<number>();
    const [easySignWizardOpen, setEasySignWizardOpen] = React.useState(true);

    const toastId = React.useRef<ReactText | string>();
    const shapeSelected = React.useRef<boolean>(false);

    const addSignatureClick = () => {
        setAddSignaturePressed(true);
        // showAddSignatureToast();
    };

    const showAddSignatureToast = () => {
        // let addText = 'Click to add the signature! <br>You can scroll before clicking';
        let addText = (
            <div>
                <Typography variant="h6"> Click where you want to add the signature!</Typography>
            </div>
        );
        if (DeviceType.IsTouchDevice()) {
            // addText = 'Tap to add the signature! <br>You can scroll before tapping';
            addText = (
                <div>
                    <Typography variant="h6" align="center">
                        {' '}
                        Tap where you want to add the signature!
                    </Typography>
                </div>
            );
        }
        if (!toastId.current) {
            toastId.current = toast.info(addText, {
                position: 'bottom-center',
                // autoClose: 50000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                autoClose: false,
                style: { backgroundColor: '#ff7961' },
                bodyStyle: { margin: '0 auto' },
            });
        } else {
            toast.update(toastId.current, {
                position: 'bottom-center',
                // autoClose: 50000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                style: { backgroundColor: '#ff7961' },
                bodyStyle: { margin: '0 auto' },
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
            setSignaturesPositions([]);
        }
    };

    const saveDocumentClick = () => {
        ReactGa.event({
            category: 'Button',
            action: 'Click on download button',
        });
        setIsDownloadInProgress(true);

        const shapes = signaturesPositions.map((s) => {
            if (!s.signature.width || !s.signature.height || !s.signature.x || !s.signature.y) {
                return;
            }
            const [pageWidth, pageHeight] = ScreenSize.ComputePageSizeRelativeToScreen(
                props.location.state.pages[s.pageNumber - 1].width,
                props.location.state.pages[s.pageNumber - 1].height,
            );

            const signature: SignatureDto = {
                width: s.signature.width,
                height: s.signature.height,
                text: 'swef',
                x: s.signature.x,
                y: s.signature.y,
                fontSize: 20,
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

    const updateSignatures = (signs: SignaturePosition[], pageNumber: number) => {
        setSignaturesPositions((existingSignatures) => {
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
                signature: CreateSignature(x, y),
            };
            toast.dismiss(toastId.current);
            toastId.current = undefined;

            const existingSignature: PageSignature[] = [...signaturesPositions];
            existingSignature.push(signature);
            setSignaturesPositions(existingSignature);
            setSelectedShapeId(signature.signature.id);
            setAddSignaturePressed(false);
        } else {
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
                signature: CreateSignature(x, y),
            };

            const existingSignature: PageSignature[] = [...signaturesPositions];
            existingSignature.push(signature);
            toast.dismiss(toastId.current);
            toastId.current = undefined;
            setSignaturesPositions(existingSignature);
            setSelectedShapeId(signature.signature.id);
            setAddSignaturePressed(false);
        } else {
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

    function CreateSignature(x: number | undefined, y: number | undefined): SignaturePosition {
        const fontSize: number = (ScreenSize.GetScreenHeight() + ScreenSize.GetScreenWidth()) / 50;

        const height = fontSize * 1.3;
        if (!signatureWidth || !signatureHeight) {
            console.log('esti prost! nu trebuia ajuns aici');
            return {
                x: x,
                y: y,
                id: Math.floor(Math.random() * 1000).toString(),
                height: 1,
                width: 1,
            };
        }
        const width = height * (signatureWidth / signatureHeight);
        console.log('w ', width, 'h ', height);
        return {
            x: x,
            y: y,
            id: Math.floor(Math.random() * 1000).toString(),
            height: height,
            width: width,
        };
    }

    const ConfirmSignatureAndAddToPage = () => {
        scroll.scrollToBottom();
        setEasySignWizardOpen(false);
        setAddSignaturePressed(true);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const CreateSignatureClick = () => {
        setActiveStep(0);
        setEasySignWizardOpen(true);
    };

    const handleClose = () => {
        setEasySignWizardOpen(false);
    };
    const child1 = useRef(null);

    const showDownloadAndRevertButtons = signaturesPositions.length > 0;

    return (
        <>
            {addSignaturePressed && showAddSignatureToast()}
            <Backdrop className={classes.backdrop} open={isDownloadInProgress}>
                <CircularProgress color="inherit" />
            </Backdrop>
            {!addSignaturePressed && !easySignWizardOpen && (
                <ButtonGroup
                    orientation="vertical"
                    color="primary"
                    aria-label="vertical contained primary button group"
                    variant="contained"
                    className={classes.fixedBottomRight}
                >
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
            )}
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
                            <div className={classes.root} id="id1">
                                <Stepper activeStep={activeStep} orientation="vertical">
                                    <Step key="1">
                                        <StepLabel>Please draw your signature in the box bellow</StepLabel>
                                        <StepContent>
                                            <FreeDrawStage
                                                setImage={(image) => {
                                                    setImageBase64(image);
                                                }}
                                                setStageHeight={(height) => {
                                                    setSignatureHight(height);
                                                }}
                                                setStageWidth={(width) => {
                                                    setSignatureWidth(width);
                                                }}
                                            ></FreeDrawStage>
                                            <div className={classes.actionsContainer}>
                                                <div>
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => {
                                                            ConfirmSignatureAndAddToPage();
                                                        }}
                                                        className={classes.button}
                                                    >
                                                        Add signature on page
                                                    </Button>
                                                </div>
                                            </div>
                                        </StepContent>
                                    </Step>
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

                                    const singaturesForThisPage = signaturesPositions
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
                                                    {console.log('sen ', singaturesForThisPage)}
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
                                                        imageBase64={imageBase64}
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
