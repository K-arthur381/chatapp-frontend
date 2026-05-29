import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Message } from '../../../../core/models/message.model';

@Component({
  selector: 'app-message-bubble',
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.css']
})
export class MessageBubbleComponent {
  @Input() message!: Message;
  @Input() isOwn = false;
  @Output() reaction = new EventEmitter<string>();
  @Output() reply = new EventEmitter<void>();
@Output() edit = new EventEmitter<Message>();
  @Output() delete = new EventEmitter<string>();

  showReactionPicker = false;
  showActions = false;

  onReaction(reaction: string) {
    this.reaction.emit(reaction);
    this.showReactionPicker = false;
  }

  onReply() {
    this.reply.emit();
  }

   onEdit() { this.edit.emit(this.message); }
  onDelete() { this.delete.emit(this.message.messageId); }

  toggleReactionPicker() {
    this.showReactionPicker = !this.showReactionPicker;
  }

  openImage(url: string): void {
    window.open(url, '_blank');
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}