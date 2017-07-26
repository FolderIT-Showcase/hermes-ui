import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'unique',
  pure: false
})

export class UniquePipe implements PipeTransform {
  transform(value: any, args?: any): any {

    const uniqueArray = Array.from(new Set(value));

    return uniqueArray;
  }
}
