import { TemplateRef } from '@angular/core';
import { IqSelect2Component } from '../iq-select2/iq-select2.component';
export declare class IqSelect2TemplateDirective<T> {
    private templateRef;
    constructor(templateRef: TemplateRef<T>, host: IqSelect2Component<T>);
}
