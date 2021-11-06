interface SignatureDto {
    x: number;
    y: number;
    imageAsBase64: string;
    width: number;
    height: number;
    //pageWidth as seen by the user - displayed - adica poate fi foarte mare dar pe telefon se vede mica
    pageWidth: number;
    //pageHeight as seen by the user
    pageHeight: number;
}

export default SignatureDto;
