import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatRippleModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'],
  animations: [
    trigger('staggeredCards', [
      transition(':enter', [
        query('.widget-card', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('0.6s cubic-bezier(0.25, 1, 0.5, 1)', style({ opacity: 1, transform: 'none' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('listAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'none', backgroundColor: 'transparent' }))
      ])
    ]),
    trigger('pulseValue', [
      transition('* => *', [
        animate('0.3s ease-in', style({ transform: 'scale(1.05)' })),
        animate('0.3s ease-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class DashboardHomeComponent {
  private supabaseService = inject(SupabaseService);

  sensorData = this.supabaseService.sensorData;
  displayedColumns: string[] = ['client_id', 'time', 'temperature', 'bpm', 'gaz', 'status'];

  // Computed signals
  latestReading = computed(() => {
    const data = this.sensorData();
    return data.length > 0 ? data[0] : null;
  });

  latestTemperature = computed(() => {
    const latest = this.latestReading();
    return latest ? latest.tmp : '--';
  });

  latestBpm = computed(() => {
    const latest = this.latestReading();
    return latest ? latest.bpm : '--';
  });

  latestGaz = computed(() => {
    const latest = this.latestReading();
    return latest ? latest.gaz_level : '--';
  });

  latestClientId = computed(() => {
    const latest = this.latestReading();
    return latest ? latest.client_id : '--';
  });

  latestStatus = computed(() => {
    const latest = this.latestReading();
    return latest ? latest.ai_status : 'Unknown';
  });

  isNumber(value: string | number): boolean {
    return typeof value === 'number';
  }

  asNumber(value: string | number): number {
    return value as number;
  }

  formatDate(timestamp: string | null | undefined): Date | string | null {
    if (!timestamp) return null;
    
    try {
      // Check if the timestamp is just a time string (e.g., "20:04:18")
      if (/^\d{2}:\d{2}:\d{2}$/.test(timestamp)) {
        const today = new Date().toISOString().split('T')[0];
        return new Date(`${today}T${timestamp}Z`);
      }

      // Replace any space with 'T' to ensure standard ISO 8601 format
      let safeTimestamp = timestamp.replace(' ', 'T');
      
      // Ensure the timestamp has the 'Z' indicating UTC to avoid parsing errors
      if (!safeTimestamp.endsWith('Z') && !/\+[0-9]{2}:[0-9]{2}$/.test(safeTimestamp)) {
        safeTimestamp += 'Z';
      }
      
      const parsedDate = new Date(safeTimestamp);
      return isNaN(parsedDate.getTime()) ? timestamp : parsedDate;
    } catch {
      return timestamp;
    }
  }

  trackById(index: number, item: any): number {
    return item.client_id;
  }
}
