import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

/** Tests for the app shell: the sidebar navigation and its active links. */
describe('App', () => {
  beforeEach(async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {}); // hide navigation logs in test output

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  afterEach(() => vi.restoreAllMocks());

  async function renderAt(url: string): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  /** Text of the sidebar links that currently have the "active" class. */
  function activeLinks(element: HTMLElement): string[] {
    const links = element.querySelectorAll('.nav-link.active');
    return Array.from(links, (link) => link.textContent?.trim() ?? '');
  }

  it('highlights only the Overview link on /boards', async () => {
    const element = await renderAt('/boards');

    expect(activeLinks(element)).toEqual(['Overview']);
  });

  it('highlights the selected board, including when a task inside it is open', async () => {
    let element = await renderAt('/boards/roadmap');
    expect(activeLinks(element)).toEqual(['Roadmap']);

    element = await renderAt('/boards/roadmap/tasks/1');
    expect(activeLinks(element)).toEqual(['Roadmap']);
  });

  it('highlights the Settings link on /settings', async () => {
    const element = await renderAt('/settings');

    expect(activeLinks(element)).toEqual(['Settings']);
  });

  it('navigates with the router when a sidebar link is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/boards');
    await fixture.whenStable();

    const links = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.nav-link');
    const marketingLink = Array.from(links).find((link) => link.textContent?.includes('Marketing Plan'));
    marketingLink?.click();
    await fixture.whenStable();

    expect(router.url).toBe('/boards/marketing-plan');
    expect(activeLinks(fixture.nativeElement)).toEqual(['Marketing Plan']);
  });
});
