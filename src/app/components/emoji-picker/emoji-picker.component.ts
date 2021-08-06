import { LocalStorageService } from './../../services/localStorage.service';
import {ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {EmojiPickerService} from './emoji-picker.service';

declare const twemoji: any;

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./emoji-picker.component.scss']
})
export class EmojiPickerComponent implements OnInit {
  @Output()
  emojiClick: EventEmitter<object> = new EventEmitter<object>();
  emojis;
  active_index = 0;
  frequently_used_array = [];
  constructor(private emojiService: EmojiPickerService, private localStorageService: LocalStorageService) {
    this.emojis = this.emojiService.emojis;
    /**
     * Set Frequently used emoji's from local storage
     */
    if (this.localStorageService.get('emoji_frequently_used/v1')) {
      this.frequently_used_array = <any>this.localStorageService.get('emoji_frequently_used/v1');
      this.emojis[0].emojis = this.frequently_used_array;
    } else {
       this.frequently_used_array = this.emojis[0].emojis;
    }
  }

  ngOnInit() {
    /**
     * Render first set of emoji's
     */
    this.renderEmoji(this.active_index);
  }
  /**
   * parse emoji from unicode and convert to image.
   * @type {{folder: string; ext: string}}
   */
  parseTwemoji(emoji) {
    const svgOptions = {
      folder: 'emojis',
      base: 'https://files.fugu.chat/',
      attributes: () => {
        return {
          'draggable': 'false'
        };
      },
      ext: '.svg'
    };
    return twemoji.parse(twemoji.convert.fromCodePoint(emoji), svgOptions);
  }

  /**
   * when emoji is clicked, emit event to parent, add to local for frequently used and maintain frequent length to 36
   * @param emoji
   */
  emojiClicked(emoji) {
    this.emojiClick.emit(emoji);
    if (this.frequently_used_array) {
      for (let i = 0; i < this.frequently_used_array.length; i++) {
        if (emoji.unicode == this.frequently_used_array[i].unicode) {
          return;
        }
      }
      if (this.frequently_used_array.length == 36) {
        this.frequently_used_array.pop();
      }
      this.frequently_used_array.unshift(emoji);
    }
    this.localStorageService.set('emoji_frequently_used/v1', this.frequently_used_array);
    this.emojis[0].emojis = this.frequently_used_array;
  }

  /**
   * parse and fetch and save image for emoji so that we don't have to hit twemoji again and again.
   * @param index
   */
  renderEmoji(index) {
    if (!this.emojis[index].emojis[0].image) {
      this.emojis[index].emojis.map((item) => {
        item.image = this.parseTwemoji(item.unicode);
      });
    }
  }
}
