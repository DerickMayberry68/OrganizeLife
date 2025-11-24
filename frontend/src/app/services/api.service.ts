import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { from, switchMap } from "rxjs";
import { AuthService } from "./auth.service";

// api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  get<T>(url: string) {
    return from(this.authService.getToken()).pipe(
      switchMap((token: any) => 
        this.http.get<T>(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
      )
    );
  }
}