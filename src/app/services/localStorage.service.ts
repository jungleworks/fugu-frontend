import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

  constructor() {
  }

  set(key, value) {
    value = JSON.stringify(value);
    localStorage.setItem(key, value);
  }
  get(key) {
    if (localStorage.getItem(key)) {
      let data = localStorage.getItem(key);
      data = JSON.parse(data);
      return data;
    } else {
      return null;
    }
  }
  remove(key) {
    localStorage.removeItem(key);
  }

}
