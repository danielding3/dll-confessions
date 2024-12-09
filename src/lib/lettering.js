/**
 * Lettering.js reimagined as a modern ES module
 */
export class Lettering {
  constructor(options = {}) {
    this.defaults = {
      className: 'char',
      wordClass: 'word',
      lineClass: 'line',
      splitOn: ''
    };
    this.settings = { ...this.defaults, ...options };
  }

  /**
   * Split text into individual characters while preserving spaces
   * @param {Element|Element[]|NodeList|string} elements
   * @returns {Element[]}
   */
  letters(elements) {
    const targets = this._getElements(elements);
    
    return targets.map(element => {
      // Store original text and clear element
      const text = element.textContent;
      element.textContent = '';
      
      // Split text into words and spaces
      const parts = text.split(/(\s+)/);
      
      parts.forEach((part, index) => {
        if (part.length === 0) return;
        
        if (part.trim().length === 0) {
          // It's whitespace - preserve it exactly as is
          element.appendChild(document.createTextNode(part));
        } else {
          // It's a word - split into characters
          const wordWrapper = document.createElement('span');
          wordWrapper.className = 'word-wrapper';
          
          [...part].forEach((char, charIndex) => {
            const span = document.createElement('span');
            const globalIndex = this._calculateGlobalIndex(parts, index, charIndex);
            span.className = `${this.settings.className} ${this.settings.className}${globalIndex + 1}`;
            span.textContent = char;
            wordWrapper.appendChild(span);
          });
          
          element.appendChild(wordWrapper);
        }
      });
      
      return element;
    });
  }

  /**
   * Calculate the global index for a character
   * @private
   */
  _calculateGlobalIndex(parts, partIndex, charIndex) {
    let totalChars = 0;
    for (let i = 0; i < partIndex; i++) {
      if (parts[i].trim().length > 0) {
        totalChars += parts[i].length;
      }
    }
    return totalChars + charIndex;
  }

  /**
   * Split text into words while preserving original spacing
   * @param {Element|Element[]|NodeList|string} elements
   * @returns {Element[]}
   */
  words(elements) {
    const targets = this._getElements(elements);
    
    return targets.map(element => {
      const text = element.textContent;
      element.textContent = '';
      
      const parts = text.split(/(\s+)/);
      
      parts.forEach((part, i) => {
        if (part.length === 0) return;
        
        if (part.trim().length === 0) {
          // Preserve whitespace exactly as is
          element.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = `${this.settings.wordClass} ${this.settings.wordClass}${this._getWordIndex(parts, i)}`;
          span.textContent = part;
          element.appendChild(span);
        }
      });
      
      return element;
    });
  }

  /**
   * Calculate the actual word index (excluding spaces)
   * @private
   */
  _getWordIndex(parts, currentIndex) {
    return parts
      .slice(0, currentIndex)
      .filter(part => part.trim().length > 0)
      .length + 1;
  }

  /**
   * Split text into lines
   * @param {Element|Element[]|NodeList|string} elements - DOM elements or selector
   * @returns {Element[]} Array of processed elements
   */
  lines(elements) {
    const targets = this._getElements(elements);
    
    return targets.map(element => {
      const text = element.textContent;
      element.textContent = '';
      
      text.split(/\n/).forEach((line, i) => {
        if (i > 0) element.appendChild(document.createElement('br'));
        const span = document.createElement('span');
        span.className = `${this.settings.lineClass} ${this.settings.lineClass}${i + 1}`;
        span.textContent = line;
        element.appendChild(span);
      });
      
      return element;
    });
  }

  /**
   * Custom split based on regular expression or string
   * @param {Element|Element[]|NodeList|string} elements - DOM elements or selector
   * @param {string|RegExp} splitOn - String or RegExp to split on
   * @returns {Element[]} Array of processed elements
   */
  split(elements, splitOn = this.settings.splitOn) {
    const targets = this._getElements(elements);
    const regex = splitOn instanceof RegExp ? splitOn : new RegExp(splitOn);
    
    return targets.map(element => {
      const text = element.textContent;
      element.textContent = '';
      
      text.split(regex).forEach((part, i) => {
        if (part.length === 0) return;
        const span = document.createElement('span');
        span.className = `${this.settings.className} ${this.settings.className}${i + 1}`;
        span.textContent = part;
        element.appendChild(span);
      });
      
      return element;
    });
  }

  /**
   * Helper to get elements from various input types
   * @private
   */
  _getElements(elements) {
    if (typeof elements === 'string') {
      return Array.from(document.querySelectorAll(elements));
    }
    if (elements instanceof Element) {
      return [elements];
    }
    if (elements instanceof NodeList) {
      return Array.from(elements);
    }
    if (Array.isArray(elements)) {
      return elements;
    }
    throw new Error('Invalid elements parameter');
  }
} 