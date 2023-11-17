import {MatSnackBarConfig} from "@angular/material/snack-bar";

export const baseUrl = 'wss://10.0.42.2/vpxlua';

export function snackbarConfig(panelClass: string):MatSnackBarConfig {
  return {
    duration: 5000,
    /*
    horizontalPosition: 'right', // Horizontal position: 'start' | 'center' | 'end' | 'left' | 'right'
    verticalPosition: 'top',     // Vertical position: 'top' | 'bottom'*/
    panelClass:[panelClass]
  }
}
