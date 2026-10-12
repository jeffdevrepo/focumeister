import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timerPipe',
})
export class TimerPipePipe implements PipeTransform {
  transform(elapsedTime: number): string {
    const totalSeconds = Math.floor(elapsedTime);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
}
