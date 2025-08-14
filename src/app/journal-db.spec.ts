import { TestBed } from '@angular/core/testing';

import { JournalDB } from './journal-db';

describe('JournalDB', () => {
  let service: JournalDB;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalDB);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
