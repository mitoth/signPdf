import React, { useState, useEffect, ReactElement } from 'react';
import UploadService from '../services/FileUploadService';
import { Redirect } from 'react-router-dom';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { DropzoneArea } from 'material-ui-dropzone';
import LinearProgress from '@material-ui/core/LinearProgress';
import DeviceType from '../services/DeviceType';

const UploadFiles = (): ReactElement => {
    const [currentFile, setCurrentFile] = useState<File>();
    const [editorPath, setEditorPath] = useState<string>();
    const [signalRConnectionId, setSignalRConnectionId] = useState<string>();
    const [pages, setPages] = useState([]);
    const [connection, setConnection] = useState<HubConnection>();
    const [dropzoneText, setDropzoneText] = useState<string>('');
    const [dropzoneProps, setDropzoneProps] = useState<any>({ disabled: false });
    const [uploadSuccessful, setUploadSuccessful] = useState<boolean>(false);
    const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);

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
                        setEditorPath(`/editor/${doc.id}/${doc.pages.length}`);
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
                {editorPath !== undefined && <Redirect push to={{ pathname: editorPath, state: { pages: pages } }} />}
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
        </>
    );
};

export default UploadFiles;
