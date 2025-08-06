import { Component, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { radixFilePlus, radixReader, radixUpdate } from '@ng-icons/radix-icons';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';

@Component({
  selector: 'app-editor',
  imports: [NgIcon],
  viewProviders: [provideIcons({ radixFilePlus, radixReader, radixUpdate })],
  templateUrl: './editor.html',
  styleUrl: './editor.css',
})
export class Editor implements OnInit {
  editor!: EditorJS;
  openedJournal: any;

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
        await this.openLatestJournal();

        const openedJournalData: any = this.openedJournal.data;
        if (openedJournalData) {
          await this.editor.render(openedJournalData);
        }
      },
    });
  }

  async onSave() {
    const currentEditorState: any = await this.getCurrentEditorState();
    if (!currentEditorState) {
      return;
    }

    const openedJournalId = this.openedJournal.id;
    this.saveOutputData(openedJournalId, currentEditorState);
  }

  protected async getCurrentEditorState() {
    const editorState = await this.editor
      .save()
      .then((outputData: any) => {
        return outputData;
      })
      .catch((error: any) => {
        console.log('Failed to get current editor state', error);
      });

    return editorState;
  }

  protected saveOutputData(journalId: string, outputData: any) {
    if (outputData.blocks.length === 0) {
      return;
    }

    this.updateJournalMap(journalId, outputData);
  }

  protected updateJournalMap(uuid: string, journalData: any) {
    const journalMap = JSON.parse(localStorage.getItem('journals')!);
    journalMap[uuid] = journalData;

    localStorage.setItem('journals', JSON.stringify(journalMap));
    localStorage.setItem('latest_journal', uuid);
  }

  protected async createEmptyJournal() {
    if (!localStorage.getItem('journals')) {
      localStorage.setItem('journals', JSON.stringify({}));
    }

    const emptyJournal = await this.getCurrentEditorState();
    this.updateJournalMap(crypto.randomUUID(), emptyJournal);

    return emptyJournal;
  }

  protected async openLatestJournal() {
    if (!localStorage.getItem('latest_journal')) {
      await this.createEmptyJournal();
    }

    const latestJournalId = localStorage.getItem('latest_journal')!;
    const latestJournalData = this.getJournals();

    this.openedJournal = {
      id: latestJournalId,
      data: latestJournalData[latestJournalId],
    };
  }

  protected getJournals() {
    return JSON.parse(localStorage.getItem('journals')!);
  }

  protected openJournal(selectedJournalKey: any) {}
}
