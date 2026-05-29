import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  setToken(token: string): void { localStorage.setItem('access_token', token); }
  getToken(): string | null { return localStorage.getItem('access_token'); }
  removeToken(): void { localStorage.removeItem('access_token'); }

  setUser(user: any): void { localStorage.setItem('user', JSON.stringify(user)); }
  getUser(): any | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  removeUser(): void { localStorage.removeItem('user'); }
   // ✅ New: completely wipe all localStorage data
  clearAll(): void {
    localStorage.clear();
  }
}