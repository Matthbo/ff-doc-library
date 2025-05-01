import { Directive, inject, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { FrankDoc } from '../frankdoc.types';
import { getLinkData, LinkData } from '../javadoc';

export type TemplateContext = { $implicit: string };
export type LinkTemplateContext = { $implicit: LinkData };

/**
 * Transforms javadoc text to html text, handles links as a different template.
 * */
@Directive({
  selector: '[fdJavadocTransform]',
  standalone: true,
})
export class JavadocTransformDirective implements OnChanges {
  @Input({ required: true }) javadocTransformOf?: string;
  @Input({ required: true }) javadocTransformElements!: FrankDoc['elements'] | null;
  @Input() javadocTransformLink?: TemplateRef<LinkTemplateContext>;
  @Input() javadocTransformAsText = false;

  private readonly templateRef: TemplateRef<TemplateContext> = inject(TemplateRef);
  private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

  // eslint-disable-next-line sonarjs/slow-regex
  private readonly markdownLinkRegex = /\[([^\]]+)]\(([^)]+)\)/g; // old regex: /\[(.*?)\]\((.+?)\)/g
  private readonly tagsRegex = /<[^>]*>?/gm;
  private readonly linkRegex = /(?:{@link\s(.*?)})/g;

  ngOnChanges(): void {
    if (this.javadocTransformOf === '') this.javadocTransformOf = '-';
    if (!this.javadocTransformOf || !this.javadocTransformElements) return;
    const javadocParts = this.javadocTransformAsText ? this.transformAsText() : this.transformAsHtml();
    this.viewContainerRef.clear();

    for (const partIndexString in javadocParts) {
      const partIndex = +partIndexString;
      const part = javadocParts[partIndex];
      if (this.javadocTransformLink && partIndex % 2 !== 0 && part.startsWith('{')) {
        try {
          const linkData: LinkData = JSON.parse(part);
          this.viewContainerRef.createEmbeddedView<LinkTemplateContext>(this.javadocTransformLink, {
            $implicit: linkData,
          });
        } catch (error) {
          console.error("Can't parse link data", error);
        }
        continue;
      }
      this.viewContainerRef.createEmbeddedView<TemplateContext>(this.templateRef, {
        $implicit: part,
      });
    }
  }

  transformAsHtml(): string[] {
    let value = `${this.javadocTransformOf}`;
    value = value.replace(this.markdownLinkRegex, '<a target="_blank" href="$2" alt="$1">$1</a>');

    if (this.javadocTransformLink) {
      value = value.replace(this.linkRegex, (_, captureGroup) => {
        const linkData = getLinkData(captureGroup, this.javadocTransformElements!);
        if (typeof linkData === 'string') return linkData;
        return `\\"${JSON.stringify(linkData)}\\"`;
      });
      return value.split(String.raw`\"`);
    }
    value = value.replace(this.linkRegex, (_, captureGroup) => {
      const linkData = getLinkData(captureGroup, this.javadocTransformElements!);
      if (typeof linkData === 'string') return linkData;
      return this.defaultLinkTransformation(linkData);
    });

    value = value.replaceAll(String.raw`\"`, '"');
    return [value];
  }

  transformAsText(): string[] {
    let value = `${this.javadocTransformOf}`;
    value = value.replace(this.markdownLinkRegex, '$1($2)');
    value = value.replace(this.tagsRegex, '');
    value = value.replace(this.linkRegex, (_: string, captureGroup: string) => {
      const linkData = getLinkData(captureGroup, this.javadocTransformElements!);
      if (typeof linkData === 'string') return linkData;
      return `${linkData.text}(${linkData.href})`;
    });
    value = value.replaceAll(String.raw`\"`, '"');
    return [value];
  }

  private defaultLinkTransformation(linkData: LinkData): string {
    return `<a href="#/${linkData.href}">${linkData.text}</a>`;
  }
}
