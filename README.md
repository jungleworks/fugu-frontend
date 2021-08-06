## Fugu is an open source, private cloud, Slack-alternative from https://jungleworks.com/fugu/
___
## Steps to deploy fugu-frontend on your server

### Create a directory where you want to store your angular project  (Ex. `/var/www/angular`)
```sh
/var/www/angular
```
### Go to the project directory and clone the repo to your server
```sh
cd /var/www/angular
git clone https://github.com/jungleworks/fugu-frontend
```

### Use `npm` to install all the required dependencies
```sh
cd `/var/www/angular/`fugu-frontend && npm install @angular/cli@9.1.6 && npm i
```

### Edit the `env` files in `src/environments` directory (___REQUIRED___)
> `/var/www/angular/`fugu-frontend/src/environment/environment.prod.ts
```javascript
  FUGU_CONFERENCE_URL: 'https://meet.jit.si', // Deploy your own jitsi instance and change this url to yours
  FUGU_API_ENDPOINT: 'https://openapi.fuguchat.com/api/', // Change 'openapi.fuguchat.com' to the api pointing of your fugu-server
  SOCKET_ENDPOINT: 'https://openapi.fuguchat.com', // Change 'openapi.fuguchat.com' to the api pointing of your fugu-server
  ...
  BRANCH_KEY: '', // SignUp and create a new app on https://dashboard.branch.io/ and place your live branch key here
  ...
  GOOGLE_MAPS_KEY: '', // Place your Google Maps key here to use with attendance bot. Key needs access to 2 libraries - drawing & places
  GIF_API_KEY:'Create a GIPHY API Key', // Place your Giphy key here for sharing gifs in chats
  TRELLO_API_KEY: '', // Place a Trello API key to be used for trello integration
```

### Edit the `src/environments/environment.prod.ts` and  `src/sw.js` to add firebase configuration
- Register new account or  to log in with existing account
- Once logged in, click on Add Project. Provide a project name, and other detaisl and Create Project.
- Once the project has been created, it will automatically redirect to Firebase dashboard screen
- Add project/application to the firebase project.
- After the project has been added go to Project Settings > General and select CDN from SDK setup and configuration at the bottom of the page
- Copy this object and add to ypur application
```javascript
FIREBASE_CONFIG:{
    apiKey: '[PROJECT_API_KEY]',
    authDomain: '[PROJECT_AUTH_DOMAIN]',
    databaseURL: '[PROJECT_DB_URL]',
    projectId: '[PROJECT_ID]',
    storageBucket: '[STORAGE_BUCKET]',
    messagingSenderId: '[MESSAGE_ID]',
    appId: '[WEB_APP_ID]',
    measurementId: '[MEASUREMENT_ID]'
}
```

### Now build your angular project
```sh
npm run build
```

> To run your project in development mode use `ng serve` and navigate to `http://localhost:4200`