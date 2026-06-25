import { TestBed } from '@angular/core/testing';
import { StandingsComponent } from './standings.component';

describe('StandingsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandingsComponent]
    }).compileComponents();
  });

  it('should create the standings component', () => {
    const fixture = TestBed.createComponent(StandingsComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have 8 groups initialized', () => {
    const fixture = TestBed.createComponent(StandingsComponent);
    const component = fixture.componentInstance;
    expect(component['groups']().length).toBe(8);
    expect(component['groups']()[0].groupName).toBe('Grupo A');
    expect(component['groups']()[7].groupName).toBe('Grupo H');
  });

  it('should render 8 group standing cards in the template', () => {
    const fixture = TestBed.createComponent(StandingsComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Each group is wrapped in a card. We check how many cards we render.
    // Each card has an h2 title.
    const cards = compiled.querySelectorAll('h2');
    expect(cards.length).toBe(8);
  });

  it('should render columns Pos, Equipo, PJ, G, E, P, GF, GC, DG, Pts', () => {
    const fixture = TestBed.createComponent(StandingsComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check table headers in the first card
    const headers = compiled.querySelectorAll('.grid-cols-\\[2rem_2\\.5fr_repeat\\(7\\,1fr\\)_1\\.25fr\\]');
    expect(headers.length).toBeGreaterThan(0);
    
    const headerText = headers[0].textContent;
    expect(headerText).toContain('#');
    expect(headerText).toContain('Equipo');
    expect(headerText).toContain('PJ');
    expect(headerText).toContain('G');
    expect(headerText).toContain('E');
    expect(headerText).toContain('P');
    expect(headerText).toContain('GF');
    expect(headerText).toContain('GC');
    expect(headerText).toContain('DG');
    expect(headerText).toContain('Pts');
  });

  it('should render the outer green indicator for rank 1 and 2 teams', () => {
    const fixture = TestBed.createComponent(StandingsComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check absolute green indicator element in the DOM
    const greenIndicators = compiled.querySelectorAll('.bg-emerald-500');
    
    // 8 groups * 2 teams per group = 16 indicators
    // plus possibly any green indicators in the footer legends (which are bg-emerald-500 too)
    // There is 1 green dot in each legend -> 8 * 1 = 8 dots
    // Total should be 16 row bars + 8 legend dots = 24 indicators.
    expect(greenIndicators.length).toBe(24);
  });
});
