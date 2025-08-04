import { Component } from '@angular/core';
import { EditorBody } from '../editor-body/editor-body';
import { EditorHeader } from '../editor-header/editor-header';

@Component({
  selector: 'app-editor',
  imports: [EditorHeader, EditorBody],
  templateUrl: './editor.html',
  styleUrl: './editor.css',
})
export class Editor {}
