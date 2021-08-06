import {ChangeDetectionStrategy, Component, EventEmitter, HostListener, OnInit, Output, Input, ElementRef} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('popup-open', [
      transition('void => *', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('200ms', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
      transition('* => void', [
        animate('200ms', style({ transform: 'scale(0)', opacity: 0 })),
      ])
    ])
  ]
})
export class MessageModalComponent implements OnInit {

  @Output() closeMessageModal: EventEmitter<boolean> = new EventEmitter();
  @Input() width;
  @Input() height;
  @Input() marginTop;
  @Input() bgColor;
  @Input() padding;
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeMessageModal.emit(true);
    }
  }
  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.elementRef.nativeElement.style.setProperty('--modal-width', this.width);
  }

}
