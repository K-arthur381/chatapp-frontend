import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Attachment } from '../../../core/models/message.model';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.css']
})
export class ImageGalleryComponent {
  @Input() attachments: Attachment[] = [];
  @Input() isOwn = false;
  @Output() imageClick = new EventEmitter<{ index: number; url: string }>();

  currentIndex = 0;
  showViewer = false;

  get gridClass(): string {
    const count = this.attachments.length;
     console.log('Count of Attachment',this.attachments)
   
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2';
    if (count === 4) return 'grid-cols-2';
    return 'grid-cols-3';
  }

  get displayImages(): Attachment[] {
    return this.attachments.slice(0, 6); // Show max 5 in grid
 // return this.attachments;
  }

  get remainingCount(): number {
    return Math.max(0, this.attachments.length - 5);
  }

  openViewer(index: number): void {
    this.currentIndex = index;
    this.showViewer = true;
  }

  closeViewer(): void {
    this.showViewer = false;
  }

  nextImage(): void {
    if (this.currentIndex < this.attachments.length - 1) {
      this.currentIndex++;
    }
  }

  prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  get currentImage(): Attachment {
    return this.attachments[this.currentIndex];
  }
}