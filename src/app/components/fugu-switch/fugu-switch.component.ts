import { Component, OnInit, Input, Output, EventEmitter, forwardRef, Renderer2, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-fugu-switch',
  templateUrl: './fugu-switch.component.html',
  styleUrls: ['./fugu-switch.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FuguSwitchComponent),
      multi: true
    }
  ],
  host: {
    '(change)': '_onChange($event.target.value)',
    '(blur)': '_onTouched()'
  }
})
export class FuguSwitchComponent implements OnInit, ControlValueAccessor {

  @Input() active = false;   /*just to check whether it is checked*/
  @Input() activeClass = 'switch-active';
  @Input() disableToggle ;
  @Input() inActiveClass = 'switch-inactive';
  @Input('defaultComponentClass') default: string;
  @Output() switchToggleEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  _onChange: Function = () => { };
  _onTouched: Function = () => { };
  _fn;
  constructor(private _renderer: Renderer2, private _elementRef: ElementRef) { }

  ngOnInit() {
  }
  onChangeEvent(event) {
    this.switchToggleEvent.emit(event);
    this.active = event.target.checked;
  }
  writeValue(value: boolean) {
    this.active = value;
  }
  registerOnChange(fn: any) {
    this._fn = fn;
    this._onChange = () => {
      fn(this.active);
    };
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }
}
