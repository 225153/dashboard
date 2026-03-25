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
  displayedColumns: string[] = ['time', 'temperature', 'bpm', 'gaz', 'status'];

  // Computed signals
  latestReading = computed(() => {
    const data = this.sensorData();
    return data.length > 0 ? data[0] : null;
  });

  latestTemperature = computed(() => {
    const latest = this.latestReading();
    return latest ? latest.tmp : '--';
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

  trackById(index: number, item: any): number {
    return item.client_id;
  }
}
