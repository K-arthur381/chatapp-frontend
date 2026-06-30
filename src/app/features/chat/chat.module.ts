import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ChatRoutingModule } from './components/chat-routing.module';

import { ChatMainComponent } from './components/chat-main/chat-main.component';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { MessageBubbleComponent } from './components/message-bubble/message-bubble.component';
import { MessageInputComponent } from './components/message-input/message-input.component';
import { TypingIndicatorComponent } from './components/typing-indicator/typing-indicator.component';
import { ReactionPickerComponent } from './components/reaction-picker/reaction-picker.component';
import { NewChatDialogComponent } from './new-chat-dialog/new-chat-dialog.component';
import { ImageGalleryComponent } from './image-gallery/image-gallery.component';
import { NotificationPanelComponent } from '../notifications/notification-panel/notification-panel.component';

@NgModule({
  declarations: [
    ChatMainComponent,
    ChatListComponent,
    ChatWindowComponent,
    MessageBubbleComponent,
    MessageInputComponent,
    TypingIndicatorComponent,
    ReactionPickerComponent,
    NewChatDialogComponent,
    ImageGalleryComponent,
    NotificationPanelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ChatRoutingModule
  ]
})
export class ChatModule { }