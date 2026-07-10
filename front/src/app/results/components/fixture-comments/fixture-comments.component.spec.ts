import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { FixtureCommentsComponent } from './fixture-comments.component';
import { ResultsService } from '../../services/results.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Fixture, Comment } from '../../types/results.types';
import { User } from '../../../auth/types/auth.types';

describe('FixtureCommentsComponent', () => {
  let resultsServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;
  let mockRoute: any;

  const mockUser: User = {
    id: 1,
    email: 'user1@example.com',
    username: 'user1',
    role: 'user'
  };

  const mockFixture: Fixture = {
    id: 123,
    referee: 'Ref',
    stadium: 'Stadium',
    stadiumCity: 'City',
    homeTeamId: 1,
    homeTeamName: 'Home',
    awayTeamId: 2,
    awayTeamName: 'Away',
    round: 'Group Stage - 1',
    goalsHome: 2,
    goalsAway: 1,
    penaltiesHome: null,
    penaltiesAway: null,
    homeTeam: { id: 1, name: 'Home', group: { id: 1, name: 'Group A' } },
    awayTeam: { id: 2, name: 'Away', group: { id: 1, name: 'Group A' } },
    events: [],
    homeTeamFlag: 'ar',
    awayTeamFlag: 'fr'
  };

  const mockComments: Comment[] = [
    {
      id: 10,
      content: 'Great match!',
      createdAt: '2026-07-04T12:00:00.000Z',
      userId: 1,
      fixtureId: 123,
      user: { id: 1, username: 'user1' }
    },
    {
      id: 11,
      content: 'Agreed!',
      createdAt: '2026-07-04T12:01:00.000Z',
      userId: 2,
      fixtureId: 123,
      user: { id: 2, username: 'user2' }
    }
  ];

  beforeEach(async () => {
    mockRoute = {
      paramMap: of({
        get: (key: string) => (key === 'fixtureId' ? '123' : null)
      })
    };

    resultsServiceMock = {
      getFixtureById: vi.fn().mockReturnValue(of(mockFixture)),
      getComments: vi.fn().mockReturnValue(of(mockComments)),
      createComment: vi.fn().mockReturnValue(of({
        id: 12,
        content: 'New comment',
        createdAt: '2026-07-04T12:02:00.000Z',
        userId: 1,
        fixtureId: 123,
        user: { id: 1, username: 'user1' }
      })),
      deleteComment: vi.fn().mockReturnValue(of({ message: 'Comment deleted successfully' }))
    };

    authServiceMock = {
      isAuthenticated: vi.fn().mockReturnValue(true),
      currentUser: vi.fn().mockReturnValue(mockUser)
    };

    routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FixtureCommentsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: routerMock },
        { provide: ResultsService, useValue: resultsServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the fixture comments component', () => {
    const fixture = TestBed.createComponent(FixtureCommentsComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should fetch fixture and comments on init', () => {
    const fixture = TestBed.createComponent(FixtureCommentsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(resultsServiceMock.getFixtureById).toHaveBeenCalledWith(123);
    expect(resultsServiceMock.getComments).toHaveBeenCalledWith(123);
    expect(component['fixture']()).toEqual(mockFixture);
    expect(component['comments']()).toEqual(mockComments);
    expect(component['isLoading']()).toBe(false);
  });

  it('should post comment successfully', async () => {
    const fixture = TestBed.createComponent(FixtureCommentsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Set form content
    component['commentModel'].set({ content: 'New comment' });
    fixture.detectChanges();

    await component['onSubmitComment']();
    fixture.detectChanges();

    expect(resultsServiceMock.createComment).toHaveBeenCalledWith(123, 'New comment');
    expect(component['comments']().length).toBe(3);
    expect(component['comments']()[0].content).toBe('New comment');
    expect(component['commentModel']().content).toBe('');
  });

  it('should delete comment when user has permission', async () => {
    const fixture = TestBed.createComponent(FixtureCommentsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Mock confirm dialog
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    // Try deleting comment belonging to mockUser (userId: 1)
    await component['onDeleteComment'](10);
    fixture.detectChanges();

    expect(resultsServiceMock.deleteComment).toHaveBeenCalledWith(123, 10);
    expect(component['comments']().length).toBe(1);
    expect(component['comments']().find(c => c.id === 10)).toBeUndefined();
  });

  it('should allow deletion of other users comment if user is admin', () => {
    const fixture = TestBed.createComponent(FixtureCommentsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Mock current user as admin
    authServiceMock.currentUser.mockReturnValue({
      id: 5,
      email: 'admin@example.com',
      username: 'admin',
      role: 'admin'
    });

    const otherUserComment = mockComments[1]; // userId: 2
    expect(component['canDelete'](otherUserComment)).toBe(true);
  });

  it('should deny deletion of other users comment if user is not admin', () => {
    const fixture = TestBed.createComponent(FixtureCommentsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const otherUserComment = mockComments[1]; // userId: 2
    expect(component['canDelete'](otherUserComment)).toBe(false);
  });
});
