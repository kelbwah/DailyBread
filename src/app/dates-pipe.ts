import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'format_date',
})
export class DatesPipe implements PipeTransform {
  transform(date: number): string {
    return new Date(date).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'long',
      day: 'numeric',
    });
  }
}
