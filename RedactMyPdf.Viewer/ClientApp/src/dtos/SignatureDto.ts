interface SignatureDto {
    x: number;
    y: number;
    text: string;
    width: number;
    height: number;
    fontSize: number;
    //pageWidth as seen by the user - displayed - adica poate fi foarte mare dar pe telefon se vede mica
    pageWidth: number;
    //pageHeight as seen by the user
    pageHeight: number;
}

export default SignatureDto;
