import React, { useState, useEffect, ReactElement } from 'react';
import UploadService from '../services/FileUploadService';
import { Redirect } from 'react-router-dom';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { DropzoneArea } from 'material-ui-dropzone';
import LinearProgress from '@material-ui/core/LinearProgress';
import DeviceType from '../services/DeviceType';
import Footer from './Footer';
import Cookies from 'universal-cookie';
import CookieConsent from 'react-cookie-consent';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

const UploadFiles = (): ReactElement => {
    const [currentFile, setCurrentFile] = useState<File>();
    const [fileId, setFileId] = useState<string>();
    const [numberOfPages, setNumberOfPages] = useState<number>();
    const [signalRConnectionId, setSignalRConnectionId] = useState<string>();
    const [pages, setPages] = useState([]);
    const [connection, setConnection] = useState<HubConnection>();
    const [dropzoneText, setDropzoneText] = useState<string>('');
    const [dropzoneProps, setDropzoneProps] = useState<any>({ disabled: false });
    const [uploadSuccessful, setUploadSuccessful] = useState<boolean>(false);
    const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);
    const [openContactPage, setOpenContactPage] = useState<boolean>(false);

    const upload = (files: File[]) => {
        const currentFile = files[0];
        setUploadSuccessful(false);
        setUploadInProgress(true);

        if (!currentFile) return;

        window.setTimeout(() => {
            if (!uploadSuccessful) {
                connection?.stop();
                setDropzoneText('Sorry. Could not upload the file!. Please try again later');
                setUploadInProgress(false);
            }
        }, 20000);

        window.setTimeout(() => {
            setDropzoneText('Sorry. It takes a bit longer than expected...');
        }, 10000);

        setCurrentFile(currentFile);
        setDropzoneText("Processsing your file. We'll be quick");
        setDropzoneProps({ disabled: true });

        if (!signalRConnectionId) {
            setDropzoneText('Could not upload the file! No connection. Please try again later');
            setCurrentFile(undefined);
            return;
        }

        UploadService.upload(currentFile, signalRConnectionId, () => {
            console.log('in progress');
        }).catch(() => {
            setCurrentFile(undefined);
            setUploadSuccessful(false);
            setUploadInProgress(false);
        });
    };

    useEffect(() => {
        console.log('gol');
        const newConnection = new HubConnectionBuilder().withUrl('/hubs/files').withAutomaticReconnect().build();

        const cookies = new Cookies();
        const cookieName = 'e-signpdfconsent';
        const cookie = cookies.get(cookieName);
        if (cookie) {
            console.log('este ', cookie); // Pacman
        } else {
            cookies.set(cookieName, 'Pacman', { path: '/' });
            console.log(cookies.get(cookieName)); // Pacman
        }

        setConnection(newConnection);
        return () => {
            setConnection(undefined);
        };
    }, []);

    useEffect(() => {
        console.log('checks');
        if (DeviceType.IsPhone()) {
            console.log('phone');
            setDropzoneText('Tap to select your PDF');
        }
        if (DeviceType.IsTablet()) {
            console.log('tablet');
            setDropzoneText('Tap to select your PDF');
        }
        if (DeviceType.IsLargeEnoughSoYouDontCare()) {
            console.log('large');
            setDropzoneText('Click or tap to select your PDF');
        }

        if (connection) {
            connection
                .start()
                .then(() => {
                    connection.invoke('getConnectionId').then((connectionId) => {
                        setSignalRConnectionId(connectionId);
                    });

                    connection.on('FileProcessed', (docJson) => {
                        const doc = JSON.parse(docJson);
                        setUploadSuccessful(true);
                        setPages(doc.pages);
                        setFileId(doc.id);
                        setNumberOfPages(doc.pages.length);
                    });
                })
                .catch((e) => console.log('Connection failed: ', e));
        }
        return () => {
            connection?.stop();
        };
    }, [connection]);

    return (
        <>
            <div className="center-vertical">
                <h1 className="header-text">
                    <b>Electronically Sign your pdf.</b>
                </h1>
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
