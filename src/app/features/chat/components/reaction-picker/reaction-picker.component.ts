// reaction-picker.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

@Component({
  selector: 'app-reaction-picker',
  templateUrl: './reaction-picker.component.html',
  styleUrls: ['./reaction-picker.component.css']
})
export class ReactionPickerComponent {
  @Input() messageId!: string;
  @Input() currentReaction?: string;
  @Output() select = new EventEmitter<string>();
  reactions = REACTIONS;

  selectReaction(reaction: string) {
    this.select.emit(reaction);
  }
}