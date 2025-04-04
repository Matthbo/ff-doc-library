import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* You can also use standalone components but for this example we export the module */

@NgModule({
  declarations: [
    /* DrawComponent */
  ],
  imports: [CommonModule],
  exports: [
    /* DrawComponent */
  ],
  providers: [
    /* ThreejsService */
  ],
})
export class LibraryModule {}
