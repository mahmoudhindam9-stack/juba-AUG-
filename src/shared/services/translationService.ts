export class TranslationService {
  private map: Record<string, string> = {};
  private observer: MutationObserver | null = null;
  private isObserving = false;

  constructor() {
    this.loadMap();
  }

  loadMap(): void {
    if (typeof window === "undefined") return;
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem("custom_text_map") || "{}");
      this.map = parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, string>)
        : {};
    } catch (error) {
      console.warn("Failed to load translation map:", error);
      this.map = {};
    }
  }

  saveMap(newMap: Record<string, string>): void {
    this.map = { ...this.map, ...newMap };
    if (typeof window !== "undefined") {
      localStorage.setItem("custom_text_map", JSON.stringify(this.map));
    }
  }

  getMap(): Record<string, string> {
    return this.map;
  }

  applyToDOM(root: Node): void {
    if (typeof document === "undefined") return;
    if (Object.keys(this.map).length === 0) return;

    if (root.nodeType === Node.TEXT_NODE) {
      const text = root.nodeValue;
      if (text) {
        const trimmed = text.trim();
        if (trimmed && this.map[trimmed] && trimmed !== this.map[trimmed]) {
          root.nodeValue = text.replace(trimmed, this.map[trimmed]);
        }
      }
      return;
    }

    if (root.nodeType === Node.ELEMENT_NODE) {
      const el = root as HTMLElement;
      if (el.tagName === "SCRIPT" || el.tagName === "STYLE" || el.tagName === "NOSCRIPT") return;

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      const nodesToReplace: { node: Node; oldStr: string; newStr: string }[] = [];

      while ((node = walker.nextNode())) {
        const text = node.nodeValue;
        if (text) {
          const trimmed = text.trim();
          if (trimmed && this.map[trimmed] && trimmed !== this.map[trimmed]) {
            nodesToReplace.push({ node, oldStr: trimmed, newStr: this.map[trimmed] });
          }
        }
      }

      nodesToReplace.forEach(({ node: textNode, oldStr, newStr }) => {
        if (textNode.nodeValue) {
          textNode.nodeValue = textNode.nodeValue.replace(oldStr, newStr);
        }
      });
    }
  }

  start(): void {
    if (typeof window === "undefined" || this.isObserving) return;
    if (Object.keys(this.map).length === 0) return;

    this.observer = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            this.applyToDOM(node);
          });
        } else if (mutation.type === "characterData") {
          this.applyToDOM(mutation.target);
        }
      });
    });

    this.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    this.applyToDOM(document.body);
    this.isObserving = true;
  }
}

export const translator = new TranslationService();
