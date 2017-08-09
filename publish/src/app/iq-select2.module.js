"use strict";
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var http_1 = require('@angular/http');
require('rxjs/add/operator/debounceTime');
require('rxjs/add/operator/distinctUntilChanged');
var iq_select2_component_1 = require('./iq-select2/iq-select2.component');
var iq_select2_results_component_1 = require('./iq-select2-results/iq-select2-results.component');
var common_1 = require('@angular/common');
var iq_select2_template_directive_1 = require('./iq-select2-template/iq-select2-template.directive');
var IqSelect2Module = (function () {
    function IqSelect2Module() {
    }
    IqSelect2Module.decorators = [
        { type: core_1.NgModule, args: [{
                    declarations: [
                        iq_select2_component_1.IqSelect2Component,
                        iq_select2_results_component_1.IqSelect2ResultsComponent,
                        iq_select2_template_directive_1.IqSelect2TemplateDirective
                    ],
                    imports: [
                        common_1.CommonModule,
                        forms_1.FormsModule,
                        http_1.HttpModule,
                        forms_1.ReactiveFormsModule
                    ],
                    exports: [
                        iq_select2_component_1.IqSelect2Component,
                        iq_select2_results_component_1.IqSelect2ResultsComponent,
                        iq_select2_template_directive_1.IqSelect2TemplateDirective
                    ]
                },] },
    ];
    IqSelect2Module.ctorParameters = function () { return []; };
    return IqSelect2Module;
}());
exports.IqSelect2Module = IqSelect2Module;
//# sourceMappingURL=iq-select2.module.js.map