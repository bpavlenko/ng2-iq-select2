import { Component, OnInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import {IqSelect2Item} from '../iq-select2/iq-select2-item';

@Component({
    selector: 'iq-select2-results',
    template: '<div class="select2-results-container" *ngIf="items !== undefined && items.length > 0" id="resultsContainer"><div *ngFor="let item of items; let i = index;"><div class="select2-result" id="item_{{i}}" (mousedown)="onItemSelected(item)" [class.selected]="isSelected(item)" [class.active]="i === activeIndex" (mouseover)="onMouseOver(i)" (mouseenter)="onHovering($event)"><ng-container [ngTemplateOutlet]="templateRef" [ngOutletContext]="{$item:item, $entity: item.entity, $id:item.id, $index:i}"></ng-container><ng-container *ngIf="!templateRef">{{item.text}}</ng-container></div></div></div>',
    styles: ['.select2-results-container {    border: 1px solid #ddd;        width: 100%;    max-height: 200px;    overflow-y: auto;    position: absolute;    background: #fff;    margin-top: -11px;    z-index: 3;}.select2-result {    padding: 5px;    position: relative;    width: 100%;}.select2-result:hover {    cursor: pointer;}.active {    background: #337ab7;    color: #fff;}.selected {    background: #EEE;    color: black;}']
})
export class IqSelect2ResultsComponent implements OnInit {

    @Input() items: IqSelect2Item[];
    @Input() searchFocused: boolean;
    @Input() selectedItems: IqSelect2Item[];
    @Input() templateRef: TemplateRef<any>;
    @Output() itemSelectedEvent: EventEmitter<any> = new EventEmitter();
    activeIndex: number = 0;
    private ussingKeys = false;

    constructor() {
    }

    ngOnInit() {
    }

    onItemSelected(item: IqSelect2Item) {
        this.itemSelectedEvent.emit(item);
    }

    activeNext() {
        if (this.activeIndex >= this.items.length - 1) {
            this.activeIndex = this.items.length - 1;
        } else {
            this.activeIndex++;
        }
        this.scrollToElement();
        this.ussingKeys = true;
    }

    activePrevious() {
        if (this.activeIndex - 1 < 0) {
            this.activeIndex = 0;
        } else {
            this.activeIndex--;
        }
        this.scrollToElement();
        this.ussingKeys = true;
    }

    scrollToElement() {
        let element = document.getElementById('item_' + this.activeIndex);
        let container = document.getElementById('resultsContainer');

        if (element) {
            container.scrollTop = element.offsetTop;
        }
    }

    selectCurrentItem() {
        if (this.items[this.activeIndex]) {
            this.onItemSelected(this.items[this.activeIndex]);
            this.activeIndex = 0;
        }
    }

    onMouseOver(index: number) {
        if (!this.ussingKeys) {
            this.activeIndex = index;
        }
    }

    onHovering(event) {
        this.ussingKeys = false;
    }

    isSelected(currentItem) {
        let result = false;
        this.selectedItems.forEach(item => {
            if (item.id === currentItem.id) {
                result = true;
            }
        });
        return result;
    }

}
