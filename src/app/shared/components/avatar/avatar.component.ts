import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css']
})
export class AvatarComponent {
  @Input() url?: string;
  @Input() name?: string | null;
  @Input() online?: boolean | null;

  get initials(): string {
    return this.name ? this.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  }
}