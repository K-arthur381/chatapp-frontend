import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatMainComponent } from './chat-main/chat-main.component';
import { AuthGuard } from '../../../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: ChatMainComponent, canActivate: [AuthGuard] },
  { path: ':conversationId', component: ChatMainComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }