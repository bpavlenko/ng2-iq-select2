import { AfterViewInit, Component, EventEmitter, forwardRef, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import {IqSelect2Item} from './iq-select2-item';
import {IqSelect2ResultsComponent} from '../iq-select2-results/iq-select2-results.component';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {Messages} from './messages';

const KEY_CODE_DOWN_ARROW = 40;
const KEY_CODE_UP_ARROW = 38;
const KEY_CODE_ENTER = 13;
const KEY_CODE_TAB = 9;
const KEY_CODE_DELETE = 8;
const VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IqSelect2Component),
    multi: true
};
const noop = () => {
};

@Component({
    selector: 'iq-select2',
    template: '<div class="select2-container" [ngClass]="{\'readonly\': disabled}"><ul [class]="getCss()" [style.min-height]="getMinHeight()" (click)="focusInputAndShowResults()" [class.simple-selection]="!multiple" [class.multiple-selection]="multiple" [class.search-focused]="searchFocused"><li *ngFor="let item of selectedItems" class="select2-selected" [class.label]="multiple" [class.label-info]="multiple"><span class="selectedItemText">{{item.text}}</span> <a class="select2-selection-remove" (click)="removeItem(item)" *ngIf="!disabled"><i [class]="deleteIcon" [class.text-info]="!multiple"></i></a></li><li class="select2-input"><input #termInput type="text" [placeholder]="getPlaceholder()" [formControl]="term" [style.width]="getInputWidth()" [class.hideable]="isHideable()" (focus)="onFocus()" (blur)="onBlur()" (keyup)="onKeyUp($event)" (keydown)="onKeyDown($event)" (keypress)="onKeyPress($event)" *ngIf="!disabled"></li></ul><span [class]="searchIcon" *ngIf="minimumInputLength===0" (click)="focusInputAndShowResults()"></span> <span [class]="searchIcon" *ngIf="minimumInputLength!==0"></span><div class="results-container" *ngIf="resultsVisible"><span class="results-msg" *ngIf="listData && (listData.length + selectedItems.length) < resultsCount">{{getCountMessage()}} </span><span class="results-msg no-results-msg" *ngIf="searchFocused && listData && listData.length === 0">{{messages && messages.noResultsAvailableMsg ? messages.noResultsAvailableMsg : NO_RESULTS_MSG}}</span><iq-select2-results #results [selectedItems]="selectedItems" [items]="listData" (itemSelectedEvent)="onItemSelected($event);" [templateRef]="templateRef" [searchFocused]="searchFocused"></iq-select2-results></div></div>',
    styles: ['.select2-container {    position: relative;    width: 100%;}.select2-container.readonly ul {    background: #eee;    cursor: not-allowed;}.select2-input {    list-style-type: none;    margin-left: 5px;    margin-top: 2px;}.select2-input input {    border: none;    outline: none;    float: left;}.select2-selected {    margin: 2px;    float: left;    list-style-type: none;    font-size: 100%;}.multiple-selection .select2-selected {    padding: 4px;}.simple-selection .select2-selected {    border: none;    width: 100%;    padding-left: 5px;    padding-top: 1px;}.simple-selection input {    border: none;    outline: none;    float: left;    position: absolute;    left: 9px;    background: transparent;}.simple-selection a.select2-selection-remove {    text-align: right;    right: 25px;    top: 9px;    position: absolute;    z-index: 2;}.select2-selection-container {    display: block;    overflow: hidden;    background-clip: border-box;    background-attachment: scroll;    height: inherit;    padding: 2px 30px 2px 2px;}.select2-selection-container:hover {    cursor: text;}.select2-selection-remove {    color: rgba(255, 255, 255, 0.4);    font-size: 0.8em;}.select2-selection-remove:hover {    color: rgba(255, 255, 255, 0.8);    cursor: pointer;}.select2-container .search-focused {    outline: 0;    border-color: #66afe9;    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);    box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);}.select2-container ul {    position: relative;    margin-bottom: 0;}.simple-selection.search-focused .selectedItemText {    display: none;}.simple-selection.search-focused input.hideable {    opacity: 1;}.simple-selection input.hideable {    opacity: 0;}.caret {    position: absolute;    right: 10px;    top: 14px;}.search {    color: #337ab7;    position: absolute;    right: 7px;    top: 10px;    font-size: 12px;}.results-msg {    background: whitesmoke;    border-left: 1px solid #ccc;    border-right: 1px solid #ccc;    color: #aaa;    display: block;    font-style: italic;    font-size: 0.9em;    margin: -12px 0 10px;    padding: 5px;}.no-results-msg {    border-bottom: 1px solid #66afe9;    border-color: #66afe9;    outline: 0;}.results-container {    position: absolute;    margin-top: 10px;    width: 100%;    z-index: 3;}.requestInProgress {    background: lightgray;}'],
    providers: [VALUE_ACCESSOR]
})
export class IqSelect2Component<T> implements AfterViewInit, ControlValueAccessor {

    MORE_RESULTS_MSG = 'Showing ' + Messages.PARTIAL_COUNT_VAR + ' of ' + Messages.TOTAL_COUNT_VAR + ' results. Refine your search to show more results.';
    NO_RESULTS_MSG = 'No results available';

    @Input() dataSourceProviderName: string; // Hack for unification of the callback function
    @Input() dataSourceProvider: (term: string, dataSourceProviderName: string) => Observable<T[]>;
    @Input() selectedProvider: (ids: string[], dataSourceProviderName: string) => Observable<T[]>;
    @Input() iqSelect2ItemAdapter: (entity: T) => IqSelect2Item;
    @Input() referenceMode: 'id' | 'entity' = 'id';
    @Input() multiple = false;
    @Input() searchDelay = 250;
    @Input() css: string;
    @Input() placeholder: string = '';
    @Input() minimumInputLength = 2;
    @Input() disabled = false;
    @Input() searchIcon = 'caret';
    @Input() deleteIcon = 'glyphicon glyphicon-remove';
    @Input() messages: Messages = {
        moreResultsAvailableMsg: this.MORE_RESULTS_MSG,
        noResultsAvailableMsg: this.NO_RESULTS_MSG
    };
    @Input() resultsCount;
    @Input() clientMode = false;
    @Output() onSelect: EventEmitter<IqSelect2Item> = new EventEmitter<IqSelect2Item>();
    @Output() onRemove: EventEmitter<IqSelect2Item> = new EventEmitter<IqSelect2Item>();
    @ViewChild('termInput') private termInput;
    @ViewChild('results') results: IqSelect2ResultsComponent;
    templateRef: TemplateRef<T>;
    term = new FormControl();
    resultsVisible = false;
    listData: IqSelect2Item[];
    fullDataList: IqSelect2Item[];
    selectedItems: IqSelect2Item[] = [];
    searchFocused = false;
    private placeholderSelected = '';
    onTouchedCallback: () => void = noop;
    onChangeCallback: (_: any) => void = noop;

    constructor() {
    }

    ngAfterViewInit() {
        this.subscribeToChangesAndLoadDataFromObservable();
    }

    private subscribeToChangesAndLoadDataFromObservable() {
        let observable = this.term.valueChanges
            .debounceTime(this.searchDelay)
            .distinctUntilChanged();
        this.subscribeToResults(observable);
    }

    private subscribeToResults(observable: Observable<string>): void {
        observable
            .do(() => this.resultsVisible = false)
            .filter((term) => term.length >= this.minimumInputLength)
            .switchMap(term => this.loadDataFromObservable(term))
            .map(items => items.filter(item => !(this.multiple && this.alreadySelected(item))))
            .do(() => this.resultsVisible = this.searchFocused)
            .subscribe((items) => this.listData = items);
    }

    private loadDataFromObservable(term: string): Observable<IqSelect2Item[]> {
        return this.clientMode ? this.fetchAndfilterLocalData(term) : this.fetchData(term);
    }

    private fetchAndfilterLocalData(term: string): Observable<IqSelect2Item[]> {
        if (!this.fullDataList) {
            return this.fetchData('')
                .flatMap((items) => {
                    this.fullDataList = items;
                    return this.filterLocalData(term);
                })
        } else {
            return this.filterLocalData(term);
        }
    }

    private filterLocalData(term: string): Observable<IqSelect2Item[]> {
        return Observable.of(this.fullDataList.filter((item) => this.containsText(item, term)));
    }

    private containsText(item, term: string) {
        return item.text.toUpperCase().indexOf(term.toUpperCase()) !== -1;
    }

    private fetchData(term: string): Observable<IqSelect2Item[]> {
        return this
            .dataSourceProvider(term, this.dataSourceProviderName)
            .map((items: T[]) => this.adaptItems(items));
    }

    private adaptItems(items: T[]): IqSelect2Item[] {
        let convertedItems = [];
        items.map((item) => this.iqSelect2ItemAdapter(item))
            .forEach((iqSelect2Item) => convertedItems.push(iqSelect2Item))
        return convertedItems;
    }

    writeValue(selectedValues: any): void {
        if (selectedValues) {
            if (this.referenceMode === 'id') {
                this.populateItemsFromIds(selectedValues);
            } else {
                this.populateItemsFromEntities(selectedValues);
            }
        } else {
            this.selectedItems = [];
        }
    }

    private populateItemsFromEntities(selectedValues: any) {
        if (this.multiple) {
            this.handleMultipleWithEntities(selectedValues);
        } else {
            let iqSelect2Item = this.iqSelect2ItemAdapter(selectedValues);
            this.selectedItems = [iqSelect2Item];
            this.placeholderSelected = iqSelect2Item.text;
        }
    }

    private handleMultipleWithEntities(selectedValues: any) {
        this.selectedItems = [];
        selectedValues.forEach((entity) => {
            let item = this.iqSelect2ItemAdapter(entity);
            let ids = this.getSelectedIds();

            if (ids.indexOf(item.id) === -1) {
                this.selectedItems.push(item);
            }
        });
    }

    private populateItemsFromIds(selectedValues: any) {
        if (this.multiple) {
            this.handleMultipleWithIds(selectedValues);
        } else {
            this.handleSingleWithId(selectedValues);
        }
    }

    private handleMultipleWithIds(selectedValues: any) {
        if (selectedValues !== undefined && this.selectedProvider !== undefined) {
            let uniqueIds = [];
            selectedValues.forEach((id) => {
                if (uniqueIds.indexOf(id) === -1) {
                    uniqueIds.push(id)
                }
            });

            this.selectedProvider(uniqueIds, this.dataSourceProviderName).subscribe((items: T[]) => {
                this.selectedItems = items.map(this.iqSelect2ItemAdapter);
            });
        }
    }

    private handleSingleWithId(id: any) {
        if (id !== undefined && this.selectedProvider !== undefined) {
            this.selectedProvider([id], this.dataSourceProviderName).subscribe((items: T[]) => {
                items.forEach((item) => {
                    let iqSelect2Item = this.iqSelect2ItemAdapter(item);
                    this.selectedItems = [iqSelect2Item];
                    this.placeholderSelected = iqSelect2Item.text;
                });
            });
        }
    }

    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    private alreadySelected(item: IqSelect2Item): boolean {
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

        this.onChangeCallback('id' === this.referenceMode ? this.getSelectedIds() : this.getEntities());
        this.term.patchValue('', {emitEvent: false});
        setTimeout(() => this.focusInput(), 1);
        this.resultsVisible = false;
        this.onSelect.emit(item);
        if (!this.multiple) {
            this.placeholderSelected = item.text;
        }
    }

    private getSelectedIds(): any {
        if (this.multiple) {
            let ids: string[] = [];

            this.selectedItems.forEach(item => ids.push(item.id));

            return ids;
        } else {
            return this.selectedItems.length === 0 ? null : this.selectedItems[0].id;
        }
    }

    private getEntities(): T[] {
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

        this.onChangeCallback('id' === this.referenceMode ? this.getSelectedIds() : this.getEntities());
        this.onRemove.emit(item);
        if (!this.multiple) {
            this.placeholderSelected = '';
        }
    }

    onFocus() {
        this.searchFocused = true;
    }

    onBlur() {
        this.term.patchValue('', {emitEvent: false});
        this.searchFocused = false;
        this.resultsVisible = false;
        this.onTouchedCallback();
    }

    getInputWidth(): string {
        let searchEmpty = this.selectedItems.length === 0 && (this.term.value === null || this.term.value.length === 0);
        let length = this.term.value === null ? 0 : this.term.value.length;
        if (!this.multiple) {
            return '100%';
        } else {
            return searchEmpty ? '100%' : (1 + length * .6) + 'em';
        }
    }

    onKeyUp(ev) {
        if (this.results) {
            if (ev.keyCode === KEY_CODE_DOWN_ARROW) {
                this.results.activeNext();
            } else if (ev.keyCode === KEY_CODE_UP_ARROW) {
                this.results.activePrevious();
            } else if (ev.keyCode === KEY_CODE_ENTER) {
                this.results.selectCurrentItem();
            }
        } else {
            if (this.minimumInputLength === 0) {
                if (ev.keyCode === KEY_CODE_ENTER || ev.keyCode === KEY_CODE_DOWN_ARROW) {
                    this.focusInputAndShowResults();
                }
            }
        }
    }

    onKeyDown(ev) {
        if (this.results) {
            if (ev.keyCode === KEY_CODE_TAB) {
                this.results.selectCurrentItem();
            }
        }

        if (ev.keyCode === KEY_CODE_DELETE) {
            if ((!this.term.value || this.term.value.length === 0) && this.selectedItems.length > 0) {
                this.removeItem(this.selectedItems[this.selectedItems.length - 1]);
            }
        }
    }

    focusInput() {
        if (!this.disabled) {
            this.termInput.nativeElement.focus();
            this.resultsVisible = false;
        }
        this.searchFocused = !this.disabled;
    }

    focusInputAndShowResults() {
        if (!this.disabled) {
            this.termInput.nativeElement.focus();
            this.subscribeToResults(Observable.of(''));
        }
        this.searchFocused = !this.disabled;
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
        return this.selectedItems.length > 0 ? this.placeholderSelected : this.placeholder;
    }

    isHideable(): boolean {
        return !this.multiple && this.placeholderSelected !== '';
    }

    focus(): void {
        this.termInput.nativeElement.focus();
    }

    getCountMessage(): string {
        let msg = this.messages && this.messages.moreResultsAvailableMsg ? this.messages.moreResultsAvailableMsg : this.MORE_RESULTS_MSG;
        msg = msg.replace(Messages.PARTIAL_COUNT_VAR, String(this.listData.length));
        msg = msg.replace(Messages.TOTAL_COUNT_VAR, String(this.resultsCount));
        return msg;
    }

}
