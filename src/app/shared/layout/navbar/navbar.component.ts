import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, interval, Subscription, Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, Notification as AppNotification } from '../../../core/services/notification.service';
import { GlobalSearchService, GlobalSearchResponse } from '../../../core/services/global-search.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  notificationCount = signal(0);
  notifications = signal<AppNotification[]>([]);
  showNotifications = signal(false);
  pageTitle = signal('Dashboard');

  searchQuery = signal('');
  searchResults = signal<GlobalSearchResponse[]>([]);
  showSearchSuggestions = signal(false);
  private searchSubject = new Subject<string>();

  private pollingSubscription?: Subscription;
  private routerSubscription?: Subscription;

  currentUser = computed(() => this.authService.currentUser());

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private searchService: GlobalSearchService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSearchSuggestions.set(false);
    }
  }

  ngOnInit(): void {
    this.updateTitle();
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTitle();
      this.showSearchSuggestions.set(false);
      this.searchQuery.set('');
    });

    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          return of(null);
        }
        return this.searchService.search(query.trim()).pipe(
          catchError(err => {
            console.error('Search error:', err);
            return of(null);
          })
        );
      })
    ).subscribe(response => {
      if (response && response.success && response.data) {
        this.searchResults.set(response.data);
        this.showSearchSuggestions.set(true);
      } else {
        this.searchResults.set([]);
        if (this.searchQuery().trim().length < 2) {
          this.showSearchSuggestions.set(false);
        } else {
          // If query >= 2 but no results or error, show the "No results found" box
          this.showSearchSuggestions.set(true);
        }
      }
    });

    this.fetchNotificationCount();
    // Refresh every 30 seconds
    this.pollingSubscription = interval(30000).subscribe(() => {
      this.fetchNotificationCount();
    });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  selectSearchResult(result: GlobalSearchResponse): void {
    this.showSearchSuggestions.set(false);
    this.searchQuery.set('');
    this.router.navigateByUrl(result.link);
  }

  private updateTitle(): void {
    let route = this.activatedRoute.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const title = route.snapshot.title?.replace('CRM | ', '') || 'Dashboard';
    this.pageTitle.set(title);
  }

  fetchNotificationCount(): void {
    if (!this.authService.isAuthenticated()) return;

    this.notificationService.getUnreadCount().subscribe({
      next: (response: any) => {
        this.notificationCount.set(response.data || 0);
      },
      error: () => {
        console.error('Failed to fetch notification count');
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications.update((v: boolean) => !v);
    if (this.showNotifications()) {
      this.fetchNotifications();
    }
  }

  fetchNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (response: any) => {
        this.notifications.set(response.data || []);
      }
    });
  }

  markAsRead(notification: AppNotification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          this.fetchNotificationCount();
          this.fetchNotifications();
        }
      });
    }

    if (notification.linkUrl) {
      this.showNotifications.set(false);
      this.router.navigateByUrl(notification.linkUrl);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.fetchNotificationCount();
        this.fetchNotifications();
      }
    });
  }
}
