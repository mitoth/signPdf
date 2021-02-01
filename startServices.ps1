invoke-expression 'cmd /c start powershell -Command { cd RedactMyPdf.BurnPdfWorker; dotnet run}'
invoke-expression 'cmd /c start powershell -Command { cd RedactMyPdf.ConvertPdfWorker; dotnet run}'
invoke-expression 'cmd /c start powershell -Command { cd RedactMyPdf.Viewer; dotnet run}'