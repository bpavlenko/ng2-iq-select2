import { Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IqSelect2Item } from '../iq-select2/iq-select2-item';
import { IqSelect2ResultsComponent } from '../iq-select2-results/iq-select2-results.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

const KEY_CODE_DOWN_ARROW = 40;
const KEY_CODE_UP_ARROW = 38;
const KEY_CODE_ENTER = 13;
const KEY_CODE_DELETE = 8;
const VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => IqSelect2Component),
  multi: true
};

@Component({
  selector: 'iq-select2',
  templateUrl: './iq-select2.component.html',
  styleUrls: ['./iq-select2.component.css'],
  providers: [VALUE_ACCESSOR]
})
export class IqSelect2Component implements OnInit, ControlValueAccessor {

  @Input() dataCallback: (term: string) => Observable<IqSelect2Item[]>;
  @Input() selectedCallback: (ids: string[]) => Observable<IqSelect2Item[]>;
  @Input() referenceMode: 'id' | 'entity' = 'id';
  @Input() multiple = false;
  @Input() searchDelay = 250;
  @Input() css: string;
  @Input() placeholder: string;
  @Input() minimumInputLength = 2; // Default value, at least two chars to start searching options
  @Output() onSelect: EventEmitter<IqSelect2Item> = new EventEmitter<IqSelect2Item>();
  @Output() onRemove: EventEmitter<IqSelect2Item> = new EventEmitter<IqSelect2Item>();
  @ViewChild('termInput') private termInput;
  @ViewChild('results') private results: IqSelect2ResultsComponent;
  private fullListData: IqSelect2Item[];
  private listData: IqSelect2Item[];
  private selectedItems: IqSelect2Item[] = [];
  private term = new FormControl();
  private searchFocused = false;
  private resultsVisible = false;
  propagateChange = (_: any) => { };

  constructor() { }

  ngOnInit() {
    if (this.minimumInputLength === 0) {
      this.dataCallback.call(this.dataCallback, '').subscribe((items: IqSelect2Item[]) => {
        this.fullListData = [];
        items.forEach(item => {
          this.fullListData.push(item);
        });
        this.listData = this.fullListData;
      });

      this.term.valueChanges
        .debounceTime(this.searchDelay)
        .distinctUntilChanged()
        .subscribe(term => {
          this.resultsVisible = term.length > 0;
          let value: string = this.term.value;
          this.listData = [];
          this.fullListData.forEach(item => {
            if ((!this.alreadySelected(item) || !this.multiple) && item.text.toLowerCase().indexOf(value.toLowerCase()) > -1) {
              this.listData.push(item);
            }
          });
        });
    } else {
      this.term.valueChanges
        .debounceTime(this.searchDelay)
        .distinctUntilChanged()
        .subscribe(term => {
          this.resultsVisible = term.length > 0;

          this.dataCallback.call(this.dataCallback, term).subscribe((items: IqSelect2Item[]) => {
            this.listData = [];
            items.forEach(item => {
              if (!this.alreadySelected(item)) {
                this.listData.push(item);
              }
            });
          });
        });
    }
  }

  writeValue(selectedValues: any): void {
    if (selectedValues !== null) {
      if (this.referenceMode === 'id') {
        this.requestSelectedItems(selectedValues);
      } else {
        this.selectedItems = this.multiple ? selectedValues : [selectedValues];
      }
    }
  }

  requestSelectedItems(selectedValues: any) {
    if (this.multiple) {
      this.handleMultipleWithIds(selectedValues);
    } else {
      this.handleSingleWithId(selectedValues);
    }
  }

  handleMultipleWithIds(selectedValues: any) {
    if (selectedValues !== undefined && this.selectedCallback !== undefined) {
      this.selectedCallback
        .call(this.selectedCallback, selectedValues)
        .subscribe((items: IqSelect2Item[]) => this.selectedItems = items);
    }
  }

  handleSingleWithId(id: any) {
    if (id !== undefined && this.selectedCallback !== undefined) {
      this.selectedCallback
        .call(this.selectedCallback, [id])
        .subscribe((items: IqSelect2Item[]) => this.selectedItems = items);
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(value: any): void {

  }

  alreadySelected(item: IqSelect2Item): boolean {
    let result = false;
    this.selectedItems.forEach(selectedItem => {
      if (selectedItem.id === item.id) {
        result = true;
      }
    });
    return result;
  }

  onItemSelected(item: IqSelect2Item) {
    if (this.multiple) {
      this.selectedItems.push(item);

      let index = this.listData.indexOf(item, 0);

      if (index > -1) {
        this.listData.splice(index, 1);
      }
    } else {
      this.selectedItems.length = 0;
      this.selectedItems.push(item);
    }

    this.propagateChange('id' === this.referenceMode ? this.getSelectedIds() : this.getEntities());
    this.term.patchValue('');
    this.recalulateResultsVisibility();
    this.onSelect.emit(item);
  }

  recalulateResultsVisibility() {
    if (this.termInput) {
      this.resultsVisible = this.termInput.nativeElement.value.length > 0;
    } else {
      this.resultsVisible = false;
    }
  }

  getSelectedIds(): any {
    if (this.multiple) {
      let ids: string[] = [];

      this.selectedItems.forEach(item => {
        ids.push(item.id);
      });

      return ids;
    } else {
      return this.selectedItems.length === 0 ? null : this.selectedItems[0].id;
    }
  }

  getEntities(): any {
    if (this.multiple) {
      let entities = [];

      this.selectedItems.forEach(item => {
        entities.push(item.entity);
      });

      return entities;
    } else {
      return this.selectedItems.length === 0 ? null : this.selectedItems[0].entity;
    }
  }

  removeItem(item: IqSelect2Item) {
    let index = this.selectedItems.indexOf(item, 0);

    if (index > -1) {
      this.selectedItems.splice(index, 1);
    }

    this.propagateChange('id' === this.referenceMode ? this.getSelectedIds() : this.getEntities());
    this.onRemove.emit(item);
  }

  onFocus() {
    this.searchFocused = true;
  }

  onBlur() {
    setTimeout(() => {
      this.recalulateResultsVisibility();
      this.term.patchValue('');
      this.searchFocused = false;
    }, 200);

  }

  getInputWidth(): string {
    let searchEmpty = this.selectedItems.length === 0 && (this.term.value === null || this.term.value.length === 0);
    let length = this.term.value === null ? 0 : this.term.value.length;
    return searchEmpty ? '100%' : (1 + length * .6) + 'em';
  }

  onKeyUp(ev) {
    if (this.results) {
      if (ev.keyCode === KEY_CODE_DOWN_ARROW) {
        this.results.selectNext();
      } else if (ev.keyCode === KEY_CODE_UP_ARROW) {
        this.results.selectPrevious();
      } else if (ev.keyCode === KEY_CODE_ENTER) {
        this.results.selectCurrentItem();
      }
    } else {
      if (ev.keyCode === KEY_CODE_DELETE) {
        if (this.selectedItems.length > 0) {
          this.removeItem(this.selectedItems[this.selectedItems.length - 1]);
        }
      }

      if (this.minimumInputLength === 0) {
        if (ev.keyCode === KEY_CODE_ENTER || ev.keyCode === KEY_CODE_DOWN_ARROW) {
          this.resultsVisible = true;
        }
      }
    }
  }

  focusInput() {
    if (this.multiple || this.selectedItems.length === 0) {
      this.termInput.nativeElement.focus();
      this.searchFocused = true;
    }
    if (this.minimumInputLength === 0) {
      this.resultsVisible = true;
      this.searchFocused = true;
    }
  }

  onKeyPress(ev) {
    if (ev.keyCode === KEY_CODE_ENTER) {
      ev.preventDefault();
    }
  }

  getCss(): string {
    return 'select2-selection-container ' + (this.css === undefined ? '' : this.css);
  }

  getMinHeight(): string {
    let isInputSm: boolean = this.css === undefined ? false : this.css.indexOf('input-sm') !== -1;
    return isInputSm ? '30px' : '34px';
  }

  getPlaceholder(): string {
    return this.selectedItems.length > 0 ? '' : this.placeholder;
  }

}
