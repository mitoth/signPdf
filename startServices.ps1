invoke-expression 'cmd /c start powershell -NoExit -Command { cd RedactMyPdf.BurnPdfWorker; dotnet run}'
invoke-expression 'cmd /c start powershell -NoExit -Command { cd RedactMyPdf.ConvertPdfWorker; dotnet run}'
invoke-expression 'cmd /c start powershell -NoExit -Command { cd RedactMyPdf.Viewer; dotnet run}'