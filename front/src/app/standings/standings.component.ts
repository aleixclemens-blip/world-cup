import { Component, signal, inject, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { StandingsService } from './services/standings.service';
import { GroupStanding } from './types/standings.types';

@Component({
  selector: 'app-standings',
  imports: [],
  templateUrl: './standings.component.html'
})
export class StandingsComponent implements OnInit {
  private readonly standingsService = inject(StandingsService);

  protected readonly groups = signal<GroupStanding[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  public ngOnInit(): void {
    this.loadStandings();
  }

  protected async loadStandings(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.standingsService.getStandings());
      this.groups.set(data);
    } catch (err) {
      console.error('Error fetching standings:', err);
      this.error.set('No se pudieron cargar las clasificaciones. Por favor, inténtelo de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }
}


