"use strict";
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var Rx_1 = require('rxjs/Rx');
var messages_1 = require('./messages');
var KEY_CODE_DOWN_ARROW = 40;
var KEY_CODE_UP_ARROW = 38;
var KEY_CODE_ENTER = 13;
var KEY_CODE_TAB = 9;
var KEY_CODE_DELETE = 8;
var VALUE_ACCESSOR = {
    provide: forms_1.NG_VALUE_ACCESSOR,
    useExisting: core_1.forwardRef(function () { return IqSelect2Component; }),
    multi: true
};
var noop = function () {
};
var IqSelect2Component = (function () {
    function IqSelect2Component() {
        this.MORE_RESULTS_MSG = 'Showing ' + messages_1.Messages.PARTIAL_COUNT_VAR + ' of ' + messages_1.Messages.TOTAL_COUNT_VAR + ' results. Refine your search to show more results.';
        this.NO_RESULTS_MSG = 'No results available';
        this.referenceMode = 'id';
        this.multiple = false;
        this.searchDelay = 250;
        this.placeholder = '';
        this.minimumInputLength = 2;
        this.disabled = false;
        this.searchIcon = 'caret';
        this.deleteIcon = 'glyphicon glyphicon-remove';
        this.messages = {
            moreResultsAvailableMsg: this.MORE_RESULTS_MSG,
            noResultsAvailableMsg: this.NO_RESULTS_MSG
        };
        this.clientMode = false;
        this.onSelect = new core_1.EventEmitter();
        this.onRemove = new core_1.EventEmitter();
        this.term = new forms_1.FormControl();
        this.resultsVisible = false;
        this.selectedItems = [];
        this.searchFocused = false;
        this.placeholderSelected = '';
        this.onTouchedCallback = noop;
        this.onChangeCallback = noop;
    }
    IqSelect2Component.prototype.ngAfterViewInit = function () {
        this.subscribeToChangesAndLoadDataFromObservable();
    };
    IqSelect2Component.prototype.subscribeToChangesAndLoadDataFromObservable = function () {
        var observable = this.term.valueChanges
            .debounceTime(this.searchDelay)
            .distinctUntilChanged();
        this.subscribeToResults(observable);
    };
    IqSelect2Component.prototype.subscribeToResults = function (observable) {
        var _this = this;
        observable
            .do(function () { return _this.resultsVisible = false; })
            .filter(function (term) { return term.length >= _this.minimumInputLength; })
            .switchMap(function (term) { return _this.loadDataFromObservable(term); })
            .map(function (items) { return items.filter(function (item) { return !(_this.multiple && _this.alreadySelected(item)); }); })
            .do(function () { return _this.resultsVisible = _this.searchFocused; })
            .subscribe(function (items) { return _this.listData = items; });
    };
    IqSelect2Component.prototype.loadDataFromObservable = function (term) {
        return this.clientMode ? this.fetchAndfilterLocalData(term) : this.fetchData(term);
    };
    IqSelect2Component.prototype.fetchAndfilterLocalData = function (term) {
        var _this = this;
        if (!this.fullDataList) {
            return this.fetchData('')
                .flatMap(function (items) {
                _this.fullDataList = items;
                return _this.filterLocalData(term);
            });
        }
        else {
            return this.filterLocalData(term);
        }
    };
    IqSelect2Component.prototype.filterLocalData = function (term) {
        var _this = this;
        return Rx_1.Observable.of(this.fullDataList.filter(function (item) { return _this.containsText(item, term); }));
    };
    IqSelect2Component.prototype.containsText = function (item, term) {
        return item.text.toUpperCase().indexOf(term.toUpperCase()) !== -1;
    };
    IqSelect2Component.prototype.fetchData = function (term) {
        var _this = this;
        return this
            .dataSourceProvider(term)
            .map(function (items) { return _this.adaptItems(items); });
    };
    IqSelect2Component.prototype.adaptItems = function (items) {
        var _this = this;
        var convertedItems = [];
        items.map(function (item) { return _this.iqSelect2ItemAdapter(item); })
            .forEach(function (iqSelect2Item) { return convertedItems.push(iqSelect2Item); });
        return convertedItems;
    };
    IqSelect2Component.prototype.writeValue = function (selectedValues) {
        if (selectedValues) {
            if (this.referenceMode === 'id') {
                this.populateItemsFromIds(selectedValues);
            }
            else {
                this.populateItemsFromEntities(selectedValues);
            }
        }
        else {
            this.selectedItems = [];
        }
    };
    IqSelect2Component.prototype.populateItemsFromEntities = function (selectedValues) {
        if (this.multiple) {
            this.handleMultipleWithEntities(selectedValues);
        }
        else {
            var iqSelect2Item = this.iqSelect2ItemAdapter(selectedValues);
            this.selectedItems = [iqSelect2Item];
            this.placeholderSelected = iqSelect2Item.text;
        }
    };
    IqSelect2Component.prototype.handleMultipleWithEntities = function (selectedValues) {
        var _this = this;
        this.selectedItems = [];
        selectedValues.forEach(function (entity) {
            var item = _this.iqSelect2ItemAdapter(entity);
            var ids = _this.getSelectedIds();
            if (ids.indexOf(item.id) === -1) {
                _this.selectedItems.push(item);
            }
        });
    };
    IqSelect2Component.prototype.populateItemsFromIds = function (selectedValues) {
        if (this.multiple) {
            this.handleMultipleWithIds(selectedValues);
        }
        else {
            this.handleSingleWithId(selectedValues);
        }
    };
    IqSelect2Component.prototype.handleMultipleWithIds = function (selectedValues) {
        var _this = this;
        if (selectedValues !== undefined && this.selectedProvider !== undefined) {
            var uniqueIds_1 = [];
            selectedValues.forEach(function (id) {
                if (uniqueIds_1.indexOf(id) === -1) {
                    uniqueIds_1.push(id);
                }
            });
            this.selectedProvider(uniqueIds_1).subscribe(function (items) {
                _this.selectedItems = items.map(_this.iqSelect2ItemAdapter);
            });
        }
    };
    IqSelect2Component.prototype.handleSingleWithId = function (id) {
        var _this = this;
        if (id !== undefined && this.selectedProvider !== undefined) {
            this.selectedProvider([id]).subscribe(function (items) {
                items.forEach(function (item) {
                    var iqSelect2Item = _this.iqSelect2ItemAdapter(item);
                    _this.selectedItems = [iqSelect2Item];
                    _this.placeholderSelected = iqSelect2Item.text;
                });
            });
        }
    };
    IqSelect2Component.prototype.registerOnChange = function (fn) {
        this.onChangeCallback = fn;
    };
    IqSelect2Component.prototype.registerOnTouched = function (fn) {
        this.onTouchedCallback = fn;
    };
    IqSelect2Component.prototype.setDisabledState = function (isDisabled) {
        this.disabled = isDisabled;
    };
    IqSelect2Component.prototype.alreadySelected = function (item) {
        var result = false;
        this.selectedItems.forEach(function (selectedItem) {
            if (selectedItem.id === item.id) {
                result = true;
            }
        });
        return result;
    };
    IqSelect2Component.prototype.onItemSelected = function (item) {
        var _this = this;
        if (this.multiple) {
            this.selectedItems.push(item);
            var index = this.listData.indexOf(item, 0);
            if (index > -1) {
                this.listData.splice(index, 1);
            }
        }
        else {
            this.selectedItems.length = 0;
            this.selectedItems.push(item);
        }
        this.onChangeCallback('id' === this.referenceMode ? this.getSelectedIds() : this.getEntities());
        this.term.patchValue('', { emitEvent: false });
        setTimeout(function () { return _this.focusInput(); }, 1);
        this.resultsVisible = false;
        this.onSelect.emit(item);
        if (!this.multiple) {
            this.placeholderSelected = item.text;
        }
    };
    IqSelect2Component.prototype.getSelectedIds = function () {
        if (this.multiple) {
            var ids_1 = [];
            this.selectedItems.forEach(function (item) { return ids_1.push(item.id); });
            return ids_1;
        }
        else {
            return this.selectedItems.length === 0 ? null : this.selectedItems[0].id;
        }
    };
    IqSelect2Component.prototype.getEntities = function () {
        if (this.multiple) {
            var entities_1 = [];
            this.selectedItems.forEach(function (item) {
                entities_1.push(item.entity);
            });
            return entities_1;
        }
        else {
            return this.selectedItems.length === 0 ? null : this.selectedItems[0].entity;
        }
    };
    IqSelect2Component.prototype.removeItem = function (item) {
        var index = this.selectedItems.indexOf(item, 0);
        if (index > -1) {
            this.selectedItems.splice(index, 1);
        }
        this.onChangeCallback('id' === this.referenceMode ? this.getSelectedIds() : this.getEntities());
        this.onRemove.emit(item);
        if (!this.multiple) {
            this.placeholderSelected = '';
        }
    };
    IqSelect2Component.prototype.onFocus = function () {
        this.searchFocused = true;
    };
    IqSelect2Component.prototype.onBlur = function () {
        this.term.patchValue('', { emitEvent: false });
        this.searchFocused = false;
        this.resultsVisible = false;
        this.onTouchedCallback();
    };
    IqSelect2Component.prototype.getInputWidth = function () {
        var searchEmpty = this.selectedItems.length === 0 && (this.term.value === null || this.term.value.length === 0);
        var length = this.term.value === null ? 0 : this.term.value.length;
        if (!this.multiple) {
            return '100%';
        }
        else {
            return searchEmpty ? '100%' : (1 + length * .6) + 'em';
        }
    };
    IqSelect2Component.prototype.onKeyUp = function (ev) {
        if (this.results) {
            if (ev.keyCode === KEY_CODE_DOWN_ARROW) {
                this.results.activeNext();
            }
            else if (ev.keyCode === KEY_CODE_UP_ARROW) {
                this.results.activePrevious();
            }
            else if (ev.keyCode === KEY_CODE_ENTER) {
                this.results.selectCurrentItem();
            }
        }
        else {
            if (this.minimumInputLength === 0) {
                if (ev.keyCode === KEY_CODE_ENTER || ev.keyCode === KEY_CODE_DOWN_ARROW) {
                    this.focusInputAndShowResults();
                }
            }
        }
    };
    IqSelect2Component.prototype.onKeyDown = function (ev) {
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
    };
    IqSelect2Component.prototype.focusInput = function () {
        if (!this.disabled) {
            this.termInput.nativeElement.focus();
            this.resultsVisible = false;
        }
        this.searchFocused = !this.disabled;
    };
    IqSelect2Component.prototype.focusInputAndShowResults = function () {
        if (!this.disabled) {
            this.termInput.nativeElement.focus();
            this.subscribeToResults(Rx_1.Observable.of(''));
        }
        this.searchFocused = !this.disabled;
    };
    IqSelect2Component.prototype.onKeyPress = function (ev) {
        if (ev.keyCode === KEY_CODE_ENTER) {
            ev.preventDefault();
        }
    };
    IqSelect2Component.prototype.getCss = function () {
        return 'select2-selection-container ' + (this.css === undefined ? '' : this.css);
    };
    IqSelect2Component.prototype.getMinHeight = function () {
        var isInputSm = this.css === undefined ? false : this.css.indexOf('input-sm') !== -1;
        return isInputSm ? '30px' : '34px';
    };
    IqSelect2Component.prototype.getPlaceholder = function () {
        return this.selectedItems.length > 0 ? this.placeholderSelected : this.placeholder;
    };
    IqSelect2Component.prototype.isHideable = function () {
        return !this.multiple && this.placeholderSelected !== '';
    };
    IqSelect2Component.prototype.focus = function () {
        this.termInput.nativeElement.focus();
    };
    IqSelect2Component.prototype.getCountMessage = function () {
        var msg = this.messages && this.messages.moreResultsAvailableMsg ? this.messages.moreResultsAvailableMsg : this.MORE_RESULTS_MSG;
        msg = msg.replace(messages_1.Messages.PARTIAL_COUNT_VAR, String(this.listData.length));
        msg = msg.replace(messages_1.Messages.TOTAL_COUNT_VAR, String(this.resultsCount));
        return msg;
    };
    IqSelect2Component.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'iq-select2',
                    template: '<div class="select2-container" [ngClass]="{\'readonly\': disabled}"><ul [class]="getCss()" [style.min-height]="getMinHeight()" (click)="focusInputAndShowResults()" [class.simple-selection]="!multiple" [class.multiple-selection]="multiple" [class.search-focused]="searchFocused"><li *ngFor="let item of selectedItems" class="select2-selected" [class.label]="multiple" [class.label-info]="multiple"><span class="selectedItemText">{{item.text}}</span> <a class="select2-selection-remove" (click)="removeItem(item)" *ngIf="!disabled"><i [class]="deleteIcon" [class.text-info]="!multiple"></i></a></li><li class="select2-input"><input #termInput type="text" [placeholder]="getPlaceholder()" [formControl]="term" [style.width]="getInputWidth()" [class.hideable]="isHideable()" (focus)="onFocus()" (blur)="onBlur()" (keyup)="onKeyUp($event)" (keydown)="onKeyDown($event)" (keypress)="onKeyPress($event)" *ngIf="!disabled"></li></ul><span [class]="searchIcon" *ngIf="minimumInputLength===0" (click)="focusInputAndShowResults()"></span> <span [class]="searchIcon" *ngIf="minimumInputLength!==0"></span><div class="results-container" *ngIf="resultsVisible"><span class="results-msg" *ngIf="listData && (listData.length + selectedItems.length) < resultsCount">{{getCountMessage()}} </span><span class="results-msg no-results-msg" *ngIf="searchFocused && listData && listData.length === 0">{{messages && messages.noResultsAvailableMsg ? messages.noResultsAvailableMsg : NO_RESULTS_MSG}}</span><iq-select2-results #results [selectedItems]="selectedItems" [items]="listData" (itemSelectedEvent)="onItemSelected($event);" [templateRef]="templateRef" [searchFocused]="searchFocused"></iq-select2-results></div></div>',
                    styles: ['.select2-container {    position: relative;    width: 100%;}.select2-container.readonly ul {    background: #eee;    cursor: not-allowed;}.select2-input {    list-style-type: none;    margin-left: 5px;    margin-top: 2px;}.select2-input input {    border: none;    outline: none;    float: left;}.select2-selected {    margin: 2px;    float: left;    list-style-type: none;    font-size: 100%;}.multiple-selection .select2-selected {    padding: 4px;}.simple-selection .select2-selected {    border: none;    width: 100%;    padding-left: 5px;    padding-top: 1px;}.simple-selection input {    border: none;    outline: none;    float: left;    position: absolute;    left: 9px;    background: transparent;}.simple-selection a.select2-selection-remove {    text-align: right;    right: 25px;    top: 9px;    position: absolute;    z-index: 2;}.select2-selection-container {    display: block;    overflow: hidden;    background-clip: border-box;    background-attachment: scroll;    height: inherit;    padding: 2px 30px 2px 2px;}.select2-selection-container:hover {    cursor: text;}.select2-selection-remove {    color: rgba(255, 255, 255, 0.4);    font-size: 0.8em;}.select2-selection-remove:hover {    color: rgba(255, 255, 255, 0.8);    cursor: pointer;}.select2-container .search-focused {    outline: 0;    border-color: #66afe9;    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);    box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);}.select2-container ul {    position: relative;    margin-bottom: 0;}.simple-selection.search-focused .selectedItemText {    display: none;}.simple-selection.search-focused input.hideable {    opacity: 1;}.simple-selection input.hideable {    opacity: 0;}.caret {    position: absolute;    right: 10px;    top: 14px;}.search {    color: #337ab7;    position: absolute;    right: 7px;    top: 10px;    font-size: 12px;}.results-msg {    background: whitesmoke;    border-left: 1px solid #ccc;    border-right: 1px solid #ccc;    color: #aaa;    display: block;    font-style: italic;    font-size: 0.9em;    margin: -12px 0 10px;    padding: 5px;}.no-results-msg {    border-bottom: 1px solid #66afe9;    border-color: #66afe9;    outline: 0;}.results-container {    position: absolute;    margin-top: 10px;    width: 100%;    z-index: 3;}.requestInProgress {    background: lightgray;}'],
                    providers: [VALUE_ACCESSOR]
                },] },
    ];
    IqSelect2Component.ctorParameters = function () { return []; };
    IqSelect2Component.propDecorators = {
        'dataSourceProvider': [{ type: core_1.Input },],
        'selectedProvider': [{ type: core_1.Input },],
        'iqSelect2ItemAdapter': [{ type: core_1.Input },],
        'referenceMode': [{ type: core_1.Input },],
        'multiple': [{ type: core_1.Input },],
        'searchDelay': [{ type: core_1.Input },],
        'css': [{ type: core_1.Input },],
        'placeholder': [{ type: core_1.Input },],
        'minimumInputLength': [{ type: core_1.Input },],
        'disabled': [{ type: core_1.Input },],
        'searchIcon': [{ type: core_1.Input },],
        'deleteIcon': [{ type: core_1.Input },],
        'messages': [{ type: core_1.Input },],
        'resultsCount': [{ type: core_1.Input },],
        'clientMode': [{ type: core_1.Input },],
        'onSelect': [{ type: core_1.Output },],
        'onRemove': [{ type: core_1.Output },],
        'termInput': [{ type: core_1.ViewChild, args: ['termInput',] },],
        'results': [{ type: core_1.ViewChild, args: ['results',] },],
    };
    return IqSelect2Component;
}());
exports.IqSelect2Component = IqSelect2Component;
//# sourceMappingURL=iq-select2.component.js.map