import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from './components/avatar/avatar.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';

@NgModule({
  declarations: [AvatarComponent, LoadingSpinnerComponent, EmptyStateComponent],
  imports: [CommonModule],
  exports: [AvatarComponent, LoadingSpinnerComponent, EmptyStateComponent]
})
export class SharedModule { }