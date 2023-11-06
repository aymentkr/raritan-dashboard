import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

@Injectable()
export class DeactivateGuard implements CanDeactivate<any> {
  canDeactivate(
    component: any
  ): boolean {
    if ('isLoading' in component) {
      return !component.isLoading;
    } else {
      console.warn('Component does not have an isLoading property');
      return true; // Allow deactivation by default
    }
  }
}
