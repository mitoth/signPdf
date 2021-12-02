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

    const upload = (files: File[]) => {
        const currentFile = files[0];
        if (!currentFile) {
            console.log('no file');
            return;
        }

        const tenMBinBytes = 10485760;
        const label = `${currentFile.size}_${currentFile.type}`;
        if (currentFile.size > tenMBinBytes) {
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
        }

        setUploadSuccessful(false);
        setUploadInProgress(true);

        if (!currentFile) return;

        window.setTimeout(() => {
            if (!uploadSuccessful) {
                connection?.stop();
                ReactGa.event({
                    category: 'PageError',
                    action: 'CouldNotUploadFile',
                    label: label,
                });
                setDropzoneText('Sorry. Could not upload the file!. Please try again later');
                setUploadInProgress(false);
            }
        }, 40000);

        window.setTimeout(() => {
            ReactGa.event({
                category: 'PageWarning',
                action: 'UploadTakesLonger',
                label: label,
            });
            setDropzoneText('Sorry. It takes a bit longer than expected...');
        }, 20000);

        setCurrentFile(currentFile);
        setDropzoneText("Processsing your file. We'll be quick");
        setDropzoneProps({ disabled: true });

        if (connection) {
            connection.stop();
        }

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

    const disconnectSignalR = (connection: HubConnection | undefined) => {
        if (connection) {
            connection.stop();
        }
    };

    return (
        <>
            <div className="center-vertical">
                <h1 className="header-text">
                    <b>Electronically Sign Your PDF.</b>
                </h1>
                {numberOfPages !== undefined && fileId !== undefined && disconnectSignalR(connection)}
                {numberOfPages !== undefined && fileId !== undefined && (
                    <Redirect
                        push
                        to={{
                            pathname: '/editor',
                            state: { pages: pages, fileId: fileId, numberOfPages: numberOfPages },
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

                <DropzoneArea
                    acceptedFiles={['application/pdf']}
                    showAlerts={false}
                    showPreviewsInDropzone={false}
                    dropzoneText={dropzoneText}
                    onChange={upload}
                    clearOnUnmount={true}
                    dropzoneProps={dropzoneProps}
                />
                <div className="margin-top1vh">
                    {!uploadInProgress && <p>The maximum accepted file size is 10MB</p>}
                    {currentFile && uploadInProgress && <LinearProgress color="secondary" />}
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
