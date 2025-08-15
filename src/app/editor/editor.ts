import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  radixExit,
  radixFilePlus,
  radixReader,
  radixUpdate,
  radixTrash,
} from '@ng-icons/radix-icons';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { JournalService } from '../journal-service';
import { ToastService } from '../toast-service';
import { DialogService } from '../dialog-service';
import { JournalHistoryDialog } from '../journal-history-dialog/journal-history-dialog';
import { EditorService } from '../editor-service';

@Component({
  selector: 'app-editor',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      radixExit,
      radixFilePlus,
      radixReader,
      radixUpdate,
      radixTrash,
    }),
  ],
  templateUrl: './editor.html',
  styleUrl: './editor.css',
})
export class Editor implements OnInit, OnDestroy {
  private editorService = inject(EditorService);
  private journalService = inject(JournalService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  private saveTrigger$ = new Subject<void>();
  private destroyTrigger$ = new Subject<void>();

  journalHistoryDialogComponent = JournalHistoryDialog;

  ngOnInit(): void {
    this.initEditor();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroyTrigger$.next();
    this.destroyTrigger$.complete();
    this.editorService.destroy();
  }

  private async initEditor() {
    await this.editorService.init({
      holder: 'editor-js',
      autofocus: true,
      placeholder: 'Start journaling here...',
      onReady: async () => {
        const journal = this.journalService.currentJournal();
        if (journal) await this.editorService.render(journal);
      },
      onChange: () => this.saveTrigger$.next(),
    });
  }

  private setupAutoSave() {
    this.saveTrigger$
      .pipe(debounceTime(1250), takeUntil(this.destroyTrigger$))
      .subscribe(() => this.onSave());
  }

  protected openDialog() {
    this.dialogService.openDialog(this.journalHistoryDialogComponent);
  }

  protected async createJournal() {
    const newJournal = await this.journalService.createEmptyJournal();
    await this.editorService.render(newJournal);
    this.toastService.openToast('New journal created');
  }

  protected async onSave() {
    const state = await this.editorService.save();
    if (!state) return;

    const currentJournalId = this.journalService.getLatestJournalId();

    await this.journalService.saveOutputData(currentJournalId!, state);
    this.toastService.openToast('Journal saved.');
  }
}
