FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["TCI.Presentation/TCI.Presentation.csproj", "TCI.Presentation/"]
COPY ["TCI.Business/TCI.Business.csproj", "TCI.Business/"]
COPY ["TCI.DataAccess/TCI.DataAccess.csproj", "TCI.DataAccess/"]

RUN dotnet restore "TCI.Presentation/TCI.Presentation.csproj"

COPY . .

RUN dotnet publish "TCI.Presentation/TCI.Presentation.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "TCI.Presentation.dll"]