import { Component, OnInit , Input } from '@angular/core';

@Component({
  selector: 'app-unnamed-image',
  templateUrl: './unnamed-image.component.html',
  styleUrls: ['./unnamed-image.component.scss']
})
export class UnnamedImageComponent implements OnInit {
  @Input() members;
  @Input() dimensions;

  constructor() { }

  ngOnInit() {
  }

}
