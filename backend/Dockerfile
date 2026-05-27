# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy solution and project files first for layer caching
COPY src/*.sln .
COPY src/Fundo.Domain/*.csproj Fundo.Domain/
COPY src/Fundo.Application/*.csproj Fundo.Application/
COPY src/Fundo.Infrastructure/*.csproj Fundo.Infrastructure/
COPY src/Fundo.Applications.WebApi/*.csproj Fundo.Applications.WebApi/
COPY src/Fundo.Services.Tests/*.csproj Fundo.Services.Tests/

RUN dotnet restore

# Copy everything and build
COPY src/ .
RUN dotnet build -c Release
RUN dotnet test -c Release --no-build --verbosity normal
RUN dotnet publish Fundo.Applications.WebApi/Fundo.Applications.WebApi.csproj -c Release -o /app/publish --no-build

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app
EXPOSE 80
EXPOSE 443

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "Fundo.Applications.WebApi.dll"]
