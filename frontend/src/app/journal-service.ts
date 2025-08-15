import { Injectable, signal, WritableSignal } from '@angular/core';
import { OutputData } from '@editorjs/editorjs';
import Dexie, { Table } from 'dexie';

export interface Journal {
  id: string;
  time: number;
  blocks: any[];
  version: string;
}

@Injectable({ providedIn: 'root' })
export class JournalService extends Dexie {
  private journals!: Table<Journal, string>;

  allJournals: WritableSignal<Journal[]> = signal([]);
  currentJournal: WritableSignal<Journal> = signal({} as Journal);

  constructor() {
    super('JournalDatabase');
    this.version(1).stores({
      journals: 'id, time',
    });

    this.initDefaultState();
  }

  private async initDefaultState() {
    await this.refreshJournals();
    await this.openLatestJournal();
  }

  private async refreshJournals() {
    const journals = await this.journals.toArray();
    this.allJournals.set(journals.sort((a, b) => b.time - a.time));
  }

  private saveLatestJournalId(id: string) {
    localStorage.setItem('latest_journal', id);
  }

  getLatestJournalId(): string | null {
    return localStorage.getItem('latest_journal');
  }

  async createEmptyJournal(): Promise<Journal> {
    const journal: Journal = {
      id: crypto.randomUUID(),
      time: Date.now(),
      blocks: [],
      version: '2.31.0-rc.7',
    };
    await this.journals.add(journal);

    this.saveLatestJournalId(journal.id);
    this.currentJournal.set(journal);

    await this.refreshJournals();

    return journal;
  }

  async openJournal(journal: Journal) {
    this.saveLatestJournalId(journal.id);
    this.currentJournal.set(journal);
  }

  async saveOutputData(journalId: string, outputData: OutputData) {
    if (!outputData?.blocks?.length) return;

    const journal: Journal = {
      id: journalId,
      time: Date.now(),
      blocks: outputData.blocks,
      version: outputData.version!,
    };

    await this.journals.put(journal);

    this.saveLatestJournalId(journal.id);
    this.currentJournal.set(journal);

    await this.refreshJournals();
  }

  async openLatestJournal() {
    let latestId = this.getLatestJournalId();
    let journal: Journal | undefined;

    if (latestId) {
      journal = await this.journals.get(latestId);
    }

    if (!journal) {
      journal = await this.createEmptyJournal();
      latestId = journal.id;
    }

    this.currentJournal.set(journal);
    this.saveLatestJournalId(latestId!);
  }

  async deleteJournal(journalId: string) {
    await this.journals.delete(journalId);
    await this.refreshJournals();

    const journals = this.allJournals();
    let latestJournal: Journal;
    if (journals.length === 0) {
      latestJournal = await this.createEmptyJournal();
    } else {
      latestJournal = journals[0];
    }

    this.currentJournal.set(latestJournal);
    this.saveLatestJournalId(latestJournal.id);
  }
}
