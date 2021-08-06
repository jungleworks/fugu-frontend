export const environment = {
  production: true,
  beta: false,
  FUGU_CONFERENCE_URL: 'https://meet.jit.si',
  FUGU_API_ENDPOINT: 'https://' + window.location.hostname + '/fugu-api/api/',
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
