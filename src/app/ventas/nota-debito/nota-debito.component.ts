import { Component, OnInit } from '@angular/core';
import {TitleService} from '../../shared/services/title.service';

@Component({
  selector: 'app-nota-debito',
  templateUrl: './nota-debito.component.html',
  styleUrls: ['./nota-debito.component.css']
})
export class NotaDebitoComponent implements OnInit {

  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('Nota de Débito');
  }

}
