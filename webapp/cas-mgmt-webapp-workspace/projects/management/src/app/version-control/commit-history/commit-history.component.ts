import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommitHistoryService} from './commit-history.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import {DiffEntry} from 'domain-lib';
import {PaginatorComponent, ViewComponent} from 'shared-lib';
import {ChangesService} from '../changes/changes.service';
import {MediaObserver} from '@angular/flex-layout';

@Component({
  selector: 'app-commit-history',
  templateUrl: './commit-history.component.html',
  styleUrls: ['./commit-history.component.css']
})
export class CommitHistoryComponent implements OnInit {

  displayedColumns = ['actions', 'name', 'message', 'committer', 'time'];
  dataSource: MatTableDataSource<DiffEntry>;

  @ViewChild(PaginatorComponent, { static: true })
  paginator: PaginatorComponent;

  commit: string;

  selectedItem: DiffEntry;


  constructor(private route: ActivatedRoute,
              private router: Router,
              private service: CommitHistoryService,
              private changeService: ChangesService,
              public snackBar: MatSnackBar,
              public mediaObserver: MediaObserver,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.route.data
      .subscribe((data: { resp: DiffEntry[]}) => {
        this.dataSource = new MatTableDataSource(data.resp);
        this.dataSource.paginator = this.paginator.paginator;
      });
    this.route.params.subscribe((params) => this.commit = params.id);
    this.setColumns();
    this.mediaObserver.asObservable().subscribe(c => this.setColumns());
  }

  setColumns() {
    if (this.mediaObserver.isActive('lt-md')) {
      this.displayedColumns = ['actions', 'name', 'message'];
    } else {
      this.displayedColumns = ['actions', 'name', 'message', 'committer', 'time'];
    }
  }

  viewChange() {
    this.router.navigate(['form/view', this.selectedItem.oldId]);
  }

  checkout() {
    this.service.checkout(this.selectedItem.commit, this.selectedItem.path)
      .subscribe(
        resp => this.snackBar
          .open('Service successfully restored from history.',
                'dismiss',
                {duration: 5000}
          )
      );
  }

  revert() {
    this.service.revert(this.selectedItem.oldId)
      .subscribe(
        resp => this.snackBar
          .open('Service successfully restored from history.',
            'dismiss',
            {duration: 5000}
          )
      );
  }

  viewChangeMade() {
    this.service.change(this.selectedItem.commit, this.selectedItem.path)
      .subscribe(f => this.openView(f, 'diff', 'github'));
  }

  viewDiff() {
    this.service.toHead(this.selectedItem.commit, this.selectedItem.path)
      .subscribe(f => this.openView(f, 'diff', 'github'),
        (error) => this.snackBar.open(error.error.message, 'Dismiss'));
  }

  viewJSON() {
    this.changeService.viewJson(this.selectedItem.oldId)
      .subscribe(f => this.openView(f, 'hjson', 'eclipse'));
  }

  viewYaml() {
    this.changeService.viewYaml(this.selectedItem.oldId)
      .subscribe(f => this.openView(f, 'yaml', 'eclipse'));
  }

  openView(text: string, mode: string, theme: string) {
    this.dialog.open(ViewComponent, {
       data: [text, mode, theme],
       width: '900px',
       position: {top: '50px'}
    });
  }

  first(): boolean {
    return this.selectedItem && this.selectedItem.commit === this.commit;
  }
}


