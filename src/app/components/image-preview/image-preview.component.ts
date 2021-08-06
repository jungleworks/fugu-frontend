import { ContenteditableInputComponent } from './../contenteditable-input/contenteditable-input.component';
import { Component, OnInit, EventEmitter, Output, Input, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, QueryList, AfterViewInit, ViewChildren } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { IContentEditableData } from '../../interfaces/app.interfaces';
import Compressor from 'compressorjs';
import { LayoutService } from '../layout/layout.service';
import { CommonService } from '../../services/common.service';

interface ImageObject {
  is_image: boolean;
  file: any;
  src?: string;
  file_name: string;
  thumbnail_src?: string;
}
@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss']
})

export class ImagePreviewComponent implements OnInit, AfterViewInit {

  display_object = <ImageObject>{};
  show_loader = false;
  urls = [];
  files_array = [];
  showTagList = false;
  currentIndex = 0;
  url_arr = [];
  drawOnImg: boolean = false;
  contentEditableData: IContentEditableData;
  fileType;
  @Input() set contentData(data: IContentEditableData) {
    if (data) {
      data.image_preview = true;
      this.contentEditableData = data;
    }
  }
  showCropIcon :boolean = false;
  showCrop :boolean = false;
  cropObj :any = {};
  drawImgObj :any = {};

  @Input() files;
  @Input() activeChannelId;
  @Output()
  closeImagePreview: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  mediaMessageData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChildren(ContenteditableInputComponent) contentEditableArray: QueryList<ContenteditableInputComponent>;

  constructor(private changeDetectorRef: ChangeDetectorRef, private loader: LoaderService, private layoutService: LayoutService,
    private commonService: CommonService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.show_loader = true;
    setTimeout(() => {
      this.loadImagesLocally(this.files);
    }, 400);
  }
  async loadImagesLocally(file) {
    let tiny_file;
    this.urls = [];
    for (let i = 0; i < file.length; i++) {
      this.fileType = file[i].type.split('/')[1];
      if (file[i].type.split('/')[0] == 'image' && !['vnd.adobe.photoshop', 'psd', 'tiff', 'svg', 'svg+xml'].includes(file[i].type.split('/')[1])) {
        let isImage = true;
        try {
          tiny_file = await this.layoutService.compressImages(file[i]);
        } catch {
          tiny_file = file[i];
          isImage = false;
        }
        let file_url = URL.createObjectURL(tiny_file);
        this.urls.push({
          is_image: isImage,
          file: tiny_file,
          src: file_url,
          file_name: file[i].name,
          thumbnail_src: file_url
        });
        this.url_arr.push(this.urls[i].src);
        this.layoutService.revokeImagesArray = this.url_arr;
        if (i == 0) {
          this.display_object = this.urls[0];
        }
        /* specs for crooper module */
        this.cropObj.file = file[0];
        this.cropObj.isPreview = true;
        this.cropObj.event = file_url;
        this.cropObj.width = '45%';
        this.cropObj.isAspectRatio = false;
        this.cropObj.resizeToWidth = 400;
        this.cropObj.ratio = 16 / 9;

  
        /** specs for drawing component */
        this.drawImgObj = {...this.display_object};
        let imagePrev = new Image();
        imagePrev.onload = () => {
          this.drawImgObj.width = imagePrev.width;
          this.drawImgObj.height = imagePrev.height;
        };
        imagePrev.src = this.display_object.src;

        this.changeDetectorRef.detectChanges();
      } else {
        let thumb_src;
        let file_url = URL.createObjectURL(file[i]);
        if (file[i].type.split('/')[0] == 'video') {
          thumb_src = await this.getThumbnailFromVideo(file_url);
        }
        this.urls.push({
          is_image: false,
          file: file[i],
          src: file_url,
          file_name: file[i].name,
          thumbnail_src: thumb_src
        });
        if (i == 0) {
          this.display_object = this.urls[0];
        }
        this.changeDetectorRef.detectChanges();
      }
    }
    if (this.urls.length == 1) {
      this.showCropIcon = true;
    }
    this.show_loader = false;
    this.changeDetectorRef.detectChanges();
  }

  onSendClick() {
    const final_files_array = [];
    const viewRefArray = this.contentEditableArray.toArray();
    for (let i = 0; i < this.urls.length; i++) {
      final_files_array.push({
        file: this.urls[i].file,
        data: viewRefArray[i].createMessageToSend(),
        src: this.urls[i].src,
        thumbnail_src: this.urls[i].thumbnail_src
      });
    }
    this.mediaMessageData.emit(final_files_array);
    this.closeImagePreview.emit();
  }
  onNext() {
    if (this.currentIndex < this.urls.length - 1) {
      this.currentIndex += 1;
      document.getElementById('thumbnail-' + this.currentIndex).click();
      document.getElementById('thumbnail-' + this.currentIndex).scrollIntoView({behavior: 'auto'});
    }
  }
  onPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      document.getElementById('thumbnail-' + this.currentIndex).click();
      document.getElementById('thumbnail-' + this.currentIndex).scrollIntoView({behavior: 'auto'});
    }
  }
  async getThumbnailFromVideo(file_url) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.setAttribute('src', file_url);
      video.addEventListener('loadeddata', (e) => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            const src = 'assets/img/video.svg';
            resolve(src);
          }
        });
      });
      video.addEventListener('error', (e) => {
        const src = 'assets/img/video.svg';
        resolve(src);
      });
    });
  }

  closeImagePreviewPopup(event) {
    for (let i = 0; i < this.urls.length; i++) {
      URL.revokeObjectURL(this.urls[i].src);
    }
    this.closeImagePreview.emit(event);
  }

  saveCroppedImage(event) {
    this.display_object.src = event.src;
    this.display_object.file = event;
    this.urls[0] = this.display_object
     /** updating specs for drawing component with the new cropped image */
    this.drawImgObj = {...this.display_object};
    this.cropObj.file = event;

    this.showCrop = false;
  }
    showCropper() {
      this.showCrop = true;
    }

    closeCropPopupFunc() {
      this.showCrop = false;
      /** reset the file input so that cropping popup can be shown next time without refresh */
    }

  setEditedImage(src) {
    /* update cropped src with the new drawing edited src */
    this.display_object.src = src;
    this.cropObj.file = this.commonService.dataURLtoFile(src, this.display_object.file_name);
    this.urls[0].file = this.commonService.dataURLtoFile(src, this.display_object.file_name);
    this.urls[0].src = src;
  }
  
}

