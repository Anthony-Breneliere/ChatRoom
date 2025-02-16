# [![ChatRoom](/docs/pics/hero.png)](https://www.chatroom.com/)

ChatRoom is a simple chat Service

You can access the development environment [here](https://dev.chatroom.com/) !

## Summary

1. [Requirement](#requirement)
   - [Docker](#docker)
   - [.NET](#net)
   - [Angular](#angular)
2. [Launch](#launch)
   - [Database](#database)
   - [API](#api)
   - [Client APP](#client-app)
3. [Business Process](#business-process)

## Requirement

First of all, you must install the following dependencies, Docker for the database, .NET for the back office part and NodeJS and Angular for the front end part.

We recommend that you install an editor like [VS Code](https://code.visualstudio.com/) or [Jet Brains Rider](https://www.jetbrains.com/fr-fr/rider/) to be able to better manage the environment if you ever want to launch the application in debugger mode.

### Docker

Go to the [Official Docker website](https://www.docker.com/) and install the version that corresponds to your operating system. This dependency will be used to launch the database in a pre-made environment.

### .NET

Install .NET SDK to be able to launch the API, for this you must go to the [SDK download link](https://dotnet.microsoft.com/en-us/download) and download the version corresponding to your system.

### Angular

For the front end application you must [download NodeJS](https://nodejs.org/en/download/package-manager) which will then install the NPM packet manager where you will then have to type the following commands in a terminal.

```bash
~$ npm i -g @angular/cli
~$ npm i -g pnpm
~$ cd ./chatroom-app
~$ pnpm i
```

> [!NOTE]  
> We recommend that you install NodeJS using Node Version Manager (NVM), the tool will allow you to change version of NodeJS and NPM easily if necessary.

## Launch

Now that all the project dependencies are installed, you can launch it without worries by following the series of commands indicated in the 3 steps below.

First of all you must go to the root of the project by typing the following command:

```bash
~$ cd ~/ChatRoom
```

### Database

To launch the database, use the following docker command:

```bash
~$ docker compose up db
```

Check if dotnet ef tools are installed with the good version:
    
```bash
~$ dotnet ef --version
Entity Framework Core .NET Command-line Tools
9.0.0
```
If not install them with the following command:
```bash
~$ dotnet tool install --global dotnet-ef
```

> [!NOTE]  
> Don't forget to run the docker daemon if this is not the case with `~$ sudo dockerd`.

### API

In a second terminal, type the following commands:

```bash
~$ cd ./ChatRoom.Startup
~$ dotnet run
```

## Update to database previous version

After having modified model classes, if you want to update the database with changes, use the following command

```bash
~$ cd ./ChatRoom.Repository
~$ dotnet ef migrations add ChatRoomName -s ..\Chat.Startup\ 
```
The launch of the app will execute the migration.

In the case the migration you have to rollback to is 20241224111800_OfferBatchUpdateAt:

```bash
~$ cd ./ChatRoom.Repository
~$ dotnet ef database update -s ..\ChatRoom.Startup\ 20241224111800_OfferBatchUpdateAt
```

### Client APP

In a final terminal, type the following commands:

```bash
~$ cd ./chatroom-app
~$ pnpm start
```

