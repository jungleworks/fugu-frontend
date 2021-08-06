// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  beta: true,
  FUGU_CONFERENCE_URL: 'https://meet.jit.si',
  FUGU_API_ENDPOINT: 'https://openapi.fuguchat.com/api/',
  SOCKET_ENDPOINT: 'https://openapi.fuguchat.com',
  REDIRECT_PATH: window.location.hostname,
  BRANCH_KEY: '',
  LOGOUT_REDIRECT: 'https://' + window.location.hostname + '/signup',
  INVITE_REDIRECT: 'https://' + window.location.hostname + '/spaces',
  LOCAL_SPACE: 'jungleworks',
  LOCAL_DOMAIN: 'fuguchat.com',
  STRIPE_KEY: '',
  CHROME_EXTENSION_ID: '',
  GOOGLE_MAPS_KEY: '',
  GIF_API_KEY: '',
  TRELLO_API_KEY: '',
  FIREBASE_CONFIG : {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
};
