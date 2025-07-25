// ***********************************************************
// title: obsidian-periodic-notes/src/ui/suggest.ts
// project: https://github.com/liamcain/obsidian-periodic-notes
// author: Liam Cain https://github.com/liamcain
// version: Commit fe77f22 on 12 April 2022
//
// MIT License
//
// Copyright (c) 2021 Liam Cain
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { createPopper, type Instance as PopperInstance } from '@popperjs/core';
import { App, type ISuggestOwner, Scope } from 'obsidian';

export const wrapAround = (value: number, size: number): number => {
  return ((value % size) + size) % size;
};

class Suggest<T> {
  private owner: ISuggestOwner<T>;
  private values: T[];
  private suggestions: HTMLDivElement[];
  private selectedItem: number;
  private containerEl: HTMLElement;

  constructor(owner: ISuggestOwner<T>, containerEl: HTMLElement, scope: Scope) {
    this.owner = owner;
    this.containerEl = containerEl;

    containerEl.on('click', '.suggestion-item', this.onSuggestionClick.bind(this));
    containerEl.on(
      'mousemove',
      '.suggestion-item',
      this.onSuggestionMouseover.bind(this)
    );

    scope.register([], 'ArrowUp', (event) => {
      if (!event.isComposing) {
        this.setSelectedItem(this.selectedItem - 1, true);
        return false;
      }
      return true;
    });

    scope.register([], 'ArrowDown', (event) => {
      if (!event.isComposing) {
        this.setSelectedItem(this.selectedItem + 1, true);
        return false;
      }
      return true;
    });

    scope.register([], 'Enter', (event) => {
      if (!event.isComposing) {
        this.useSelectedItem(event);
        return false;
      }
      return true;
    });
  }

  onSuggestionClick(event: MouseEvent, el: HTMLDivElement): void {
    event.preventDefault();

    const item = this.suggestions.indexOf(el);
    this.setSelectedItem(item, false);
    this.useSelectedItem(event);
  }

  onSuggestionMouseover(_event: MouseEvent, el: HTMLDivElement): void {
    const item = this.suggestions.indexOf(el);
    this.setSelectedItem(item, false);
  }

  setSuggestions(values: T[]) {
    this.containerEl.empty();
    const suggestionEls: HTMLDivElement[] = [];

    values.forEach((value) => {
      const suggestionEl = this.containerEl.createDiv('suggestion-item');
      this.owner.renderSuggestion(value, suggestionEl);
      suggestionEls.push(suggestionEl);
    });

    this.values = values;
    this.suggestions = suggestionEls;
    this.setSelectedItem(0, false);
  }

  useSelectedItem(event: MouseEvent | KeyboardEvent) {
    const currentValue = this.values[this.selectedItem];
    if (currentValue) {
      this.owner.selectSuggestion(currentValue, event);
    }
  }

  setSelectedItem(selectedIndex: number, scrollIntoView: boolean) {
    const normalizedIndex = wrapAround(selectedIndex, this.suggestions.length);
    const prevSelectedSuggestion = this.suggestions[this.selectedItem];
    const selectedSuggestion = this.suggestions[normalizedIndex];

    prevSelectedSuggestion?.removeClass('is-selected');
    selectedSuggestion?.addClass('is-selected');

    this.selectedItem = normalizedIndex;

    if (scrollIntoView) {
      selectedSuggestion.scrollIntoView(false);
    }
  }
}

export abstract class TextInputSuggest<T> implements ISuggestOwner<T> {
  protected app: App;
  protected inputEl: HTMLInputElement;

  private popper: PopperInstance;
  private scope: Scope;
  private suggestEl: HTMLElement;
  private suggest: Suggest<T>;

  constructor(app: App, inputEl: HTMLInputElement) {
    this.app = app;
    this.inputEl = inputEl;
    this.scope = new Scope();

    this.suggestEl = createDiv('suggestion-container');
    const suggestion = this.suggestEl.createDiv('suggestion');
    this.suggest = new Suggest(this, suggestion, this.scope);

    this.scope.register([], 'Escape', this.close.bind(this));

    this.inputEl.addEventListener('input', this.onInputChanged.bind(this));
    this.inputEl.addEventListener('focus', this.onInputChanged.bind(this));
    this.inputEl.addEventListener('blur', this.close.bind(this));
    this.suggestEl.on('mousedown', '.suggestion-container', (event: MouseEvent) => {
      event.preventDefault();
    });
  }

  onInputChanged(): void {
    const inputStr = this.inputEl.value;
    const suggestions = this.getSuggestions(inputStr);

    if (suggestions.length > 0) {
      this.suggest.setSuggestions(suggestions);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.open((<any> this.app).dom.appContainerEl, this.inputEl);
    }
  }

  open(container: HTMLElement, inputEl: HTMLElement): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any> this.app).keymap.pushScope(this.scope);

    container.appendChild(this.suggestEl);
    this.popper = createPopper(inputEl, this.suggestEl, {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'sameWidth',
          enabled: true,
          fn: ({ state, instance }) => {
            // Note: positioning needs to be calculated twice -
            // first pass - positioning it according to the width of the popper
            // second pass - position it with the width bound to the reference element
            // we need to early exit to avoid an infinite loop
            const targetWidth = `${state.rects.reference.width}px`;
            if (state.styles.popper.width === targetWidth) {
              return;
            }
            state.styles.popper.width = targetWidth;
            instance.update();
          },
          phase: 'beforeWrite',
          requires: ['computeStyles'],
        },
      ],
    });
  }

  close(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any> this.app).keymap.popScope(this.scope);

    this.suggest.setSuggestions([]);
    this.popper.destroy();
    this.suggestEl.detach();
  }

  abstract getSuggestions(inputStr: string): T[];
  abstract renderSuggestion(item: T, el: HTMLElement): void;
  abstract selectSuggestion(item: T): void;
}
