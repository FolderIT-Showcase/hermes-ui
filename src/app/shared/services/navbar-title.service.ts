import {EventEmitter, Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {isNullOrUndefined} from 'util';

@Injectable()
export class NavbarTitleService {
  public title$: EventEmitter<String>;
  private title: String;

  constructor() {
    this.title$ = new EventEmitter();
  }

  setTitle(title: String) {
    this.title = title;
    this.title$.emit(this.title);
  }

  getTitle() {
    if (isNullOrUndefined(this.title)) {
      this.title = '';
    }
    return this.title;
  }
}
