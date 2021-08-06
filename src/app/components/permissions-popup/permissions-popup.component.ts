import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {animate, animateChild, query, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-permissions-popup',
  templateUrl: './permissions-popup.component.html',
  styleUrls: ['./permissions-popup.component.scss'],
  animations: [
    trigger('popup-open', [
      transition('void => *', [
        style({ transform: 'scale(0)' }),
        animate('200ms', style({ transform: 'scale(1)' })),
      ]),
      transition('* => void', [
        animate('200ms', style({ transform: 'scale(0)' })),
      ])
    ])
  ]
})
export class PermissionsPopupComponent implements OnInit {

  @Output() closePermissionPopup: EventEmitter<boolean> = new EventEmitter();
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closePermissionPopup.emit(true);
    }
  }
  constructor() { }

  ngOnInit() {
  }

}
