import { useMemo } from 'react';

type SafeRichTextProps = {
  html?: string | null;
  className?: string;
};

const ALLOWED_TAGS = new Set(['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'img']);
const ALLOWED_IMG_ATTRS = new Set(['src', 'alt', 'width', 'height']);

function sanitizeRichTextHtml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');

  const sanitizeNode = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      const parent = element.parentNode;
      if (!parent) return;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
      return;
    }

    if (tag === 'img') {
      for (const attr of Array.from(element.attributes)) {
        if (!ALLOWED_IMG_ATTRS.has(attr.name.toLowerCase())) {
          element.removeAttribute(attr.name);
        }
      }

      const src = element.getAttribute('src')?.trim() ?? '';
      const isCloudinary = /^https:\/\/res\.cloudinary\.com\//i.test(src);
      if (!isCloudinary) {
        element.remove();
        return;
      }
    } else {
      for (const attr of Array.from(element.attributes)) {
        element.removeAttribute(attr.name);
      }
    }

    for (const child of Array.from(element.childNodes)) {
      sanitizeNode(child);
    }
  };

  for (const child of Array.from(doc.body.childNodes)) {
    sanitizeNode(child);
  }

  return doc.body.innerHTML;
}

export function SafeRichText({ html, className }: SafeRichTextProps) {
  const sanitized = useMemo(() => sanitizeRichTextHtml(html ?? ''), [html]);
  if (!sanitized) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

