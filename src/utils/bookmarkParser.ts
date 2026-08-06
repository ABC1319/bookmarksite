import type { BookmarkNode, FlatBookmark } from '@/types';

let idCounter = 0;
const nextId = () => `bm_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

/** Extract a readable folder/title from an <h3> or <a> element */
function getText(el: Element): string {
  return (el.textContent || '').trim().replace(/\s+/g, ' ');
}

/** Parse a <dl> list into bookmark nodes */
function parseDl(dl: Element, path: string[] = []): BookmarkNode[] {
  const nodes: BookmarkNode[] = [];
  // Iterate child DT nodes
  const dts = dl.children;
  for (let i = 0; i < dts.length; i++) {
    const dt = dts[i];
    if (dt.tagName.toLowerCase() !== 'dt') continue;

    const h3 = dt.querySelector(':scope > h3');
    const a = dt.querySelector(':scope > a');

    if (h3) {
      const title = getText(h3) || '未命名文件夹';
      const folderNode: BookmarkNode = {
        id: nextId(),
        title,
        isFolder: true,
        children: [],
      };
      // Find the DL that follows this DT (sibling or nested)
      let sibling = dt.nextElementSibling;
      // Some exports put the <dl> inside the <dt>, some as a sibling
      const innerDl = dt.querySelector(':scope > dl') || (sibling && sibling.tagName.toLowerCase() === 'dl' ? sibling : null);
      if (innerDl) {
        folderNode.children = parseDl(innerDl, [...path, title]);
      }
      nodes.push(folderNode);
    } else if (a) {
      const title = getText(a) || (a.getAttribute('href') || '未命名');
      const url = a.getAttribute('href') || '';
      if (!url || url.startsWith('javascript:')) continue;
      const icon = a.getAttribute('icon') || undefined;
      nodes.push({
        id: nextId(),
        title,
        url,
        icon: icon || undefined,
        isFolder: false,
      });
    }
  }
  return nodes;
}

/** Parse a Netscape-format bookmarks HTML string into a tree */
export function parseBookmarksHtml(html: string): BookmarkNode[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // The bookmarks live inside <dl> within the body. Find the first <dl>.
  const topDl = doc.querySelector('dl');
  if (!topDl) return [];
  return parseDl(topDl);
}

/** Count total bookmarks and folders in a tree */
export function countTree(nodes: BookmarkNode[]): { bookmarks: number; folders: number } {
  let bookmarks = 0;
  let folders = 0;
  const walk = (list: BookmarkNode[]) => {
    for (const n of list) {
      if (n.isFolder) {
        folders++;
        if (n.children) walk(n.children);
      } else {
        bookmarks++;
      }
    }
  };
  walk(nodes);
  return { bookmarks, folders };
}

/** Flatten the tree into a list of leaf bookmarks with their folder path */
export function flattenBookmarks(nodes: BookmarkNode[], path: string[] = []): FlatBookmark[] {
  const out: Array<FlatBookmark> = [];
  for (const n of nodes) {
    if (n.isFolder) {
      out.push(...flattenBookmarks(n.children || [], [...path, n.title]));
    } else {
      out.push({ ...n, path });
    }
  }
  return out;
}

/** Escape HTML for safe text insertion */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape text for use inside an HTML attribute value */
function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

function indent(n: number): string {
  return '    '.repeat(n);
}

/** Serialize a tree back to Netscape bookmark HTML for export */
export function serializeBookmarksHtml(nodes: BookmarkNode[]): string {
  const lines: string[] = [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
  ];

  const walk = (list: BookmarkNode[], depth: number) => {
    for (const n of list) {
      if (n.isFolder) {
        lines.push(`${indent(depth + 1)}<DT><H3>${escapeHtml(n.title)}</H3>`);
        lines.push(`${indent(depth + 1)}<DL><p>`);
        if (n.children && n.children.length) walk(n.children, depth + 1);
        lines.push(`${indent(depth + 1)}</DL><p>`);
      } else {
        const iconAttr = n.icon ? ` ICON="${escapeAttr(n.icon)}"` : '';
        const url = escapeAttr(n.url || '');
        lines.push(`${indent(depth + 1)}<DT><A HREF="${url}"${iconAttr}>${escapeHtml(n.title)}</A>`);
      }
    }
  };
  walk(nodes, 1);
  lines.push('</DL><p>');
  return lines.join('\n');
}
