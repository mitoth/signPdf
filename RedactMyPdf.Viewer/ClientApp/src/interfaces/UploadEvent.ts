interface UploadFileEvent extends EventTarget {
    files: string[];
}

interface UploadEvent extends React.ChangeEvent<HTMLInputElement> {
    target: UploadFileEvent & HTMLInputElement;
}

export default UploadEvent;
