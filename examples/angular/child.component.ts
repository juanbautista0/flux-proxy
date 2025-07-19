import { Component } from '@angular/core';
import { FluxProxy } from 'flux-proxy';

@Component({
  selector: 'app-child',
  template: `
    <div class="child-container">
      <h1>Flux-Proxy - Child Component (Angular)</h1>
      
      <button 
        (click)="fetchData()" 
        [disabled]="loading"
      >
        {{ loading ? 'Loading...' : 'Request Data' }}
      </button>
      
      <div *ngIf="error" class="error">
        Error: {{ error }}
      </div>
      
      <div *ngIf="data" class="data">
        <h3>Data received:</h3>
        <pre>{{ dataJson }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .child-container { font-family: Arial, sans-serif; margin: 20px; }
    button { margin: 10px 0; padding: 8px 16px; }
    .error { color: red; margin: 10px 0; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
  `]
})
export class ChildComponent {
  data: any = null;
  error: string | null = null;
  loading = false;
  
  get dataJson(): string {
    return JSON.stringify(this.data, null, 2);
  }
  
  // Function to request data from the parent
  async fetchData() {
    this.loading = true;
    this.error = null;
    
    try {
      // Use FluxProxy to request data
      const [response, responseError] = await FluxProxy.childClient.getData('categories');
      
      if (responseError) {
        this.error = responseError.message;
      } else {
        this.data = response;
      }
    } catch (err: any) {
      this.error = `Unexpected error: ${err.message}`;
    } finally {
      this.loading = false;
    }
  }
}