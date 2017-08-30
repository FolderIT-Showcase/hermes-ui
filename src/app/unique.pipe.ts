import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unique',
  pure: false
})

export class UniquePipe implements PipeTransform {
  transform(value: any, args?: any): any {

    return Array.from(new Set(value));
  }
}
