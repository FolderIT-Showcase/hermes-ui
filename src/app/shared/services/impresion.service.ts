import { Injectable } from '@angular/core';
import {AlertService} from './alert.service';

@Injectable()
export class ImpresionService {

  constructor(private alertService: AlertService) { }

  imprimir(pdf: Blob): void {
    const fileURL = URL.createObjectURL(pdf);
    try {
      const win = window.open(fileURL, '_blank');
      win.print();
    } catch (e) {
      this.alertService.error('Debe permitir las ventanas emergentes para poder imprimir este documento');
    }
  }

}
