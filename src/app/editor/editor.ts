import { Component, computed, inject, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  radixExit,
  radixFilePlus,
  radixReader,
  radixUpdate,
  radixTrash,
} from '@ng-icons/radix-icons';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import { JournalDB } from '../journal-db';
import { ToastService } from '../toast-service';
import { DialogService } from '../dialog-service';
import { JournalHistoryDialog } from '../journal-history-dialog/journal-history-dialog';

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
  providers: [JournalDB],
  templateUrl: './editor.html',
  styleUrl: './editor.css',
})
export class Editor implements OnInit {
  static editor: EditorJS;
  protected journalService = inject(JournalDB);
  protected _dialogService = inject(DialogService);
  private _toastService = inject(ToastService);
  journalHistoryDialogComponent = JournalHistoryDialog;
  currentJournal = computed(this.journalService.currentJournal);

  ngOnInit(): void {
    Editor.editor = new EditorJS({
      holder: 'editor-js',
      autofocus: true,
      placeholder: 'start journaling here...',
      tools: {
        header: {
          class: Header as any,
          inlineToolbar: ['link'],
        },
        list: {
          class: List as any,
          inlineToolbar: ['link', 'bold'],
        },
      },
      onReady: async () => {
        this.journalService.allJournals.set(
          await this.journalService.getJournals()
        );
        await this.journalService.openLatestJournal();
        if (await this.editorLoaded()) {
          await Editor.editor.render(this.currentJournal());
        }
      },
      onChange: async () => {
        await this.onSave();
        this._toastService.openToast('File saved!');
      },
    });
  }

  openDialog() {
    this._dialogService.openDialog(this.journalHistoryDialogComponent);
  }

  async createJournal() {
    const newJournal = await this.journalService.createEmptyJournal();

    if (await this.editorLoaded()) {
      await Editor.editor.render(newJournal);
    }

    this._toastService.openToast('File created!');
  }

  async getCurrentEditorState() {
    try {
      return await Editor.editor.save();
    } catch (error) {
      console.error('Failed to get current editor state', error);
      return null;
    }
  }

  async deleteJournal(journalId: string) {
    this.journalService.deleteJournal(journalId);
    if (await this.editorLoaded()) {
      await Editor.editor.render(this.journalService.currentJournal());
    }
  }

  async onSave() {
    const currentEditorState = await Editor.editor.save();
    if (!currentEditorState) return;

    const currentJournalId = !this.journalService.currentJournal().id
      ? crypto.randomUUID()
      : this.journalService.currentJournal().id;

    await this.journalService.saveOutputData(
      currentJournalId,
      currentEditorState
    );

    this._toastService.openToast('File saved!');
  }

  async editorLoaded(): Promise<boolean> {
    try {
      await Editor.editor.isReady;
      return true;
    } catch (err: any) {
      console.error('Error caught while loading editor.js:', err);
      return false;
    }
  }
}
