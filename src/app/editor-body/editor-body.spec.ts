import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorBody } from './editor-body';

describe('EditorBody', () => {
  let component: EditorBody;
  let fixture: ComponentFixture<EditorBody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorBody]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorBody);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
