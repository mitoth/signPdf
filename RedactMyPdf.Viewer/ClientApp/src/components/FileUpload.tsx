import React, { useState, useEffect, ReactElement } from 'react';
import UploadService from '../services/FileUploadService';
import { Redirect } from 'react-router-dom';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { DropzoneArea } from 'material-ui-dropzone';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles } from '@material-ui/core/styles';

const UploadFiles = (): ReactElement => {
    const uploadText = 'Drag and drop a PDF here or click';
    const [currentFile, setCurrentFile] = useState<File>();
    const [message, setMessage] = useState('nada');
    const [editorPath, setEditorPath] = useState<string>();
    const [signalRConnectionId, setSignalRConnectionId] = useState<string>();
    const [pages, setPages] = useState([]);
    const [connection, setConnection] = useState<HubConnection>();
    const [dropzoneText, setDropzoneText] = useState<string>(uploadText);
    const [dropzoneProps, setDropzoneProps] = useState<any>({ disabled: false });

    const upload = (files: File[]) => {
        const currentFile = files[0];

        if (!currentFile) return;

        setCurrentFile(currentFile);
        setDropzoneText("Processsing your file. We'll be quick");
        setDropzoneProps({ disabled: true });

        if (!signalRConnectionId) {
            setMessage('Could not upload the file! No client Id');
            setCurrentFile(undefined);
            return;
        }

        UploadService.upload(currentFile, signalRConnectionId, () => {
            setMessage('');
        }).catch(() => {
            setMessage('Could not upload the file!');
            setCurrentFile(undefined);
            setDropzoneText(uploadText);
        });
    };

    useEffect(() => {
        const newConnection = new HubConnectionBuilder().withUrl('/hubs/files').withAutomaticReconnect().build();

        setConnection(newConnection);
        return () => {
            setConnection(undefined);
        };
    }, []);

    useEffect(() => {
        if (connection) {
            connection
                .start()
                .then(() => {
                    connection.invoke('getConnectionId').then((connectionId) => {
                        setSignalRConnectionId(connectionId);
                    });

                    connection.on('FileProcessed', (docJson) => {
                        const doc = JSON.parse(docJson);
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

    //this is causing the memory leak console log error
    const StyledDropzone = withStyles({
        root: {
            color: '#fff',
            backgroundColor: '#757ce8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '65vh',
            marginBottom: '0.5vh',
            marginTop: '2vh',
            border: 'none',
        },
        active: {
            backgroundColor: '#a2cf6e',
        },
        text: {
            fontSize: '3vh',
        },
        icon: {
            color: '#fff',
            backgroundColor: '#757ce8',
            alignItems: 'center',
            justifyContent: 'center',
        },
    })(DropzoneArea);

    return (
        <>
            <div className="center-vertical">
                <h1 className="header-text">
                    <b>Electronically Sign your pdf 4 |{message}|.</b>
                </h1>
                {editorPath !== undefined && <Redirect push to={{ pathname: editorPath, state: { pages: pages } }} />}
                {/* <div className="margin-bottom2"></div> */}
                <StyledDropzone
                    acceptedFiles={['application/pdf']}
                    showAlerts={false}
                    showPreviewsInDropzone={false}
                    dropzoneText={dropzoneText}
                    onChange={upload}
                    clearOnUnmount={true}
                    dropzoneProps={dropzoneProps}
                />
                <div className="margin-top1vh">{currentFile && !message && <LinearProgress color="secondary" />}</div>
                <div className="margin-top3vh">{message && <p>{message}</p>}</div>
            </div>
        </>
    );
};

export default UploadFiles;
