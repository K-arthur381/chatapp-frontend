import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  constructor(private http: HttpClient) {}

  registerDevice(token: string, platform: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/devices/register`, {
      deviceToken: token,
      platform: platform
    });
  }

  unregisterDevice(token: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/devices/unregister`, {
      body: { deviceToken: token }
    });
  }
}