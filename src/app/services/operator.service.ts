import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Operator {
  id: number;
  name: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root'
})
export class OperatorService {
  private apiUrl = 'https://localhost:7139/api/Operator';

  constructor(private http: HttpClient) { }

  getOperators(): Observable<Operator[]> {
    return this.http.get<Operator[]>(this.apiUrl);
  }
}
