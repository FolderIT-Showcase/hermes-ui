import {Component, EventEmitter, Input, Output} from '@angular/core';

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
  @Output() change = new EventEmitter<any>();

  toggle(event: any) {
    this.element[this.field.name] = !this.element[this.field.name];
    event.target.value = this.element[this.field.name];
    this.change.emit(event);
  }

  onChange(event: any) {
    this.change.emit(event);
  }
}
