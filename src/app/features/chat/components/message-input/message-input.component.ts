import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent {
  @Output() send = new EventEmitter<string>();
  @Output() typing = new EventEmitter<boolean>();
  @Output() filesSelected = new EventEmitter<File[]>();
  
  @ViewChild('imageInput') imageInput!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  message = '';
  showEmojiPicker = false;
  isUploading = false;
  uploadProgress = 0;
  uploadingCount = 0;
  private typingTimeout: any;

  emojiGroups = [
    {
      name: 'Smileys',
      emojis: ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥴','😵','🤯','🥳','🥺','😢','😭','😤','😠','😡','🤬','💀','☠️']
    },
    {
      name: 'Gestures',
      emojis: ['👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👋','🤚','🖐️','✋','🖖','👏','🙌','🤝','🙏','💪','🦵','🦶','👂','👃','🧠','🦷','🦴','👀','👁️','👅','👄']
    },
    {
      name: 'Hearts',
      emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟']
    },
    {
      name: 'Objects',
      emojis: ['🔥','⭐','🌟','✨','💫','🎉','🎊','🎈','🎂','🍕','🍔','🍟','🌮','🍩','🍪','☕','🍺','🍷','🎵','🎶','📱','💻','⌚','📷','🔑','💡','💰','💎','🎯','🏆','🎮','🚀','✈️','🚗','🏠','🌍']
    }
  ];

  onInputChange(): void {
    if (this.message.trim()) {
      this.typing.emit(true);
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => this.typing.emit(false), 1000);
    } else {
      this.typing.emit(false);
    }
  }

  onSend(): void {
    if (this.message.trim() && !this.isUploading) {
      this.send.emit(this.message.trim());
      this.message = '';
      this.typing.emit(false);
      this.showEmojiPicker = false;
    }
  }

  toggleEmojiPicker(): void { this.showEmojiPicker = !this.showEmojiPicker; }

  addEmoji(emoji: string): void {
    this.message += emoji;
    this.messageInput.nativeElement.focus();
  }

  triggerImageUpload(): void {
    if (this.isUploading) return;
    this.imageInput.nativeElement.click();
  }

  triggerFileUpload(): void {
    if (this.isUploading) return;
    this.fileInput.nativeElement.click();
  }

  onImagesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      const fileArray = Array.from(files) as File[];
      this.emitFiles(fileArray);
    }
    this.imageInput.nativeElement.value = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.emitFiles([file]);
    }
    this.fileInput.nativeElement.value = '';
  }

  // Emit files to parent for real upload
  private emitFiles(files: File[]): void {
    this.filesSelected.emit(files);
  }

  // Called from parent to show upload progress
  showUploadProgress(count: number): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadingCount = count;
  }

  // Called from parent to update progress
  updateProgress(percent: number): void {
    if(percent == 100){
      percent-- ;
    }
    this.uploadProgress = percent;
  }

  // Called from parent when upload completes
  hideUploadProgress(): void {
    this.isUploading = false;
    this.uploadProgress = 0;
    this.uploadingCount = 0;
  }
}