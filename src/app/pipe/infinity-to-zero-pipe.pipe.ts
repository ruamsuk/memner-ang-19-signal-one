import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'infinityToZero',
  standalone: true,
})
export class InfinityToZeroPipe implements PipeTransform {
  transform(value: number): number {
    return isFinite(value) ? value : 0;
  }
}
