"use strict";
var core_1 = require('@angular/core');
var iq_select2_component_1 = require('../iq-select2/iq-select2.component');
var IqSelect2TemplateDirective = (function () {
    function IqSelect2TemplateDirective(templateRef, host) {
        this.templateRef = templateRef;
        if (host instanceof iq_select2_component_1.IqSelect2Component) {
            host.templateRef = templateRef;
        }
    }
    IqSelect2TemplateDirective.decorators = [
        { type: core_1.Directive, args: [{ selector: '[iq-select2-template]' },] },
    ];
    IqSelect2TemplateDirective.ctorParameters = function () { return [
        { type: core_1.TemplateRef, },
        { type: iq_select2_component_1.IqSelect2Component, decorators: [{ type: core_1.Host },] },
    ]; };
    return IqSelect2TemplateDirective;
}());
exports.IqSelect2TemplateDirective = IqSelect2TemplateDirective;
//# sourceMappingURL=iq-select2-template.directive.js.map