import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {

  constructor() {
  }

  set(key, value) {
    value = JSON.stringify(value);
    value = encodeURIComponent(value);
    localStorage.setItem(key, value);
  }
  get(key) {
    if (localStorage.getItem(key)) {
      let data = decodeURIComponent(localStorage.getItem(key));
      data = JSON.parse(data);
      return data;
    } else {
      return null;
    }

  }
  setByKey(parentKey, childKey, value) {
    let appObj: any = this.get(parentKey);
    if (!appObj) {
      appObj = {};
    }
    appObj[childKey] = value;
    this.set(parentKey, appObj);
  }
  getByKey(parentKey, childKey, subkey: any = false) {
    const appObj: any = this.get(parentKey);
    if (appObj) {
      if (subkey) {
        return appObj[childKey][subkey];
      } else {
        return appObj[childKey];
      }
    } else {
      return appObj;
    }
  }
  removeByChildKey(parentKey, childKey) {
    const appObj: any = this.get(parentKey);
    delete appObj[childKey];
    this.set(parentKey, appObj);
  }
  remove(key) {
    localStorage.removeItem(key);
  }
  removeAll() {
    let consent;
    if (this.get('cookie_consent_shown') != null) {
      consent = this.get('cookie_consent_shown');
    }
    localStorage.clear();
    if (typeof consent != 'undefined') {
      this.set('cookie_consent_shown', consent);
    }
  }

}
