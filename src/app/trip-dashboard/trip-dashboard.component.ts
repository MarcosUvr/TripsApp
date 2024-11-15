import { Component, OnInit } from '@angular/core';
import { TripService, Trip } from '../services/trip.service';
import { OperatorService, Operator } from '../services/operator.service';
import { LocationService, Location } from '../services/location.service';
import { StatusService, Status } from '../services/status.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-trip-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule
  ],
  templateUrl: './trip-dashboard.component.html',
  styleUrls: ['./trip-dashboard.component.css']
})
export class TripDashboardComponent implements OnInit {
  displayedColumns: string[] = ['origin', 'destination', 'start', 'end', 'operator', 'status', 'actions'];
  dataSource: any[] = [];

  tripForm: FormGroup;
  showForm: boolean = false;
  isEdit: boolean = false;
  currentTripId: number | null = null;

  operators: Operator[] = [];
  locations: Location[] = [];
  statuses: Status[] = [];

  constructor(
    private tripService: TripService,
    private operatorService: OperatorService,
    private locationService: LocationService,
    private statusService: StatusService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.tripForm = this.fb.group({
      idOrigin: ['', Validators.required],
      idDestination: ['', Validators.required],
      dateRange: this.fb.group({
        start: ['', Validators.required],
        end: ['', Validators.required]
      }),
      idOperator: ['', Validators.required],
      idStatus: ['']
    });
  }

  ngOnInit(): void {
    this.loadTrips();
    this.loadOperators();
    this.loadLocations();
    this.loadStatuses();
  }

  // Cargar todos los estados
  async loadStatuses() {
    this.statusService.getStatuses().subscribe({
      next: (data) => {
        this.statuses = data;
      },
      error: (err) => {
        console.error('Error al cargar estados', err);
        this.snackBar.open('Error al cargar estados', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // Cargar todos los viajes
  async loadTrips() {
    this.tripService.getTrips().subscribe({
      next: (data) => {
        this.dataSource = data;
      },
      error: (err) => {
        console.error('Error al cargar viajes', err);
        this.snackBar.open('Error al cargar viajes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // Cargar operadores 
  async loadOperators() {
    this.operatorService.getOperators().subscribe({
      next: (data) => {
        this.operators = data;
      },
      error: (err) => {
        console.error('Error al cargar operadores', err);
        this.snackBar.open('Error al cargar operadores', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // Cargar ubicaciones 
  async loadLocations() {
    this.locationService.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
      },
      error: (err) => {
        console.error('Error al cargar ubicaciones', err);
        this.snackBar.open('Error al cargar ubicaciones', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openForm(trip?: Trip) {
    if (trip) {
      // Modo edición
      this.isEdit = true;
      this.currentTripId = trip.id || null;
  
      this.tripForm.get('idStatus')?.setValidators(Validators.required);
      this.tripForm.get('idStatus')?.updateValueAndValidity();
  
      this.tripForm.patchValue({
        idOrigin: trip.idOrigin,
        idDestination: trip.idDestination,
        idOperator: trip.idOperator,
        idStatus: trip.idStatus,
        dateRange: {
          start: trip.scheduledStartDateTime ? new Date(trip.scheduledStartDateTime) : null,
          end: trip.scheduledEndDateTime ? new Date(trip.scheduledEndDateTime) : null
        }
      });
    } else {
      // Modo creación
      this.isEdit = false;
      this.currentTripId = null;
      this.tripForm.reset();
    }
    this.showForm = true;
  }
  
  closeForm() {
    this.showForm = false;
    this.tripForm.reset();
    this.isEdit = false;
    this.currentTripId = null;
  }

  onSubmit() {
    if (this.tripForm.invalid) {
      return;
    }
  
    const formValue = this.tripForm.value;
    const scheduledStart = formValue.dateRange.start;
    const scheduledEnd = formValue.dateRange.end;
  
    if (new Date(scheduledEnd) <= new Date(scheduledStart)) {
      this.snackBar.open('The end date must be after the start date.', 'Close', {
        duration: 3000,
      });
      return;
    }
  
    const tripData = {
      ...formValue,
      scheduledStartDateTime: scheduledStart,
      scheduledEndDateTime: scheduledEnd
    };
  
    if (this.isEdit && this.currentTripId !== null) {
      this.tripService.updateTrip(this.currentTripId, tripData).subscribe({
        next: () => {
          this.snackBar.open('Trip updated successfully.', 'Close', { duration: 3000 });
          this.loadTrips();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error updating trip', err);
          this.snackBar.open('Error updating trip.', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.tripService.createTrip(tripData).subscribe({
        next: () => {
          this.snackBar.open('Trip created successfully.', 'Close', { duration: 3000 });
          this.loadTrips();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error creating trip', err);
          this.snackBar.open('Error creating trip.', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  deleteTrip(id: number) {
    if (confirm('¿Estás seguro de eliminar este viaje?')) {
      this.tripService.deleteTrip(id).subscribe({
        next: () => {
          this.snackBar.open('Viaje eliminado exitosamente.', 'Cerrar', { duration: 3000 });
          this.loadTrips();
        },
        error: (err) => {
          console.error('Error al eliminar viaje', err);
          this.snackBar.open('Error al eliminar viaje.', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
