#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/nightly/aspnet:5.0 AS base
RUN apt-get update && apt-get install -y libgdiplus
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
RUN apt-get update && apt-get install -y apt-utils
RUN apt-get install -y libfontconfig1
RUN apt-get install -y libgdiplus
RUN apt-get install -y libc6-dev 
RUN ln -s /usr/lib/libgdiplus.so/usr/lib/gdiplus.dll
WORKDIR /src
COPY ["RedactMyPdf.ConvertPdfWorker/RedactMyPdf.ConvertPdfWorker.csproj", "RedactMyPdf.ConvertPdfWorker/"]
COPY ["RedactMyPdf.FileHandler/RedactMyPdf.FileHandler.csproj", "RedactMyPdf.FileHandler/"]
COPY ["RedactMyPdf.Core/RedactMyPdf.Core.csproj", "RedactMyPdf.Core/"]
COPY ["RedactMyPdf.Repository.Mongo/RedactMyPdf.Repository.Mongo.csproj", "RedactMyPdf.Repository.Mongo/"]
RUN dotnet restore "RedactMyPdf.ConvertPdfWorker/RedactMyPdf.ConvertPdfWorker.csproj"
COPY . .
WORKDIR "/src/RedactMyPdf.ConvertPdfWorker"
RUN dotnet build "RedactMyPdf.ConvertPdfWorker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "RedactMyPdf.ConvertPdfWorker.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RedactMyPdf.ConvertPdfWorker.dll"]