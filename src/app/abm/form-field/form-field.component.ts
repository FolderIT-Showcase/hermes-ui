import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.css']
})
export class FormFieldComponent {
  @Input() field;
  @Input() element;
  @Input() form;
  @Input() submitted;
  @Input() data;
}
