import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { radixCardStackPlus, radixReader } from '@ng-icons/radix-icons';

@Component({
  selector: 'app-editor-header',
  imports: [NgIcon],
  viewProviders: [provideIcons({ radixCardStackPlus, radixReader })],
  templateUrl: './editor-header.html',
  styleUrl: './editor-header.css',
})
export class EditorHeader {}
