import React, { useState, useEffect, ReactElement } from 'react';
import UploadService from '../services/FileUploadService';
import UploadEvent from '../interfaces/UploadEvent';
import { Redirect } from 'react-router-dom';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

const UploadFiles = (): ReactElement => {
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [currentFile, setCurrentFile] = useState<string>();
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [editorPath, setEditorPath] = useState<string>();
    const [signalRConnectionId, setSignalRConnectionId] = useState<string>();
    const [pages, setPages] = useState([]);
    const [connection, setConnection] = useState<HubConnection>();
    const selectFile = (event: UploadEvent) => {
        setSelectedFiles(event.target.files);
    };

    const upload = () => {
        const currentFile = selectedFiles[0];

        setProgress(0);
        setCurrentFile(currentFile);

        if (!signalRConnectionId) {
            setProgress(0);
            setMessage('Could not upload the file! No client Id');
            setCurrentFile(undefined);
            return;
        }

        UploadService.upload(currentFile, signalRConnectionId, (event) => {
            const progresul = Math.round((100 * event.loaded) / event.total);
            if (progresul > 80) {
                setProgress(80);
            } else {
                setProgress(progresul);
            }
        })
            .then(() => {
                setMessage('Upload complete....processing document');
                // setProgress(90);
                // setPages(response.data.pages);
                // setEditorPath(`/editor/${response.data.id}/${response.data.pages.length}`);
            })
            .catch(() => {
                setProgress(0);
                setMessage('Could not upload the file!');
                setCurrentFile(undefined);
            });

        setSelectedFiles([]);
    };

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:59048/hubs/files')
            .withAutomaticReconnect()
            .build();

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
        <div>
            {currentFile && (
                <div className="progress">
                    <div
                        className="progress-bar progress-bar-info progress-bar-striped"
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

            <label className="btn btn-default">
                <input type="file" onChange={selectFile} />
            </label>

            <button className="btn btn-success" disabled={!selectedFiles} onClick={upload}>
                Upload
            </button>

            <div className="alert alert-light" role="alert">
                {message}
            </div>
            {editorPath !== undefined && <Redirect push to={{ pathname: editorPath, state: { pages: pages } }} />}
        </div>
    );
};

export default UploadFiles;
