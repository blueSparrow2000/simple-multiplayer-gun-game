## How to turn on the server:

node backend.js // turn on once


nodemon backend.js // turn every time (can refresh) script change is applied immediately

## How to log in as a client in web browser(chrome):

### URL:

localhost:3000 (port number is 3000 in default) 


## nodemon installation

In admin mode, open up power shell and type:


PS C:\Windows\system32> get-ExecutionPolicy


Restricted


PS C:\Windows\system32>  set-ExecutionPolicy RemoteSigned


PS C:\Windows\system32> npm install nodemon


https://velog.io/@lilclown/Error-nodemon-%EC%98%A4%EB%A5%98-%EC%9D%B4-%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%97%90%EC%84%9C-%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EB%A5%BC-%EC%8B%A4%ED%96%89%ED%95%A0-%EC%88%98-%EC%97%86%EC%9C%BC%EB%AF%80%EB%A1%9C


## Requirements (install packages)
do npm install [package name] on cmd

- Node.js
- express
- socket.io
- line-circle-collison


## Sample run
![interface](../main/run_images/intro.png)
![interface](../main/run_images/ingame.png)


## Update logs
2023.12.28 Made single play gungame


2023.12.29 ~ 12.30 Basic multiplayer game framework


2023.12.31 Added guns & ground items


2024.1.1 Added Enemies


2024.1.2 Added close combat weapons & polished the game!


~ 2024.1.4 Added walls and new features


2024.1.5 Server optimizations / Location shown when joining / Auto reload


2024.1.6 Server optimization / balance patch


2024.1.7 Added Fog of war


## Youtube sample play link
https://www.youtube.com/watch?v=cpRIU2XMYDQ
