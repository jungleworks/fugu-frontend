import { CollectionViewer, DataSource} from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AttendaceBotService } from './attendace-bot.service';
import { catchError, finalize } from 'rxjs/operators';

export class LeaveBalanceDataSource implements DataSource<any> {

  private leaveDataSubject = new BehaviorSubject<any[]>([]);
  private leaveDataLoadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.leaveDataLoadingSubject.asObservable();

  constructor(private service: AttendaceBotService) {}

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
      return this.leaveDataSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
      this.leaveDataSubject.complete();
      this.leaveDataLoadingSubject.complete();
  }

  loadLessons(pageStart) {
      this.leaveDataLoadingSubject.next(true);

      this.service.getAllLeaveData(pageStart).pipe(
          catchError(() => of([])),
          finalize(() => this.leaveDataLoadingSubject.next(false))
      )
      .subscribe(data => this.leaveDataSubject.next(data));
  }
}
