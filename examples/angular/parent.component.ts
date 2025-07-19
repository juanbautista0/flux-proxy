import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FluxProxy } from 'flux-proxy';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-parent',
  template: `
    <div class="parent-container">
      <h1>Flux-Proxy - Parent Component (Angular)</h1>
      
      <button (click)="loadIframe()">Load iframe</button>
      
      <div *ngIf="iframeLoaded" class="iframe-container">
        <iframe [src]="childUrl" width="100%" height="300"></iframe>
      </div>
      
      <div class="logs">
        <h3>Communication log:</h3>
        <div *ngFor="let log of logs" class="log-entry">
          {{ log }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .parent-container { font-family: Arial, sans-serif; margin: 20px; }
    .iframe-container { margin: 20px 0; }
    iframe { border: 1px solid #ccc; }
    .log-entry { margin: 5px 0; padding: 5px; background: #f5f5f5; }
  `]
})
export class ParentComponent implements OnInit, OnDestroy {
  logs: string[] = [];
  iframeLoaded = false;
  childUrl: SafeResourceUrl;
  
  constructor(private sanitizer: DomSanitizer) {
    // Sanitize the iframe URL to avoid security issues
    this.childUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/child');
  }
  
  ngOnInit() {
    // Set up the message listener
    window.addEventListener('message', this.handleMessage);
  }
  
  ngOnDestroy() {
    // Clean up the listener when the component is destroyed
    window.removeEventListener('message', this.handleMessage);
  }
  
  loadIframe() {
    this.iframeLoaded = true;
  }
  
  // Message handler
  handleMessage = (event: MessageEvent) => {
    // Use FluxProxy to process the message
    FluxProxy.parentClient.onMessage(
      event.data,
      window,
      this.handleData
    );
  }
  
  // Function to handle data requests
  handleData = async (message: any) => {
    const newLog = `Request received: ${JSON.stringify(message)}`;
    this.logs.push(newLog);
    
    // Simulate a response based on the requested collection
    if (message.collection === 'categories') {
      return [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Clothing' },
        { id: 3, name: 'Home' }
      ];
    }
    
    return { message: 'Data not found' };
  }
}