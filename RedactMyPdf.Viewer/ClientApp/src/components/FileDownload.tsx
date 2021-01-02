/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement, useEffect, useRef } from 'react';

interface IProps {
    downloadPath: string;
    onDownloadComplete: () => void;
}

const FileDownload = (props: IProps): ReactElement => {
    const downloadForm: any = useRef(null);

    useEffect(() => {
        downloadForm.current?.submit();
        props.onDownloadComplete();
    }, []);

    return <form action={props.downloadPath} className="hidden" ref={downloadForm}></form>;
};

export default FileDownload;
