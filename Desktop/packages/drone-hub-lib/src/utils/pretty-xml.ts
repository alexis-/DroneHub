/**
 * XML Pretty Printer
 * Formats XML strings with proper indentation
 */
export class XmlFormatter {
  private readonly shift: string[];
  private readonly step: string;
  private readonly maxdeep: number;

  constructor(indent: string = '  ', maxNestingLevel: number = 100) {
    this.step = indent;
    this.maxdeep = maxNestingLevel;
    this.shift = ['\n'];

    // Initialize array with shifts
    for (let i = 0; i < this.maxdeep; i++) {
      this.shift.push(this.shift[i] + this.step);
    }
  }

  /**
   * Format an XML string with proper indentation
   * @param text The XML string to format
   * @returns Formatted XML string
   */
  public format(text: string): string {
    // First, normalize the input by removing existing whitespace between tags
    const normalized = text.replace(/>\s{0,}</g, "><");

    // Split the text into segments, but preserve xmlns attributes with their elements
    const segments = normalized
      .replace(/</g, "~::~<")
      .replace(/xmlns[^>]*/g, (match) => match.replace(/~::~/g, '')) // Keep xmlns attributes with their elements
      .split('~::~')
      .filter(Boolean); // Remove empty segments

    let result = '';
    let depth = 0;
    let inComment = false;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      // Start comment or <![CDATA[...]]> or <!DOCTYPE
      if (segment.search(/<!/) > -1) {
        result += this.shift[depth] + segment;
        inComment = true;
        // End comment or <![CDATA[...]]>
        if (segment.search(/-->/) > -1 || segment.search(/\]>/) > -1 || segment.search(/!DOCTYPE/) > -1) {
          inComment = false;
        }
      }
      // End comment or <![CDATA[...]]>
      else if (segment.search(/-->/) > -1 || segment.search(/\]>/) > -1) {
        result += segment;
        inComment = false;
      }
      // <elm></elm>
      else if (i > 0 && /^<\w/.exec(segments[i - 1]) && /^<\/\w/.exec(segment)) {
        const openTag = /^<[\w:\-\.\,]+/.exec(segments[i - 1]);
        const closeTag = /^<\/[\w:\-\.\,]+/.exec(segment);
        if (openTag && closeTag && openTag[0] === closeTag[0].replace('/', '')) {
          result += segment;
          if (!inComment) depth--;
        }
      }
      // <elm>
      else if (segment.search(/<\w/) > -1 && segment.search(/<\//) === -1 && segment.search(/\/>/) === -1) {
        result += !inComment ? this.shift[depth++] + segment : segment;
      }
      // <elm>...</elm>
      else if (segment.search(/<\w/) > -1 && segment.search(/<\//) > -1) {
        result += !inComment ? this.shift[depth] + segment : segment;
      }
      // </elm>
      else if (segment.search(/<\//) > -1) {
        result += !inComment ? this.shift[--depth] + segment : segment;
      }
      // <elm/>
      else if (segment.search(/\/>/) > -1) {
        result += !inComment ? this.shift[depth] + segment : segment;
      }
      // <? xml ... ?>
      else if (segment.search(/<\?/) > -1) {
        result += this.shift[depth] + segment;
      }
      else {
        result += segment;
      }
    }

    return result.startsWith('\n') ? result.slice(1) : result;
  }
}

// Create a default instance for convenient usage
export const xmlFormatter = new XmlFormatter();

/**
 * Format an XML string with proper indentation using default settings
 * @param xml The XML string to format
 * @returns Formatted XML string
 */
export function formatXml(xml: string): string {
  return xmlFormatter.format(xml);
}