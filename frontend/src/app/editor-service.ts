import { Injectable } from '@angular/core';
import EditorJS, { EditorConfig, OutputData } from '@editorjs/editorjs';

@Injectable({ providedIn: 'root' })
export class EditorService {
  private editorInstance?: EditorJS;

  async init(config: EditorConfig): Promise<void> {
    if (this.editorInstance) {
      console.warn('Editor already initialized. Destroying existing instance.');
      this.destroy();
    }

    this.editorInstance = new EditorJS(config);
    await this.editorInstance.isReady;
  }

  async render(data: any): Promise<void> {
    if (!(await this.isReady())) return;
    await this.editorInstance!.render(data);
  }

  async save(): Promise<OutputData | null> {
    if (!(await this.isReady())) return null;
    try {
      return await this.editorInstance!.save();
    } catch (err) {
      console.error('Failed to save editor data', err);
      return null;
    }
  }

  async isReady(): Promise<boolean> {
    try {
      await this.editorInstance?.isReady;
      return this.editorInstance != null;
    } catch {
      return false;
    }
  }

  destroy(): void {
    this.editorInstance?.destroy();
    this.editorInstance = undefined;
  }
}
