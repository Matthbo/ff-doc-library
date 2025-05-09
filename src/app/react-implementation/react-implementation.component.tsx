import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { useFFDoc, useJavadocTransform } from 'ff-doc';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

@Component({
  selector: 'app-react-implementation',
  imports: [],
  template: '<div #reactContainer></div>',
  styleUrl: './react-implementation.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ReactImplementationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('reactContainer', { static: true }) reactContainerRef!: ElementRef<HTMLDivElement>;
  private reactAppRoot: Root | null = null;

  ngAfterViewInit(): void {
    const root= this.reactAppRoot = createRoot(this.reactContainerRef.nativeElement);
    root.render(<App />);
  }

  ngOnDestroy(): void {
    this.reactAppRoot?.unmount();
  }
}

function App() {
  const { elements } = useFFDoc('/assets/example-ffdoc.json')
  const javadocTransform = useJavadocTransform();

  return (
    <>
      <h2>Elements</h2>
      {Object.entries(elements ?? {}).map(([elementName, element]) => (
        <section key={elementName}>
          <h3>{elementName}</h3>
          <p dangerouslySetInnerHTML={javadocTransform(element.description ?? '', elements, true)}></p>
        </section>
      ))}
    </>
  );
}
