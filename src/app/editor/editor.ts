import { Component, inject, OnInit } from '@angular/core';
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
  protected editor!: EditorJS;
  protected journalService = inject(JournalDB);

  ngOnInit(): void {
    this.editor = new EditorJS({
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
        await this.journalService.openLatestJournal(this.editor);
        if (this.journalService.currentJournal().data) {
          await this.editor.render(this.journalService.currentJournal().data);
        }
      },
      onChange: () => {
        this.onSave();
      },
    });
  }

  async getCurrentEditorState() {
    try {
      return await this.editor.save();
    } catch (error) {
      console.error('Failed to get current editor state', error);
      return null;
    }
  }

  async onSave() {
    const currentEditorState = await this.editor.save();
    if (!currentEditorState) return;

    const currentJournalId = !this.journalService.currentJournal().id
      ? crypto.randomUUID()
      : this.journalService.currentJournal().id;

    await this.journalService.saveOutputData(
      this.editor,
      currentJournalId,
      currentEditorState
    );
  }
}
