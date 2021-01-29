import React, { useState, useEffect, ReactElement } from 'react';
import UploadService from '../services/FileUploadService';
import UploadEvent from '../interfaces/UploadEvent';
import { Redirect } from 'react-router-dom';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

const UploadFiles = (): ReactElement => {
    const [currentFile, setCurrentFile] = useState<string>();
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [editorPath, setEditorPath] = useState<string>();
    const [signalRConnectionId, setSignalRConnectionId] = useState<string>();
    const [pages, setPages] = useState([]);
    const [connection, setConnection] = useState<HubConnection>();

    const upload = (event: UploadEvent) => {
        const currentFile = event.target.files[0];

        setProgress(0);
        setCurrentFile(currentFile);

        if (!signalRConnectionId) {
            setProgress(0);
            setMessage('Could not upload the file! No client Id');
            setCurrentFile(undefined);
            return;
        }

        UploadService.upload(currentFile, signalRConnectionId, (event) => {
            setMessage('');
            const progresul = Math.round((100 * event.loaded) / event.total);
            if (progresul > 80) {
                setProgress(80);
            } else {
                setProgress(progresul);
            }
        })
            .then(() => {
                setTimeout(function () {
                    setMessage('Could not process the file!');
                }, 10000);
                // setMessage('Upload complete....processing document');
                // setProgress(90);
                // setPages(response.data.pages);
                // setEditorPath(`/editor/${response.data.id}/${response.data.pages.length}`);
            })
            .catch(() => {
                setProgress(0);
                setMessage('Could not upload the file!');
                setCurrentFile(undefined);
            });
    };

    useEffect(() => {
        const newConnection = new HubConnectionBuilder().withUrl('/hubs/files').withAutomaticReconnect().build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
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
                        setProgress(90);
                        setPages(doc.pages);
                        setEditorPath(`/editor/${doc.id}/${doc.pages.length}`);
                    });
                })
                .catch((e) => console.log('Connection failed: ', e));
        }
    }, [connection]);

    return (
        <div className="center-vertical top15">
            <h1 className="font-weight-bold text-primary">Welcome to your PDF editor</h1>

            <input type="file" id="file" accept="application/pdf" onChange={upload} />

            <div className="">
                <label htmlFor="file" className="btn btn-primary btn-lg top15">
                    Choose a PDF
                </label>
                {message && (
                    <h2>
                        <p className="top20 text-danger top18">{message}</p>
                    </h2>
                )}
                {currentFile && !message && (
                    <div className="progress top20 fullwidth">
                        <div
                            className="progress-bar progress-bar-info progress-bar-striped bg-success"
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            style={{ width: progress + '%' }}
                        >
                            {progress}%
                        </div>
                    </div>
                )}
            </div>
            {editorPath !== undefined && <Redirect push to={{ pathname: editorPath, state: { pages: pages } }} />}
        </div>
    );
};

export default UploadFiles;
