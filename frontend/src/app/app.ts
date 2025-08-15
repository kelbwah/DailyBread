import { Component, signal } from '@angular/core';
import { Editor } from './editor/editor';

@Component({
  selector: 'app-root',
  imports: [Editor],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('DailyBread');
}
