import { Directive, inject, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { getLinkData, LinkData } from '../javadoc';
import { ElementClass } from '../frankdoc.types';

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
  @Input({ required: true }) fdJavadocTransformOf?: string;
  @Input({ required: true }) fdJavadocTransformElements!: Record<string, ElementClass> | null;
  @Input() fdJavadocTransformLink?: TemplateRef<LinkTemplateContext>;
  @Input() fdJavadocTransformAsText = false;

  private readonly templateRef: TemplateRef<TemplateContext> = inject(TemplateRef);
  private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

  // eslint-disable-next-line sonarjs/slow-regex
  private readonly markdownLinkRegex = /\[([^\]]+)]\(([^)]+)\)/g; // old regex: /\[(.*?)\]\((.+?)\)/g
  private readonly tagsRegex = /<[^>]*>?/gm;
  private readonly linkRegex = /(?:{@link\s(.*?)})/g;

  ngOnChanges(): void {
    if (this.fdJavadocTransformOf === '') this.fdJavadocTransformOf = '-';
    if (!this.fdJavadocTransformOf || !this.fdJavadocTransformElements) return;
    const javadocParts = this.fdJavadocTransformAsText ? this.transformAsText() : this.transformAsHtml();
    this.viewContainerRef.clear();

    for (const partIndexString in javadocParts) {
      const partIndex = +partIndexString;
      const part = javadocParts[partIndex];
      if (this.fdJavadocTransformLink && partIndex % 2 !== 0 && part.startsWith('{')) {
        try {
          const linkData: LinkData = JSON.parse(part);
          this.viewContainerRef.createEmbeddedView<LinkTemplateContext>(this.fdJavadocTransformLink, {
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
    let value = `${this.fdJavadocTransformOf}`;
    value = value.replace(this.markdownLinkRegex, '<a target="_blank" href="$2" alt="$1">$1</a>');

    if (this.fdJavadocTransformLink) {
      value = value.replace(this.linkRegex, (_, captureGroup) => {
        const linkData = getLinkData(captureGroup, this.fdJavadocTransformElements!);
        if (linkData.href) return `\\"${JSON.stringify(linkData)}\\"`;
        return linkData.text;
      });
      return value.split(String.raw`\"`);
    }
    value = value.replace(this.linkRegex, (_, captureGroup) => {
      const linkData = getLinkData(captureGroup, this.fdJavadocTransformElements!);
      if (linkData.href) return this.defaultLinkTransformation(linkData);
      return linkData.text;
    });

    value = value.replaceAll(String.raw`\"`, '"');
    return [value];
  }

  transformAsText(): string[] {
    let value = `${this.fdJavadocTransformOf}`;
    value = value.replace(this.markdownLinkRegex, '$1($2)');
    value = value.replace(this.tagsRegex, '');
    value = value.replace(this.linkRegex, (_: string, captureGroup: string) => {
      const linkData = getLinkData(captureGroup, this.fdJavadocTransformElements!);
      if (linkData.href) return `${linkData.text}(${linkData.href})`;
      return linkData.text;
    });
    value = value.replaceAll(String.raw`\"`, '"');
    return [value];
  }

  private defaultLinkTransformation(linkData: LinkData): string {
    return `<a href="#/${linkData.href}">${linkData.text}</a>`;
  }
}
