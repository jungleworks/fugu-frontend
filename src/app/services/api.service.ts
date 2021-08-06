import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {environment} from '../../environments/environment';
import {SessionService} from './session.service';
import {HttpClient, HttpHeaders, HttpParams, HttpEventType} from '@angular/common/http';
import {map, retry} from 'rxjs/operators';
import {isArray} from 'util';
import {of} from 'rxjs/internal/observable/of';
import {CommonService} from './common.service';

@Injectable()
export class ApiService {
  whitelabelConfigurations = {};
  isWhitelabelled = false;

  constructor(private http: HttpClient, private sessionService: SessionService, private commonService: CommonService) {
    if (!this.getCookieSubdomain('device_id')) {
      this.setSubDomainCookie(this.generateRandomString());
    }
  }

  postData(url, data): Observable<any> {
    let userData, userKey;
    if (this.commonService.currentOpenSpace) {
      userKey = this.commonService.currentOpenSpace;
    }
    if (this.getCookieSubdomain('token')) {
      userData = this.getCookieSubdomain('token');
    }
    let headers;
    // headers = new HttpHeaders({
    //
    // });
    //
    headers = new HttpHeaders({
      'app_version': '1.0.0',
      'device_type': 'WEB',
      'access_token': userData['access_token']
    });
    // if (userData && userData['access_token']) {
    //   headers = headers.append('access_token',);
    // }
    return this.http.post(environment.FUGU_API_ENDPOINT + url, data, {headers: headers}).pipe(
      map(response => response));
  }

  postOc(data): Observable<any> {
    if (!this.getCookieSubdomain('device_id')) {
      this.setSubDomainCookie(this.generateRandomString());
    }
    let userData, userKey;
    if (this.commonService.currentOpenSpace) {
      userKey = this.commonService.currentOpenSpace;
    }
    if (this.getCookieSubdomain('token')) {
      userData = this.getCookieSubdomain('token');
    }
    let headers;
    headers = new HttpHeaders({
      'app_version': '1.0.0',
      'device_type': 'WEB'
    });

    if (userKey && userKey['fugu_secret_key']) {
      headers = headers.append('app_secret_key', userKey['fugu_secret_key']);
    }
    if (userData && userData['access_token']) {
      headers = headers.append('access_token', userData['access_token']);
    }
    if(this.commonService.getDomainName()){
      headers = headers.append('domain', this.commonService.getDomainName());
    }

    if (data.type !== 3 && data.type !== 5 && data.type !== 2 && data.type !== 9 && data.type !== 11) {
      data.body['device_id'] = this.getCookieSubdomain('device_id').toString();
      data.body['device_details'] = JSON.stringify({
        'browser-agent': navigator.userAgent
      });
    }
    if (data.type == 11) {
      data.body['device_id'] = this.getCookieSubdomain('device_id').toString();
    }
    const url = environment.FUGU_API_ENDPOINT + data.url;
    return this.http.post(url, data.body, {headers: headers}).pipe(
      map(response => response));
  }

  getFugu(data, header?): Observable<any> {
    let params, userData, userKey;

    if (this.getCookieSubdomain('token')) {
      userData = this.getCookieSubdomain('token');
    }

    if (this.commonService.currentOpenSpace) {
      userKey = this.commonService.currentOpenSpace;
    } else if (this.sessionService.get('spaceDictionary')) {
      const spaceDataAll = <any>this.sessionService.get('spaceDictionary');
      const workspace = window.location.pathname.split('/')[1];
      userKey = spaceDataAll[workspace];
    }
    let headers;

    headers = new HttpHeaders({
      'app_version': '1.0.0',
      'device_type': 'WEB'
    });

    if (userKey && userKey['fugu_secret_key']) {
      headers = headers.append('app_secret_key', userKey['fugu_secret_key']);
    }
    if (userData && userData['access_token']) {
      headers = headers.append('access_token', userData['access_token']);
    }

    if(this.commonService.getDomainName()){
      headers = headers.append('domain', this.commonService.getDomainName());
    }

    if (header && header['auth_token']) {
      headers = headers.append('auth_token', header['auth_token']);
    }

    if (data.type == 1) {
      data.body['device_id'] = this.getCookieSubdomain('device_id').toString();
      data.body['device_token'] = localStorage.getItem('token') || undefined;
      data.body['device_details'] = JSON.stringify({
        'browser-agent': navigator.userAgent
      });
    }
    params = this.convertGetRequestParams(data.body);
    const url = environment.FUGU_API_ENDPOINT + data.url + params;
    return this.http.get(url, {headers: headers}).pipe(
      map(response => response));
  }

  putFugu(data): Observable<any> {

    if (!this.getCookieSubdomain('device_id')) {
      this.setSubDomainCookie(this.generateRandomString());
    }
    let userData, userKey;
    if (this.getCookieSubdomain('token')) {
      userData = this.getCookieSubdomain('token');
    }
    if (this.commonService.currentOpenSpace) {
      userKey = this.commonService.currentOpenSpace;
    }

    // const headers = new HttpHeaders({
    //   'app_version': '1.0.0',
    //   'device_type': '3',
    //   'app_secret_key': userKey['fugu_secret_key']
    // });
    if (data.type !== 3) {
      data.body['device_id'] = this.getCookieSubdomain('device_id').toString();
      data.body['device_details'] = JSON.stringify({
        'browser-agent': navigator.userAgent
      });
    }

    let headers;

    headers = new HttpHeaders({
      'app_version': '1.0.0',
      'device_type': 'WEB'
    });
    if (userKey && userKey['fugu_secret_key']) {
      headers = headers.append('app_secret_key', userKey['fugu_secret_key']);
    }
    if (userData && userData['access_token']) {
      headers = headers.append('access_token', userData['access_token']);
    }
    if(this.commonService.getDomainName()){
      headers = headers.append('domain', this.commonService.getDomainName());
    }


    const url = environment.FUGU_API_ENDPOINT + data.url;
    return this.http.put(url, data.body, {headers: headers}).pipe(
      map(response => response));
  }

  patchFugu(data): Observable<any> {
    if (!this.getCookieSubdomain('device_id')) {
      this.setSubDomainCookie(this.generateRandomString());
    }
    let userData, userKey;
    if (this.getCookieSubdomain('token')) {
      userData = this.getCookieSubdomain('token');
    }
    if (this.commonService.currentOpenSpace) {
      userKey = this.commonService.currentOpenSpace;
    }

    let headers;

    headers = new HttpHeaders({
      'app_version': '1.0.0',
      'device_type': 'WEB'
    });
    if (userKey && userKey['fugu_secret_key']) {
      headers = headers.append('app_secret_key', userKey['fugu_secret_key']);
    }
    if (userData && userData['access_token']) {
      headers = headers.append('access_token', userData['access_token']);
    }
    if(this.commonService.getDomainName()){
      headers = headers.append('domain', this.commonService.getDomainName());
    }

    if (data.type !== 3) {
      data.body['device_id'] = this.getCookieSubdomain('device_id').toString();
      data.body['device_details'] = JSON.stringify({
        'browser-agent': navigator.userAgent
      });
    }
    const url = environment.FUGU_API_ENDPOINT + data.url;
    return this.http.patch(url, data.body, {headers: headers}).pipe(
      map(response => response));
  }

  deleteFugu(data): Observable<any> {
    if (!this.getCookieSubdomain('device_id')) {
      this.setSubDomainCookie(this.generateRandomString());
    }
    let userData, userKey;
    if (this.getCookieSubdomain('token')) {
      userData = this.getCookieSubdomain('token');
    }
    if (this.commonService.currentOpenSpace) {
      userKey = this.commonService.currentOpenSpace;
    }

    if (data.type !== 3) {
      data.body['device_id'] = this.getCookieSubdomain('device_id').toString();
      data.body['device_details'] = JSON.stringify({
        'browser-agent': navigator.userAgent
      });
    }

    let headers;

    headers = new HttpHeaders({
      'app_version': '1.0.0',
      'device_type': 'WEB'
    });

    if (userKey && userKey['fugu_secret_key']) {
      headers = headers.append('app_secret_key', userKey['fugu_secret_key']);
    }
    if (userData && userData['access_token']) {
      headers = headers.append('access_token', userData['access_token']);
    }
    if(this.commonService.getDomainName()){
      headers = headers.append('domain', this.commonService.getDomainName());
    }
    const url = environment.FUGU_API_ENDPOINT + data.url;
    return this.http.request('delete', url, {
      headers: headers,
      body: data.body
    }).pipe(
      map(response => response));
  }

  getTotalReponse(data): Observable<any> {
    let headers, userData, params;
    if (this.getCookieSubdomain('token')) {
      userData = this.getCookieSubdomain('token');
    }
    if (userData['access_token']) {
      headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'app_version': '1.0.0',
        'device_type': 'WEB',
        'access_token': userData['access_token']
      });
    } else {
      headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'app_version': '1.0.0',
        'device_type': 'WEB'
      });
    }
    params = this.convertGetRequestParams(data.body);
    const url = environment.FUGU_API_ENDPOINT + data.url + params;
    return this.http.get(url, {headers: headers, observe: 'response'}).pipe(
      map(response => response));
  }

  getNative(url) {
    return this.http.get(url, {responseType: 'text'}).pipe(
      map(response => response));
  }

  postOut(data): Observable<any> {

    let headers = new HttpHeaders({
      'app_version': '1.0.0',
      'device_type': 'WEB'
    });
    const url = environment.FUGU_API_ENDPOINT + data.url;
    return this.http.post(url, data.body, {headers: headers}).pipe(
      map(response => response));
  }

  generateRandomString() {
    const charsNumbers = '0123456789';
    const charsLower = 'abcdefghijklmnopqrstuvwxyz';
    const charsUpper = charsLower.toUpperCase();
    let chars;

    chars = charsNumbers + charsLower + charsUpper;

    const length = 10;

    let string = '';
    for (let i = 0; i < length; i++) {
      let randomNumber = Math.floor(Math.random() * 32) + 1;
      randomNumber = randomNumber || 1;
      string += chars.substring(randomNumber - 1, randomNumber);
    }
    return string + '.' + (new Date()).getTime();
  }

  getCookieSubdomain(cname) {
    const name = cname + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        try {
          return JSON.parse(c.substring(name.length, c.length));
        } catch (e) {
          return c.substring(name.length, c.length);
        }
      }
    }
    return '';
  }

  setSubDomainCookie(device_id) {
    const d = new Date();
    d.setTime(d.getTime() + (100 * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    if (!(window.location.hostname.includes('fugu.chat') || window.location.hostname.includes('officechat.io') ||
      window.location.hostname.includes('localhost'))) {
      document.cookie = `device_id=${device_id};${expires};domain=${this.whitelabelConfigurations['domain']};path=/`;
    } else {
      if (environment.production) {
        document.cookie = 'device_id=' + device_id + ';' + expires + ';domain=fugu.chat;path=/';
      } else {
        document.cookie = 'device_id=' + device_id + ';' + expires + ';domain=localhost;path=/';
        document.cookie = 'device_id=' + device_id + ';' + expires + ';domain=officechat.io;path=/';
      }
    }
  }

  convertGetRequestParams(data) {
    let str = '';
    // tslint:disable-next-line:forin
    for (const key in data) {
      if (str == '') {
        str += '?';
      }
      if (typeof data[key] != 'undefined') {
        if (!isArray(data[key])) {
          str += key + '=' + encodeURIComponent(data[key]) + '&';
        } else {
          str += key + '=' + JSON.stringify(data[key]) + '&';
        }
      }
    }
    return str.substring(0, str.length - 1);
  }

  uploadFileFugu(data): Observable<any> {
    let userData, userKey;

    if (this.getCookieSubdomain('token')) {
      userData = this.getCookieSubdomain('token');
    }

    if (this.commonService.currentOpenSpace) {
      userKey = this.commonService.currentOpenSpace;
    }

    let headers;

    headers = new HttpHeaders({
      'app_version': '1.0.0',
      'device_type': 'WEB'
    });

    if (userKey && userKey['fugu_secret_key']) {
      headers = headers.append('app_secret_key', userKey['fugu_secret_key']);
    }
    if (userData && userData['access_token']) {
      headers = headers.append('access_token', userData['access_token']);
    }

    let url = environment.FUGU_API_ENDPOINT + data.url;
    if (window.location.host == 'app.saps.chat') {
      url = 'https://api-upload.fugu.chat/api/' + data.url;
    }
    return this.http.post(url, data.body,
      {
        headers: headers,
        reportProgress: true,
        observe: 'events'
      }).pipe(map((event) => {
      switch (event.type) {
        case HttpEventType.Sent:
          return {status: 'sent', message: HttpEventType.Sent};
        case HttpEventType.UploadProgress:
          const progress = Math.round(100 * event.loaded / event.total);
          return {status: 'progress', message: progress};
        case HttpEventType.Response:
          return {status: 'response', message: event.body};
        default:
          return `Unhandled event: ${event.type}`;
      }
    }));
  }
}
