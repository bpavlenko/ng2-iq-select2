import { OnInit, EventEmitter, TemplateRef } from '@angular/core';
import { IqSelect2Item } from '../iq-select2/iq-select2-item';
export declare class IqSelect2ResultsComponent implements OnInit {
    items: IqSelect2Item[];
    searchFocused: boolean;
    selectedItems: IqSelect2Item[];
    templateRef: TemplateRef<any>;
    itemSelectedEvent: EventEmitter<any>;
    activeIndex: number;
    private ussingKeys;
    constructor();
    ngOnInit(): void;
    onItemSelected(item: IqSelect2Item): void;
    activeNext(): void;
    activePrevious(): void;
    scrollToElement(): void;
    selectCurrentItem(): void;
    onMouseOver(index: number): void;
    onHovering(event: any): void;
    isSelected(currentItem: any): boolean;
}
