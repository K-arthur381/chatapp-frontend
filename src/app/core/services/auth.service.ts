import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router,
    
  ) {
    const cachedUser = this.storage.getUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(cachedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  register(user: { username: string; email: string; password: string; firstName: string; lastName: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, user).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  registerWithAvatar(formData: FormData): Observable<AuthResponse> {
  
  return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, formData).pipe(
    tap(res => this.handleAuth(res))
  );
}

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  logout(): void {
    this.storage.removeToken();
    this.storage.removeUser();
     this.storage.clearAll(); 
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null { return this.storage.getToken(); }
  isLoggedIn(): boolean { return !!this.getToken(); }
  getUser(): User | null { return this.currentUserSubject.getValue(); }

  private handleAuth(res: AuthResponse): void {
    this.storage.setToken(res.token);
    this.storage.setUser(res.user);
    this.currentUserSubject.next(res.user);
  }
}