import {
  Component, OnInit, Input, Output, ElementRef, ViewChild, ChangeDetectorRef,
  ChangeDetectionStrategy, EventEmitter, OnDestroy, HostListener
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { GiphyService } from '../../services/giphy.service';
import { debounceTime } from 'rxjs/operators';

interface GifsAndStickers {
  image_url;
  thumbnail_url;
  height;
  width;
}
const GIF_THUMBNAIL_TYPE = 'preview_webp';
const GIF_TYPE = 'downsized';
let trendingGIF: GifsAndStickers[];
let searchedGIF: GifsAndStickers[];
let gifTotalCount = 0, gifOffset = 0;
@Component({
  selector: 'app-gif',
  templateUrl: './gif.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./gif.component.scss']
})
export class GifComponent implements OnInit {
  searchCtrl;
  GIFToDisplay: GifsAndStickers[];
  @Output()
  gifClickEvent: EventEmitter<object> = new EventEmitter<object>();
  @Output()
  closeGifPopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('gifContainer', { static: true }) private gifContainer: ElementRef;
  @ViewChild('gifElement', { static: true }) private gifElement: ElementRef;
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeGifPopup.emit(true);
    }
  }
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    // Check if the click was outside the element
    if (targetElement && !this.gifElement.nativeElement.contains(targetElement) &&
       !event.target['classList'].contains('gif-btn')) {
      this.closeGifPopup.emit(true);
    }
  }
  constructor(private cdRef: ChangeDetectorRef, private gif: GiphyService) { }

  ngOnInit() {
    document.getElementById('sticker-scroll').addEventListener('scroll', () => {
      this.onGifScroll();
    });
    this.gif.trendingGIF().subscribe(data => {
      trendingGIF = this.makeGifOrStickerArray(data.data);
      this.GIFToDisplay = trendingGIF;
      gifOffset = data.pagination.offset;
      gifTotalCount = data.pagination.total_count;
      if (!this.cdRef['destroyed']) {
        this.cdRef.detectChanges();
      }
    });
    this.searchCtrl = new FormControl();
    this.searchCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        if (data) {
          this.gifContainer.nativeElement.scrollTop = 0;
          gifOffset = 0;
          gifTotalCount = 0;
          // Search GIFs
          this.gif.searchGIF(data, gifOffset).subscribe(response => {
            searchedGIF = this.makeGifOrStickerArray(response.data);
            this.GIFToDisplay = searchedGIF;
            gifOffset = response.pagination.offset;
            gifTotalCount = response.pagination.total_count;
            this.cdRef.detectChanges();
          });
        } else {
          searchedGIF = [];
          this.GIFToDisplay = trendingGIF;
          gifOffset = 0;
          gifTotalCount = 0;
          this.cdRef.detectChanges();
        }
      });
  }

  onGifScroll() {
    if ((this.gifContainer.nativeElement.scrollTop + this.gifContainer.nativeElement.clientHeight) /
      this.gifContainer.nativeElement.scrollHeight >= 1) {
      if (this.searchCtrl.value) {
        if (this.gif.count + gifOffset <= gifTotalCount) {
          gifOffset = gifOffset + this.gif.count;
          this.gif.searchGIF(this.searchCtrl.value, gifOffset).subscribe(response => {
            searchedGIF = [...searchedGIF, ...this.makeGifOrStickerArray(response.data)];
            this.GIFToDisplay = searchedGIF;
            gifOffset = response.pagination.offset;
            gifTotalCount = response.pagination.total_count;
            this.cdRef.detectChanges();
          });
        }
      }
    }
  }
  makeGifOrStickerArray(data): GifsAndStickers[] {
    const array = [];
    for (const item of data) {
      if (item.images[GIF_THUMBNAIL_TYPE]) {
        array.push({
          image_url: item.images[GIF_TYPE].url,
          thumbnail_url: item.images[GIF_THUMBNAIL_TYPE].url,
          width: parseInt(item.images[GIF_THUMBNAIL_TYPE].width),
          height: parseInt(item.images[GIF_THUMBNAIL_TYPE].height)
        });
      }
    }
    return array;
  }
  sendGif(obj) {
    this.gifClickEvent.emit(obj);
  }
}
