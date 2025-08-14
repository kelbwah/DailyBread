import { signal, WritableSignal } from '@angular/core';
import Dexie, { Table } from 'dexie';
import EditorJS from '@editorjs/editorjs';

export interface Journal {
  id: string;
  time: number;
  blocks: any[];
  version: string;
}

export class JournalDB extends Dexie {
  latestJournalId!: string;
  journals!: Table<Journal, string>;
  allJournals: WritableSignal<Journal[]> = signal([]);
  isJournalHistoryModalOpen: WritableSignal<boolean> = signal(false);
  currentJournal: WritableSignal<{ id: string; data: Journal }> = signal({
    id: '',
    data: {} as Journal,
  });

  constructor() {
    super('JournalDatabase');
    this.version(1).stores({
      journals: 'id, time',
    });
  }

  async setLatestJournalId(id: string) {
    this.table('journals').db.on('ready', () => {
      localStorage.setItem('latest_journal', id);
    });
  }

  getLatestJournalId(): string | null {
    return localStorage.getItem('latest_journal');
  }

  async saveOutputData(editor: EditorJS, journalId: string, outputData: any) {
    if (!outputData?.blocks?.length) return;

    const updatedJournal: Journal = {
      id: journalId,
      time: Date.now(),
      blocks: outputData.blocks,
      version: outputData.version,
    };

    await db.journals.put(updatedJournal, journalId);
    await db.setLatestJournalId(journalId);

    this.currentJournal.set({
      id: journalId,
      data: updatedJournal,
    });
    this.allJournals.set(await this.getJournals());
  }

  async createEmptyJournal(editor: EditorJS) {
    const newJournal: Journal = {
      id: crypto.randomUUID(),
      time: Date.now(),
      blocks: [],
      version: '2.31.0-rc.7',
    };

    await db.journals.add(newJournal);
    await db.setLatestJournalId(newJournal.id);

    this.currentJournal.set({
      id: newJournal.id,
      data: newJournal,
    });

    await editor.isReady;
    await editor.render(newJournal);

    return newJournal;
  }

  async getJournals() {
    const journals = (await db.journals.toArray()).sort(
      (a, b) => b.time - a.time
    );
    return journals;
  }

  async openLatestJournal(editor: EditorJS) {
    let latestId = db.getLatestJournalId();

    if (!latestId) {
      const newJournal = await this.createEmptyJournal(editor);
      latestId = newJournal.id;
    }

    const journal = await db.journals.get(latestId);
    if (!journal) {
      const newJournal = await this.createEmptyJournal(editor);
      latestId = newJournal.id;
    }

    this.currentJournal.set({
      id: latestId,
      data: journal!,
    });
  }

  async toggleJournalHistoryModal() {
    this.isJournalHistoryModalOpen.update((prev) => !prev);
  }

  getFormattedDate(date: any) {
    return new Date(date).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'long',
      day: 'numeric',
    });
  }

  async openJournal(editor: EditorJS, selectedJournal: any) {
    this.currentJournal.set(selectedJournal);
    this.toggleJournalHistoryModal();

    await editor.isReady;
    await editor.render(selectedJournal);
  }

  async deleteJournal(editor: EditorJS, journalId: any) {
    await db.journals.delete(journalId);

    const allJournals = await this.getJournals();
    if (allJournals.length === 0) {
      await this.createEmptyJournal(editor);
    } else {
      this.currentJournal.set({ id: allJournals[0].id, data: allJournals[0] });
      await editor.isReady;
      await editor.render(this.currentJournal().data);
    }

    this.allJournals.set(await this.getJournals());
  }
}

export const db = new JournalDB();
