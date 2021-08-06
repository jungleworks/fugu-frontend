import { Subscription } from 'rxjs';
import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';

import { CommonService } from '../../services/common.service';
import { ChatService } from '../chat/chat.service';
import { MessageType, MessageExtension } from '../../enums/app.enums';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-gallery-carousel',
  templateUrl: './gallery-carousel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./gallery-carousel.component.scss']
})
export class GalleryCarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  currentMuid;
  isAllMediaFetched;
  rotateArray = ['rotate(0deg)', 'rotate(90deg)', 'rotate(180deg)', 'rotate(270deg)'];
  currentRotateIndex = 0;
  root = document.querySelector(':root');
  imagesSubscription: Subscription;
  public MessageTypeEnum = MessageType;
  public MessageExtensionEnum = MessageExtension;

  @ViewChild('thumbnailContainer', { static: true }) thumbnailContainer: ElementRef;
  @Input() parentData;
  @Output() closeCarousel = new EventEmitter<boolean>();
  videoRefVar;
  @ViewChild('videoPlayer') set videoPlayerRef(content: ElementRef) {
    if (content) {
      this.videoRefVar = content;
      content.nativeElement.focus();
    }
  }
  constructor(public commonService: CommonService, private chatService: ChatService, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.currentMuid = this.parentData.currentMuid;
    this.root['style'].setProperty('--rotate', this.rotateArray[this.currentRotateIndex]);
  }
  ngAfterViewInit() {
    const el = document.getElementById('car' + this.currentMuid);
    if (el) {
      el.scrollIntoView({inline: 'center'});
    }
  }
  ngOnDestroy() {
    this.parentData = {};

  }

  onCloseClick() {
    this.closeCarousel.emit(false);
  }

  onNext() {
    this.currentRotateIndex = 0;
    const activeTab = document.getElementById('carousel-footer').querySelector('.active');
    const parentChildren = Array.from(document.getElementById('carousel-footer').children);
    const index = parentChildren.indexOf(activeTab);
    this.root['style'].setProperty('--rotate', this.rotateArray[this.currentRotateIndex]);
    if (!this.isAllMediaFetched &&
      index + 5 === parentChildren.length && !this.imagesSubscription) {
      this.hitForNextImages();
    }
    if (activeTab.nextElementSibling) {
      this.currentMuid = activeTab.nextElementSibling.id.slice(3);
      document.getElementById('car' + this.currentMuid).scrollIntoView({inline: 'center'});
      this.reloadVideo();
      this.cdRef.detectChanges();
    }
  }

  onPrev() {
    this.currentRotateIndex = 0;
    const activeTab = document.getElementById('carousel-footer').querySelector('.active');
    this.root['style'].setProperty('--rotate', this.rotateArray[this.currentRotateIndex]);
    if (activeTab.previousElementSibling) {
      this.currentMuid = activeTab.previousElementSibling.id.slice(3);
      document.getElementById('car' + this.currentMuid).scrollIntoView({inline: 'center'});
      this.reloadVideo();
      this.cdRef.detectChanges();
    }
  }
  onImageClick(muid) {
    this.currentMuid = muid;
    this.currentRotateIndex = 0;
    this.root['style'].setProperty('--rotate', this.rotateArray[this.currentRotateIndex]);
    const activeTab = document.getElementById('carousel-footer').querySelector('.active');
    const parentChildren = Array.from(document.getElementById('carousel-footer').children);
    const index = parentChildren.indexOf(activeTab);
    document.getElementById('car' + this.currentMuid).scrollIntoView({block: 'center'});
    this.reloadVideo();
    if (!this.isAllMediaFetched &&
      index + 5 == parentChildren.length && !this.imagesSubscription) {
      this.hitForNextImages();
    }
  }
  hitForNextImages() {
    if (this.imagesSubscription) {
      this.imagesSubscription.unsubscribe();
    }
    const obj = {
      channel_id: this.parentData.channelId,
      en_user_id: this.commonService.userDetails.en_user_id,
      get_data_type: 'ATTACHMENTS',
      page_start: Object.keys(this.commonService.channelMedia).length + 1,
      page_end: Object.keys(this.commonService.channelMedia).length + 21
    };
    this.imagesSubscription = this.chatService.getMembers(obj)
      .pipe(debounceTime(100))
      .subscribe(response => {
        const groupMediaResponse = response.data.chat_media;
        if (groupMediaResponse.length) {
          groupMediaResponse.map(item => {
            this.commonService.channelMedia[item.muid] = {
              message : item.message,
              date_time: item.created_at,
              documentType: item.document_type || this.commonService.checkMimeType(item.message_type == this.MessageTypeEnum.Media_Message
                ? item.message.image_url : item.message.url),
              messageType: item.message_type,
              muid: item.muid
            };
          });
          this.commonService.channelMedia = {...this.commonService.channelMedia};
          this.cdRef.detectChanges();
        } else {
          this.isAllMediaFetched = true;
        }
      });
  }
  setImageThumbURL(media) {
    if (media['messageType'] == this.MessageTypeEnum.Media_Message || media['messageType'] == this.MessageTypeEnum.Video_Message) {
      return media.message.thumbnail_url;
    } else if (media['messageType'] == this.MessageTypeEnum.File_Message) {
      return this.checkFileType(media);
    }
  }
  onScrollThumbnail() {
    if (!this.isAllMediaFetched && this.thumbnailContainer.nativeElement.scrollLeft +
      this.thumbnailContainer.nativeElement.offsetWidth == this.thumbnailContainer.nativeElement.scrollWidth) {
      this.hitForNextImages();
    }
  }
  checkFileType(media) {
    if (media['messageExtension'] == 'audio') {
      return '../../../assets/img/audio.svg';
    } else {
      return '../../../assets/img/documents.svg';
    }
  }
  rotateBy90(direction) {
    if (direction == 'left') {
      if (this.currentRotateIndex == 0) {
        this.currentRotateIndex = this.rotateArray.length - 1;
      } else {
        this.currentRotateIndex--;
      }
    } else if (direction == 'right') {
      if (this.currentRotateIndex == this.rotateArray.length - 1) {
        this.currentRotateIndex = 0;
      } else {
        this.currentRotateIndex++;
      }
    }
    this.root['style'].setProperty('--rotate', this.rotateArray[ this.currentRotateIndex]);
  }

  reloadVideo() {
    if (this.videoRefVar) {
      this.videoRefVar.nativeElement.load();
    }
  }
}
