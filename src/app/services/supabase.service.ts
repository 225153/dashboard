import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface SensorData {
  id: number;
  temperature: number;
  status: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private channel!: RealtimeChannel;

  // Signals
  public sensorData = signal<SensorData[]>([]);
  public isConnected = signal<boolean>(false);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.fetchInitialData();
    this.subscribeToSensors();
  }

  private async fetchInitialData() {
    try {
      console.log('Attempting to fetch initial data from Supabase...');
      const { data, error } = await this.supabase
        .from('sensor_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Supabase Error on fetch:', error.message);
        throw error;
      }
      if (data) {
        console.log('Successfully fetched', data.length, 'records from Supabase.');
        this.sensorData.set(data);
      }
    } catch (err) {
      console.error('Connection/Fetch Error:', err);
    }
  }

  public subscribeToSensors() {
    this.isConnected.set(true);
    
    this.channel = this.supabase
      .channel('public:sensor_data')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_data' },
        (payload) => {
          const newRecord = payload.new as SensorData;
          this.sensorData.update((data) => {
            const updated = [newRecord, ...data];
            // Keep only latest 10
            return updated.slice(0, 10);
          });
        }
      )
      .subscribe((status) => {
        console.log('Supabase Channel Status:', status); // <-- Added log here
        if (status === 'SUBSCRIBED') {
          this.isConnected.set(true);
        } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnected.set(false);
          
          if (this.channel) {
            const oldChannel = this.channel;
            // 1. Clear the reference first to prevent an infinite loop when removeChannel triggers a CLOSED event
            this.channel = null as any; 
            
            // 2. Remove the broken channel
            this.supabase.removeChannel(oldChannel);

            // 3. Try to reconnect if dropped
            setTimeout(() => {
              console.log('Attempting to reconnect Supabase channel...');
              this.subscribeToSensors();
            }, 5000);
          }
        }
      });
  }

  public unsubscribe() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.isConnected.set(false);
    }
  }
}
