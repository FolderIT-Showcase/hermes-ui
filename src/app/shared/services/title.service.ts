import {EventEmitter, Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {isNullOrUndefined} from 'util';
import {Title} from '@angular/platform-browser';

@Injectable()
export class TitleService {
  public title$: EventEmitter<String>;
  private title: String;
  private pageBaseTitle = 'Hermes Web';

  constructor(private pageTitleService: Title) {
    this.title$ = new EventEmitter();
  }

  setTitle(title: String) {
    this.title = title;
    this.title$.emit(this.title);
    this.pageTitleService.setTitle(`${this.pageBaseTitle} - ${this.title}`);
  }

  getTitle() {
    if (isNullOrUndefined(this.title)) {
      this.title = '';
    }
    return this.title;
  }
}
