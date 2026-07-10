import { Component, signal, inject, computed, linkedSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, forkJoin, firstValueFrom } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { form, FormField, submit, required, validate, disabled } from '@angular/forms/signals';

import { ResultsService } from '../../services/results.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Fixture, Comment } from '../../types/results.types';

@Component({
  selector: 'app-fixture-comments',
  imports: [RouterLink, FormField, DatePipe],
  templateUrl: './fixture-comments.component.html'
})
export class FixtureCommentsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly resultsService = inject(ResultsService);
  protected readonly authService = inject(AuthService);

  // States
  protected readonly isLoading = signal<boolean>(true);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitError = signal<string | null>(null);

  // Dynamic route param 'fixtureId' as a signal
  private readonly fixtureId = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const id = Number(params.get('fixtureId'));
        return isNaN(id) ? null : id;
      })
    )
  );

  // Reactively fetch data when fixtureId changes
  private readonly dataState = toSignal(
    toObservable(this.fixtureId).pipe(
      filter((id): id is number => id !== null && id !== undefined),
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap((id) =>
        forkJoin({
          fixture: this.resultsService.getFixtureById(id),
          comments: this.resultsService.getComments(id)
        }).pipe(
          catchError((err) => {
            console.error('Error loading fixture details or comments:', err);
            this.error.set('No se pudo cargar la información del partido o sus comentarios.');
            return of(null);
          })
        )
      ),
      tap(() => this.isLoading.set(false))
    )
  );

  // Derived signals
  protected readonly fixture = computed<Fixture | null>(() => this.dataState()?.fixture ?? null);
  protected readonly comments = linkedSignal<Comment[]>(() => this.dataState()?.comments ?? []);

  // Form setup using Signal Forms
  protected readonly commentModel = signal({
    content: ''
  });

  protected readonly commentForm = form(this.commentModel, (s) => {
    required(s.content, { message: 'El comentario no puede estar vacío' });
    validate(s.content, ({ value }) => {
      const val = value().trim();
      if (val.length > 1000) {
        return { kind: 'maxLength', message: 'El comentario no puede exceder los 1000 caracteres' };
      }
      return undefined;
    });
    disabled(s.content, { when: () => this.isSubmitting() });
  });

  protected async onSubmitComment(): Promise<void> {
    const currentFixtureId = this.fixtureId();
    if (!currentFixtureId || this.isSubmitting()) return;

    submit(this.commentForm, async () => {
      this.isSubmitting.set(true);
      this.submitError.set(null);

      try {
        const comment = await firstValueFrom(
          this.resultsService.createComment(currentFixtureId, this.commentModel().content)
        );
        // Prepend the new comment locally to avoid full refetch
        this.comments.update((prev) => [comment, ...prev]);
        // Reset comment content input model
        this.commentModel.set({ content: '' });
      } catch (err: any) {
        console.error('Error posting comment:', err);
        const errMsg = err.error?.message || 'No se pudo publicar el comentario. Por favor, inténtelo de nuevo.';
        this.submitError.set(errMsg);
      } finally {
        this.isSubmitting.set(false);
      }
    });
  }

  protected async onDeleteComment(commentId: number): Promise<void> {
    const currentFixtureId = this.fixtureId();
    if (!currentFixtureId) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      await firstValueFrom(this.resultsService.deleteComment(currentFixtureId, commentId));
      // Remove comment from local list
      this.comments.update((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      alert(err.error?.message || 'No se pudo eliminar el comentario. Por favor, inténtelo de nuevo.');
    }
  }

  protected canDelete(comment: Comment): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // Check if owner or admin
    return comment.userId === currentUser.id || currentUser.role === 'admin';
  }

  protected getGroupedScorers(fixture: Fixture, teamId: number): { playerName: string; minutes: string }[] {
    if (!fixture.events) return [];

    const goalEvents = fixture.events.filter(
      (e) => e.teamId === teamId && e.type.toLowerCase() === 'goal'
    );

    const parsedEvents = goalEvents.map((e) => {
      const sortMinute = e.minute + (e.extraMinute ? e.extraMinute / 100 : 0);
      const displayMinute = e.extraMinute ? `${e.minute}+${e.extraMinute}'` : `${e.minute}'`;
      return {
        playerName: e.playerName,
        sortMinute,
        displayMinute
      };
    });

    parsedEvents.sort((a, b) => a.sortMinute - b.sortMinute);

    const groups: { playerName: string; minutes: string[] }[] = [];
    for (const event of parsedEvents) {
      let group = groups.find((g) => g.playerName === event.playerName);
      if (!group) {
        group = { playerName: event.playerName, minutes: [] };
        groups.push(group);
      }
      group.minutes.push(event.displayMinute);
    }

    return groups.map((g) => ({
      playerName: g.playerName,
      minutes: g.minutes.join(', ')
    }));
  }

  protected hasShootout(fixture: Fixture): boolean {
    return (
      fixture.penaltiesHome !== null &&
      fixture.penaltiesAway !== null &&
      fixture.penaltiesHome !== undefined &&
      fixture.penaltiesAway !== undefined
    );
  }
}
