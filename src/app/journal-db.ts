import { signal, WritableSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import Dexie, { Table } from 'dexie';

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
  currentJournal: WritableSignal<Journal> = signal({} as Journal);

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

  async saveOutputData(journalId: string, outputData: any) {
    if (!outputData?.blocks?.length) return;

    const updatedJournal: Journal = {
      id: journalId,
      time: Date.now(),
      blocks: outputData.blocks,
      version: outputData.version,
    };

    await db.journals.put(updatedJournal, journalId);
    await db.setLatestJournalId(journalId);

    this.currentJournal.set(updatedJournal);
    this.allJournals.set(await this.getJournals());
  }

  async createEmptyJournal() {
    const newJournal: Journal = {
      id: crypto.randomUUID(),
      time: Date.now(),
      blocks: [],
      version: '2.31.0-rc.7',
    };

    await db.journals.add(newJournal);
    await db.setLatestJournalId(newJournal.id);

    this.currentJournal.set(newJournal);

    return newJournal;
  }

  async getJournals() {
    const journals = (await db.journals.toArray()).sort(
      (a, b) => b.time - a.time
    );
    return journals;
  }

  async openLatestJournal() {
    let latestId = db.getLatestJournalId();

    if (!latestId) {
      const newJournal = await this.createEmptyJournal();
      latestId = newJournal.id;
    }

    const journal = await db.journals.get(latestId);
    if (!journal) {
      const newJournal = await this.createEmptyJournal();
      latestId = newJournal.id;
    }

    this.currentJournal.set(journal!);
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

  async deleteJournal(journalId: any) {
    await db.journals.delete(journalId);

    const allJournals = await this.getJournals();
    if (allJournals.length === 0) {
      await this.createEmptyJournal();
    } else {
      this.currentJournal.set(allJournals[0]);
    }

    this.allJournals.set(await this.getJournals());
  }
}

export const db = new JournalDB();
