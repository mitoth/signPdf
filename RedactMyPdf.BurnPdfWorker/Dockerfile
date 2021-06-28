#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/nightly/aspnet:5.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["RedactMyPdf.BurnPdfWorker/RedactMyPdf.BurnPdfWorker.csproj", "RedactMyPdf.BurnPdfWorker/"]
COPY ["RedactMyPdf.FileHandler/RedactMyPdf.FileHandler.csproj", "RedactMyPdf.FileHandler/"]
COPY ["RedactMyPdf.Core/RedactMyPdf.Core.csproj", "RedactMyPdf.Core/"]
COPY ["RedactMyPdf.Repository.Mongo/RedactMyPdf.Repository.Mongo.csproj", "RedactMyPdf.Repository.Mongo/"]
RUN dotnet restore "RedactMyPdf.BurnPdfWorker/RedactMyPdf.BurnPdfWorker.csproj"
COPY . .
WORKDIR "/src/RedactMyPdf.BurnPdfWorker"
RUN dotnet build "RedactMyPdf.BurnPdfWorker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "RedactMyPdf.BurnPdfWorker.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RedactMyPdf.BurnPdfWorker.dll"]