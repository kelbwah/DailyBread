import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Journal, JournalDB } from '../journal-db';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { radixTrash } from '@ng-icons/radix-icons';
import { Editor } from '../editor/editor';

@Component({
  selector: 'app-journal-history-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    NgIcon,
  ],
  viewProviders: [
    provideIcons({
      radixTrash,
    }),
  ],
  providers: [JournalDB],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './journal-history-dialog.html',
  styleUrl: './journal-history-dialog.css',
})
export class JournalHistoryDialog implements OnInit {
  protected journalService = inject(JournalDB);

  async ngOnInit() {
    this.journalService.allJournals.set(
      await this.journalService.getJournals()
    );
  }

  openJournal(selectedJournal: Journal) {
    this.journalService.currentJournal.set(selectedJournal);

    Editor.editor.isReady;
    Editor.editor.render(selectedJournal);
  }
}
