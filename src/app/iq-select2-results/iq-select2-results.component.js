"use strict";
var core_1 = require('@angular/core');
var IqSelect2ResultsComponent = (function () {
    function IqSelect2ResultsComponent() {
        this.itemSelectedEvent = new core_1.EventEmitter();
        this.activeIndex = 0;
        this.ussingKeys = false;
    }
    IqSelect2ResultsComponent.prototype.ngOnInit = function () {
    };
    IqSelect2ResultsComponent.prototype.onItemSelected = function (item) {
        this.itemSelectedEvent.emit(item);
    };
    IqSelect2ResultsComponent.prototype.activeNext = function () {
        if (this.activeIndex >= this.items.length - 1) {
            this.activeIndex = this.items.length - 1;
        }
        else {
            this.activeIndex++;
        }
        this.scrollToElement();
        this.ussingKeys = true;
    };
    IqSelect2ResultsComponent.prototype.activePrevious = function () {
        if (this.activeIndex - 1 < 0) {
            this.activeIndex = 0;
        }
        else {
            this.activeIndex--;
        }
        this.scrollToElement();
        this.ussingKeys = true;
    };
    IqSelect2ResultsComponent.prototype.scrollToElement = function () {
        var element = document.getElementById('item_' + this.activeIndex);
        var container = document.getElementById('resultsContainer');
        if (element) {
            container.scrollTop = element.offsetTop;
        }
    };
    IqSelect2ResultsComponent.prototype.selectCurrentItem = function () {
        if (this.items[this.activeIndex]) {
            this.onItemSelected(this.items[this.activeIndex]);
            this.activeIndex = 0;
        }
    };
    IqSelect2ResultsComponent.prototype.onMouseOver = function (index) {
        if (!this.ussingKeys) {
            this.activeIndex = index;
        }
    };
    IqSelect2ResultsComponent.prototype.onHovering = function (event) {
        this.ussingKeys = false;
    };
    IqSelect2ResultsComponent.prototype.isSelected = function (currentItem) {
        var result = false;
        this.selectedItems.forEach(function (item) {
            if (item.id === currentItem.id) {
                result = true;
            }
        });
        return result;
    };
    IqSelect2ResultsComponent.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'iq-select2-results',
                    template: '<div class="select2-results-container" *ngIf="items !== undefined && items.length > 0" id="resultsContainer"><div *ngFor="let item of items; let i = index;"><div class="select2-result" id="item_{{i}}" (mousedown)="onItemSelected(item)" [class.selected]="isSelected(item)" [class.active]="i === activeIndex" (mouseover)="onMouseOver(i)" (mouseenter)="onHovering($event)"><ng-container [ngTemplateOutlet]="templateRef" [ngOutletContext]="{$item:item, $entity: item.entity, $id:item.id, $index:i}"></ng-container><ng-container *ngIf="!templateRef">{{item.text}}</ng-container></div></div></div>',
                    styles: ['.select2-results-container {    border: 1px solid #ddd;        width: 100%;    max-height: 200px;    overflow-y: auto;    position: absolute;    background: #fff;    margin-top: -11px;    z-index: 3;}.select2-result {    padding: 5px;    position: relative;    width: 100%;}.select2-result:hover {    cursor: pointer;}.active {    background: #337ab7;    color: #fff;}.selected {    background: #EEE;    color: black;}']
                },] },
    ];
    IqSelect2ResultsComponent.ctorParameters = function () { return []; };
    IqSelect2ResultsComponent.propDecorators = {
        'items': [{ type: core_1.Input },],
        'searchFocused': [{ type: core_1.Input },],
        'selectedItems': [{ type: core_1.Input },],
        'templateRef': [{ type: core_1.Input },],
        'itemSelectedEvent': [{ type: core_1.Output },],
    };
    return IqSelect2ResultsComponent;
}());
exports.IqSelect2ResultsComponent = IqSelect2ResultsComponent;
//# sourceMappingURL=iq-select2-results.component.js.map