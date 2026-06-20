import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the app-navbar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
  });

  it('should render the app-footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });

  it('should have a layout container to push the footer down', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check main outer layout wrapper
    const container = compiled.querySelector('div');
    expect(container).toBeTruthy();
    expect(container?.className).toContain('min-h-screen');
    expect(container?.className).toContain('flex');
    expect(container?.className).toContain('flex-col');

    // Check main element which should grow
    const main = compiled.querySelector('main');
    expect(main).toBeTruthy();
    expect(main?.className).toContain('flex-grow');
    expect(main?.className).toContain('pt-16');
  });
});
