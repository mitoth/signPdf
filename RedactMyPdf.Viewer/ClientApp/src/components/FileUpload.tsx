import React, { useState, useEffect, ReactElement } from 'react';
import UploadService from '../services/FileUploadService';
import { Redirect } from 'react-router-dom';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { DropzoneArea } from 'material-ui-dropzone';
import LinearProgress from '@material-ui/core/LinearProgress';
import DeviceType from '../services/DeviceType';
import Footer from './Footer';
import CookieConsent from 'react-cookie-consent';
import ReactGa from 'react-ga';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FreeDrawStage from './FreeDrawStage';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import ScreenSize from '../services/ScreenSize';

const UploadFiles = (): ReactElement => {
    const [currentFile, setCurrentFile] = useState<File>();
    const [fileId, setFileId] = useState<string>();
    const [numberOfPages, setNumberOfPages] = useState<number>();
    const [pages, setPages] = useState([]);
    const [connection, setConnection] = useState<HubConnection>();
    const [dropzoneText, setDropzoneText] = useState<string>('');
    const [dropzoneProps, setDropzoneProps] = useState<any>({ disabled: false });
    const [uploadSuccessful, setUploadSuccessful] = useState<boolean>(false);
    const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);
    const [openContactPage, setOpenContactPage] = useState<boolean>(false);
    const [imageBase64, setImageBase64] = React.useState<string>('');
    const [signatureHeight, setSignatureHight] = React.useState<number>();
    const [signatureWidth, setSignatureWidth] = React.useState<number>();
    const [signatureSet, setSignatureSet] = React.useState<boolean>(false);

    const tenMBinBytes = 10485760;
    const signYouPdfMessage = 'Electronically Sign Your PDF.';
    const addYourSignatureInTheBoxBellow = 'Please add your signature in the box bellow.';

    const uploadTimeoutExpiredDropzoneSet = () => {
        connection?.stop();
        ReactGa.event({
            category: 'PageError',
            action: 'CouldNotUploadFile',
        });
        setDropzoneText('Sorry. Could not upload the file!. Please try again later');
        setUploadInProgress(false);
    };

    const upload = (files: File[]) => {
        const currentFile = files[0];
        if (!currentFile) {
            console.log('no file');
            return;
        }

        setUploadSuccessful(false);
        setUploadInProgress(true);

        if (!currentFile) return;

        window.setTimeout(() => {
            if (!uploadSuccessful && signatureSet) {
                uploadTimeoutExpiredDropzoneSet();
            }
        }, 40000);

        setCurrentFile(currentFile);

        setDropzoneText("Processsing your file. We'll be quick");
        setDropzoneProps({ disabled: true });

        if (connection) {
            connection.stop();
        }

        ReactGa.event({
            category: 'Upload',
            action: 'UploadStarted',
        });

        const newConnection = new HubConnectionBuilder().withUrl('/hubs/files').withAutomaticReconnect().build();
        newConnection
            .start()
            .then(() => {
                newConnection.invoke('getConnectionId').then((connectionId) => {
                    UploadService.upload(currentFile, connectionId, () => {
                        console.log('in progress');
                    }).catch(() => {
                        setCurrentFile(undefined);
                        setUploadSuccessful(false);
                        setUploadInProgress(false);
                    });
                });

                newConnection.on('FileProcessed', (docJson) => {
                    const doc = JSON.parse(docJson);
                    setUploadSuccessful(true);
                    setPages(doc.pages);
                    setFileId(doc.id);
                    setNumberOfPages(doc.pages.length);
                });
            })
            .catch((e) => {
                setDropzoneText('Sorry. Could not upload the file!. Please try again later');
                console.log('Connection failed: ', e);
            });
        setConnection(newConnection);
    };

    const showFileToBigMessage = (file: File) => {
        const label = `${file.size}_${file.type}`;
        const message = 'Files bigger than 10MB are not supported at the moment. Sorry for the inconvenience.';
        toast.error(message, {
            position: 'top-center',
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { backgroundColor: '#ff7961' },
            bodyStyle: { margin: '0 auto' },
        });
        ReactGa.event({
            category: 'BigFileSize',
            action: 'FileSizeTooBig',
            label: label,
        });
        return;
    };

    useEffect(() => {
        ReactGa.event({
            category: 'PageLoad',
            action: 'UploadPageLoaded',
        });
        setDropZoneText();
    }, []);

    const setDropZoneText = () => {
        if (DeviceType.IsPhone()) {
            setDropzoneText('Tap to select your PDF');
        }
        if (DeviceType.IsTablet()) {
            setDropzoneText('Tap to select your PDF');
        }
        if (DeviceType.IsLargeEnoughSoYouDontCare()) {
            setDropzoneText('Click or tap to select your PDF');
        }
    };

    const getSignatureDrawPadDimensions = () => {
        const screenWidth = ScreenSize.GetScreenWidth();
        if (screenWidth > 900) {
            return {
                w: '30vw',
                h: `${30 / 2}vw`,
            };
        }
        if (screenWidth > 400) {
            return {
                w: '50vw',
                h: `${50 / 2}vw`,
            };
        }
        return {
            w: '85vw',
            h: `${85 / 2}vw`,
        };
    };

    const disconnectSignalR = (connection: HubConnection | undefined) => {
        if (connection) {
            connection.stop();
        }
    };

    const ConfirmSignatureAndAddToPage = () => {
        if (!imageBase64) {
            alert('Please draw your signature!');
            return;
        }
        ReactGa.event({
            category: 'Button',
            action: 'Added signature on page',
        });
        setSignatureSet(true);
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
            width: getSignatureDrawPadDimensions().w,
            height: getSignatureDrawPadDimensions().h,
            // margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            margin: 'auto',
            // width: '85%',
            // height: '75vh',
            textAlign: 'center',
            marginBottom: '5vh',
            marginTop: '3vh',
        },
        button: {
            marginTop: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        actionsContainer: {
            marginBottom: theme.spacing(2),
            marginTop: theme.spacing(2),
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

    return (
        <>
            <div className="center-vertical">
                {!uploadInProgress && (
                    <h1 className="header-text">
                        <b>{signYouPdfMessage}</b>
                    </h1>
                )}
                {currentFile && uploadInProgress && (
                    <h5 className="sub-header-text">
                        <b>{addYourSignatureInTheBoxBellow}</b>
                    </h5>
                )}

                {numberOfPages !== undefined && fileId !== undefined && disconnectSignalR(connection)}
                {numberOfPages !== undefined && fileId !== undefined && signatureSet && (
                    <Redirect
                        push
                        to={{
                            pathname: '/editor',
                            state: {
                                pages: pages,
                                fileId: fileId,
                                numberOfPages: numberOfPages,
                                imageBase64: imageBase64,
                                signatureHeight: signatureHeight,
                                signatureWidth: signatureWidth,
                            },
                        }}
                    />
                )}
                {openContactPage && (
                    <Redirect
                        push
                        to={{
                            pathname: '/contact',
                        }}
                    />
                )}

                {currentFile && uploadInProgress && (
                    <div className={classes.root} id="id1">
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
                                    Add signature on document
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {!uploadInProgress && (
                    <DropzoneArea
                        acceptedFiles={['application/pdf']}
                        showAlerts={false}
                        showPreviewsInDropzone={false}
                        dropzoneText={dropzoneText}
                        onChange={upload}
                        clearOnUnmount={true}
                        dropzoneProps={dropzoneProps}
                        maxFileSize={tenMBinBytes}
                        getDropRejectMessage={(file: File) => {
                            showFileToBigMessage(file);
                            return '';
                        }}
                    />
                )}
                <div className="margin-top1vh">
                    {!uploadInProgress && <p>The maximum accepted file size is 10MB</p>}
                    {currentFile && uploadInProgress && signatureSet && <LinearProgress color="secondary" />}
                </div>
            </div>
            <Footer onContactPageClick={() => setOpenContactPage(true)}></Footer>
            <CookieConsent
                location="bottom"
                buttonText="Accept"
                cookieName="e-signpdfconsent"
                style={{ background: '#71A9F7' }}
                buttonStyle={{ color: '#fff', background: '#6B5CA5', borderStyle: 'solid' }}
                overlay={true}
                expires={150}
            >
                This website uses cookies to enhance the user experience. Please agree with the{' '}
                <u>
                    <a style={{ color: '#fff' }} href="https://www.websitepolicies.com/policies/view/4Mp9sn1Q">
                        Cookie Policy
                    </a>
                </u>{' '}
                and our{' '}
                <u>
                    <a style={{ color: '#fff' }} href="https://www.websitepolicies.com/policies/view/U7jca8sa">
                        Terms & Conditions
                    </a>
                </u>{' '}
                before using the website
            </CookieConsent>{' '}
        </>
    );
};

export default UploadFiles;
