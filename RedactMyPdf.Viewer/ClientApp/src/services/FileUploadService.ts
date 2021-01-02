/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import http from '../http-common';
const upload = async (
    file: string | Blob,
    signalRClientId: string,
    onUploadProgress: (progressEvent: any) => void,
): Promise<AxiosResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post(`/api/v1/document?connectionId=${signalRClientId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    });
};

const save = (documentId: string, shapes: any, signalRClientId: string): any => {
    return http.post(`/api/v1/document/${documentId}/burn?connectionId=${signalRClientId}`, shapes);
};

export default {
    upload,
    save,
};
