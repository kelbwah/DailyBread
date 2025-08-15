import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatesPipe } from '../dates-pipe';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { JournalService, Journal } from '../journal-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { radixTrash } from '@ng-icons/radix-icons';
import { EditorService } from '../editor-service';

@Component({
  selector: 'app-journal-history-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    NgIcon,
    DatesPipe,
  ],
  viewProviders: [
    provideIcons({
      radixTrash,
    }),
  ],
  providers: [JournalService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './journal-history-dialog.html',
  styleUrl: './journal-history-dialog.css',
})
export class JournalHistoryDialog {
  private journalService = inject(JournalService);
  private editorService = inject(EditorService);

  journals = this.journalService.allJournals;

  async openJournal(selectedJournal: Journal) {
    await this.journalService.openJournal(selectedJournal);
    await this.editorService.render(selectedJournal);
  }

  async deleteJournal(journalId: string) {
    await this.journalService.deleteJournal(journalId);
  }
}
