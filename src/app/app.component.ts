import { Component, OnInit } from '@angular/core';
import { SignalRService } from './core/services/signalr.service';
import { AuthService } from './core/services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private signalR: SignalRService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Start SignalR when user navigates to chat (logged in)
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url.startsWith('/chat') && this.auth.isLoggedIn()) {
        this.signalR.startConnection();
      } else if (!this.auth.isLoggedIn()) {
        this.signalR.stopConnection();
      }
    });

    // Initial connection if already logged in
    if (this.auth.isLoggedIn()) {
      this.signalR.startConnection();
    }
  }
}