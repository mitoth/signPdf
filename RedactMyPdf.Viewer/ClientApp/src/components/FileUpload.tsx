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
    const [message, setMessage] = useState('');
    const [editorPath, setEditorPath] = useState<string>();
    const [signalRConnectionId, setSignalRConnectionId] = useState<string>();
    const [pages, setPages] = useState([]);
    const [connection, setConnection] = useState<HubConnection>();
    const [dropzoneText, setDropzoneText] = useState<string>(uploadText);
    const [dropzoneProps, setDropzoneProps] = useState<any>({ disabled: false });

    const upload = (files: File[]) => {
        const currentFile = files[0];

        if (!currentFile) return;

        console.log('uplaoded');
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
        console.log('useeffect1');
        const newConnection = new HubConnectionBuilder().withUrl('/hubs/files').withAutomaticReconnect().build();

        setConnection(newConnection);
        return () => {
            setConnection(undefined);
        };
    }, []);

    useEffect(() => {
        console.log('useeffect2');
        if (connection) {
            connection
                .start()
                .then((result) => {
                    console.log('Connected!', result);
                    connection.invoke('getConnectionId').then((connectionId) => {
                        console.log('getConnectionId ' + connectionId);
                        setSignalRConnectionId(connectionId);
                    });

                    connection.on('FileProcessed', (docJson) => {
                        const doc = JSON.parse(docJson);
                        console.log('FileProcessed' + doc);
                        setMessage('gata');
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

    const displayNone = {
        display: 'none',
    };

    const StyledDropzone = withStyles({
        root: {
            color: '#fff',
            backgroundColor: '#757ce8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '75vh',
            marginBottom: '0.5vh',
            marginTop: '0.5vh',
        },
        active: {
            backgroundColor: '#a2cf6e',
        },
        text: {
            alignItems: 'flex-start',
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
            <div className="center-vertical top5">
                <h1 className="header-text">
                    <b>
                        <u>Sign</u> or <u>edit</u> your <u>pdf</u> in a few easy steps.
                    </b>
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
                <LinearProgress color="secondary" />
                {/* <div className="margin-top1vh">{currentFile && !message && <LinearProgress color="secondary" />}</div> */}
            </div>
        </>
    );
};

export default UploadFiles;
