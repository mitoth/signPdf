#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443
RUN apt-get update
RUN curl -sL https://deb.nodesource.com/setup_10.x |  bash -
RUN apt-get install -y nodejs

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
RUN curl -sL https://deb.nodesource.com/setup_10.x |  bash -
RUN apt-get install -y nodejs
WORKDIR /src
COPY ["RedactMyPdf.Viewer/RedactMyPdf.Viewer.csproj", "RedactMyPdf.Viewer/"]
COPY ["RedactMyPdf.Core/RedactMyPdf.Core.csproj", "RedactMyPdf.Core/"]
COPY ["RedactMyPdf.Repository.Mongo/RedactMyPdf.Repository.Mongo.csproj", "RedactMyPdf.Repository.Mongo/"]
RUN dotnet restore "RedactMyPdf.Viewer/RedactMyPdf.Viewer.csproj"
COPY . .
WORKDIR "/src/RedactMyPdf.Viewer"
RUN dotnet build "RedactMyPdf.Viewer.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "RedactMyPdf.Viewer.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RedactMyPdf.Viewer.dll"]