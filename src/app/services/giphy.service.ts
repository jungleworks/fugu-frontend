import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {HttpClient } from '@angular/common/http';
import {map} from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable()

export class GiphyService {
  constructor(private http: HttpClient) { }
  gifUrl = 'https://api.giphy.com/v1/gifs/';
  stickerUrl = 'https://api.giphy.com/v1/stickers/';
  count = 20;
  trendCount = 50;

  searchGIF(param, offset) {
    const getParams = 'search?q=' + encodeURIComponent(param) + '&limit=' + this.count + '&offset=' + encodeURIComponent(offset) + '&rating=pg-13';
    return this.getGIF(getParams);
  }
  searchStickers(param, offset) {
    const getParams = 'search?q=' + encodeURIComponent(param) + '&limit=' + this.count + '&offset=' + encodeURIComponent(offset);
    return this.getStickers(getParams);
  }
  trendingGIF() {
    const getParams = 'trending?limit=' + this.trendCount + '&rating=pg-13';
    return this.getGIF(getParams);
  }
  trendingStickers() {
    const getParams = 'trending?limit=' + this.trendCount;
    return this.getStickers(getParams);
  }

  getGIF(data): Observable<any> {
    const url = this.gifUrl + data + '&api_key=' + environment.GIF_API_KEY;
    return this.http.get(url).pipe(map(response => response));
  }
  getStickers(data): Observable<any> {
    const url = this.stickerUrl + data + '&api_key=' + environment.GIF_API_KEY;
    return this.http.get(url).pipe(map(response => response));
  }
}
