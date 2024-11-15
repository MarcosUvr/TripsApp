import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Trip {
  id?: number;
  idOrigin: number;
  idDestination: number;
  idStatus: number;
  idOperator: number;
  scheduledStartDateTime: string; // ISO string
  scheduledEndDateTime: string;   // ISO string
}

export interface TripDetails {
  origin: string;
  destination: string;
  operator: string;
  status: string;
  scheduledStartDateTime: string;
  scheduledEndDateTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private apiUrl = 'https://localhost:7139/api/Trips';

  constructor(private http: HttpClient) { }

  getTrips(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTrip(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTrip(trip: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, trip);
  }

  updateTrip(id: number, trip: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, trip);
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
