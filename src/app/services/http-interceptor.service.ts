import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Injectable, Injector} from '@angular/core';
import {SessionService} from './session.service';
import {MessageService} from './message.service';
import {Router} from '@angular/router';
import {LoaderService} from './loader.service';
import {environment} from '../../environments/environment';
import {tap} from 'rxjs/operators';
import { CommonService } from './common.service';
import { CommonApiService } from './common-api.service';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(public sessionService: SessionService, private messageService: MessageService,
              private router: Router, private loader: LoaderService, private commonService: CommonService,
    private commonApiService: CommonApiService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
      // if (event instanceof HttpResponse) {
      //   // do stuff with response if you want
      // }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 400) {
          this.loader.hide();
          this.messageService.sendAlert({
            type: 'danger',
            msg: err.error.message,
            timeout: 2000
          });
        } else if (err.status === 401) {
          this.loader.hide();
          this.messageService.sendAlert({
            type: 'danger',
            msg: 'Unauthorized',
            timeout: 2000
          });
          this.sessionService.removeAll();
          this.setSubDomainCookie([]);
          if (this.commonService.isWhitelabelled) {
            window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/login`, '_self');
          } else {
            window.open(environment.LOGOUT_REDIRECT, '_self');
          }
        } else if (err.status === 409) {
          this.loader.hide();
          this.messageService.sendAlert({
            type: 'danger',
            msg: err.error.message,
            timeout: 2000
          });
        }  else if (err.status === 429) {
          this.loader.hide();
          // this.commonService.showMoveNewPopup = true;
        }
      }
    }));
  }
  setSubDomainCookie(array) {
    array = JSON.stringify(array);
    const d = new Date();
    d.setTime(d.getTime() + (100 * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    if (!(window.location.hostname.includes('fugu.chat') || window.location.hostname.includes('officechat.io') ||
      window.location.hostname.includes('localhost'))) {
      document.cookie = `token=${array};${expires};domain=${this.commonApiService.whitelabelConfigurations['domain']};path=/`;
    } else {
      if (environment.production) {
        document.cookie = 'token=' + array + ';' + expires + ';domain=fugu.chat;path=/';
      } else {
        document.cookie = 'token=' + array + ';' + expires + ';domain=localhost;path=/';
        document.cookie = 'token=' + array + ';' + expires + ';domain=officechat.io;path=/';
      }
    }
  }
}
