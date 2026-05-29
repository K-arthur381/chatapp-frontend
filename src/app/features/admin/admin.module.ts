import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AnnouncementComponent } from './announcement/announcement.component';

@NgModule({
  declarations: [DashboardComponent, UserManagementComponent, AnnouncementComponent],
  imports: [CommonModule, AdminRoutingModule]
})
export class AdminModule { }