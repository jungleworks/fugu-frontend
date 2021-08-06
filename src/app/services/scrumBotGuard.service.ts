import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute } from '@angular/router';
import { SessionService } from './session.service';
import { CommonService } from './common.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ScrumBotService } from './scrum-bot.service';

@Injectable()
export class ScrumBotGuardService implements CanActivate {
  constructor(private router: Router, private sessionService: SessionService,
    private scrumBotService: ScrumBotService, private activatedRoute: ActivatedRoute) { }

  canActivate() {
    return this.checkLogin();
  }

  checkLogin(): Observable<any> {
    const spaceDataAll = <any>this.sessionService.get('spaceDictionary');
    const workspace = window.location.pathname.split('/')[1];
    const spaceData = spaceDataAll[workspace];
    const obj = {
      user_name: spaceData.fugu_user_id,
      business_id: spaceData.workspace_id
    };
    return this.scrumBotService.getScrumDetailsErrors(obj)
      .pipe(map((res) => {
        this.scrumBotService.reports = res.body.data.data;
        if (res.body.statusCode == '206') {
          this.router.navigate([workspace, 'scrum-bot', 'report', 1]);
          return false;
        } else {
          return true;
        }
      }));
  }
}
