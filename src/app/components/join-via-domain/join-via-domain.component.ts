import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import {ActivatedRoute} from '@angular/router';
import {JoinService} from '../join/join.service';
import {MessageService} from '../../services/message.service';
import { CommonApiService } from '../../services/common-api.service';

@Component({
  selector: 'app-join-via-domain',
  templateUrl: './join-via-domain.component.html',
  styleUrls: ['./join-via-domain.component.scss']
})
export class JoinViaDomainComponent implements OnInit {

  spaceForm;
  workspace;
  constructor(private formBuilder: FormBuilder, public commonService: CommonService, private service: JoinService,
              private route: ActivatedRoute,public commonApiService: CommonApiService , private messageService: MessageService) { }

  ngOnInit() {
    this.spaceForm = this.formBuilder.group({
      'space': ['']
    });
    this.route.queryParams
      .subscribe(params => {
        if (params['space']) {
          this.workspace = params['space'];
        }
      });
  }
  spaceSubmit() {
    const obj = {
      workspace: this.workspace,
      email: this.spaceForm.value.space + '@' + this.workspace.trim(),
      invitation_type: 'OPEN_INVITATION'
    };
    this.service.invitePublicUser(obj)
      .subscribe((response) => {
        this.spaceForm.reset();
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 4000
        });
      });

  }
}
