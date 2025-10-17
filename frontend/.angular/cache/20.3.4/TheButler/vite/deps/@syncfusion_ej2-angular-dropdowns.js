import {
  AutoComplete,
  CheckBoxSelection,
  ComboBox,
  DropDownBase,
  DropDownList,
  DropDownTree,
  FieldSettings,
  Fields,
  ListBox,
  Mention,
  MultiSelect,
  Search,
  SelectionSettings,
  ToolbarSettings,
  TreeSettings,
  VirtualScroll,
  createFloatLabel,
  dropDownBaseClasses,
  dropDownListClasses,
  encodePlaceholder,
  escapeCharRegExp,
  floatLabelBlur,
  floatLabelFocus,
  highlightSearch,
  incrementalSearch,
  removeFloating,
  resetIncrementalSearchValues,
  revertHighlightSearch,
  setPlaceHolder,
  updateFloatLabelState
} from "./chunk-ZT4RRX74.js";
import "./chunk-EDW3CUS2.js";
import "./chunk-K2AJGMRQ.js";
import "./chunk-HP6GMK4O.js";
import "./chunk-WHNIAQAX.js";
import "./chunk-LSAUX22Z.js";
import {
  ComponentBase,
  ComponentMixins,
  FormBase,
  Template,
  setValue
} from "./chunk-LWGRNCSZ.js";
import "./chunk-SUEQP5ZZ.js";
import {
  NG_VALUE_ACCESSOR
} from "./chunk-TXF6FFCB.js";
import {
  CommonModule
} from "./chunk-ATMYRN7M.js";
import "./chunk-YLHXK2KV.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Injector,
  NgModule,
  Renderer2,
  ViewContainerRef,
  forwardRef,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵloadQuery,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵqueryRefresh
} from "./chunk-OTZWD5OV.js";
import {
  __decorate
} from "./chunk-YB2C65QT.js";
import "./chunk-GOMI4DH3.js";

// node_modules/@syncfusion/ej2-angular-dropdowns/fesm2020/syncfusion-ej2-angular-dropdowns.mjs
var _c0 = ["footerTemplate"];
var _c1 = ["headerTemplate"];
var _c2 = ["valueTemplate"];
var _c3 = ["groupTemplate"];
var _c4 = ["itemTemplate"];
var _c5 = ["noRecordsTemplate"];
var _c6 = ["actionFailureTemplate"];
var _c7 = ["displayTemplate"];
var _c8 = ["spinnerTemplate"];
var _c9 = ["*"];
var DropDownListComponent_1;
var inputs$6 = ["actionFailureTemplate", "allowFiltering", "allowObjectBinding", "allowResize", "cssClass", "dataSource", "debounceDelay", "enablePersistence", "enableRtl", "enableVirtualization", "enabled", "fields", "filterBarPlaceholder", "filterType", "floatLabelType", "footerTemplate", "groupTemplate", "headerTemplate", "htmlAttributes", "ignoreAccent", "ignoreCase", "index", "isDeviceFullScreen", "itemTemplate", "locale", "noRecordsTemplate", "placeholder", "popupHeight", "popupWidth", "query", "readonly", "showClearButton", "sortOrder", "text", "value", "valueTemplate", "width", "zIndex"];
var outputs$6 = ["actionBegin", "actionComplete", "actionFailure", "beforeOpen", "blur", "change", "close", "created", "dataBound", "destroyed", "filtering", "focus", "open", "resizeStart", "resizeStop", "resizing", "select", "valueChange"];
var twoWays$6 = ["value"];
var DropDownListComponent = DropDownListComponent_1 = class DropDownListComponent2 extends DropDownList {
  constructor(ngEle, srenderer, viewContainerRef, injector, cdr) {
    super();
    this.ngEle = ngEle;
    this.srenderer = srenderer;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
    this.cdr = cdr;
    this.skipFromEvent = true;
    this.element = this.ngEle.nativeElement;
    this.injectedModules = this.injectedModules || [];
    try {
      let mod = this.injector.get("DropDownsVirtualScroll");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    this.registerEvents(outputs$6);
    this.addTwoWay.call(this, twoWays$6);
    setValue("currentInstance", this, this.viewContainerRef);
    this.formContext = new FormBase();
    this.formCompContext = new ComponentBase();
  }
  registerOnChange(registerFunction) {
  }
  registerOnTouched(registerFunction) {
  }
  writeValue(value) {
  }
  setDisabledState(disabled) {
  }
  ngOnInit() {
    this.formCompContext.ngOnInit(this);
  }
  ngAfterViewInit() {
    this.formContext.ngAfterViewInit(this);
  }
  ngOnDestroy() {
    this.formCompContext.ngOnDestroy(this);
  }
  ngAfterContentChecked() {
    this.formCompContext.ngAfterContentChecked(this);
  }
};
DropDownListComponent.ɵfac = function DropDownListComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DropDownListComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
DropDownListComponent.ɵcmp = ɵɵdefineComponent({
  type: DropDownListComponent,
  selectors: [["ejs-dropdownlist"]],
  contentQueries: function DropDownListComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, _c0, 5);
      ɵɵcontentQuery(dirIndex, _c1, 5);
      ɵɵcontentQuery(dirIndex, _c2, 5);
      ɵɵcontentQuery(dirIndex, _c3, 5);
      ɵɵcontentQuery(dirIndex, _c4, 5);
      ɵɵcontentQuery(dirIndex, _c5, 5);
      ɵɵcontentQuery(dirIndex, _c6, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.footerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.headerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.valueTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.groupTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.itemTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.noRecordsTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.actionFailureTemplate = _t.first);
    }
  },
  inputs: {
    actionFailureTemplate: "actionFailureTemplate",
    allowFiltering: "allowFiltering",
    allowObjectBinding: "allowObjectBinding",
    allowResize: "allowResize",
    cssClass: "cssClass",
    dataSource: "dataSource",
    debounceDelay: "debounceDelay",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enableVirtualization: "enableVirtualization",
    enabled: "enabled",
    fields: "fields",
    filterBarPlaceholder: "filterBarPlaceholder",
    filterType: "filterType",
    floatLabelType: "floatLabelType",
    footerTemplate: "footerTemplate",
    groupTemplate: "groupTemplate",
    headerTemplate: "headerTemplate",
    htmlAttributes: "htmlAttributes",
    ignoreAccent: "ignoreAccent",
    ignoreCase: "ignoreCase",
    index: "index",
    isDeviceFullScreen: "isDeviceFullScreen",
    itemTemplate: "itemTemplate",
    locale: "locale",
    noRecordsTemplate: "noRecordsTemplate",
    placeholder: "placeholder",
    popupHeight: "popupHeight",
    popupWidth: "popupWidth",
    query: "query",
    readonly: "readonly",
    showClearButton: "showClearButton",
    sortOrder: "sortOrder",
    text: "text",
    value: "value",
    valueTemplate: "valueTemplate",
    width: "width",
    zIndex: "zIndex"
  },
  outputs: {
    actionBegin: "actionBegin",
    actionComplete: "actionComplete",
    actionFailure: "actionFailure",
    beforeOpen: "beforeOpen",
    blur: "blur",
    change: "change",
    close: "close",
    created: "created",
    dataBound: "dataBound",
    destroyed: "destroyed",
    filtering: "filtering",
    focus: "focus",
    open: "open",
    resizeStart: "resizeStart",
    resizeStop: "resizeStop",
    resizing: "resizing",
    select: "select",
    valueChange: "valueChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropDownListComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function DropDownListComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
__decorate([Template()], DropDownListComponent.prototype, "footerTemplate", void 0);
__decorate([Template()], DropDownListComponent.prototype, "headerTemplate", void 0);
__decorate([Template()], DropDownListComponent.prototype, "valueTemplate", void 0);
__decorate([Template()], DropDownListComponent.prototype, "groupTemplate", void 0);
__decorate([Template()], DropDownListComponent.prototype, "itemTemplate", void 0);
__decorate([Template("No records found")], DropDownListComponent.prototype, "noRecordsTemplate", void 0);
__decorate([Template("Request failed")], DropDownListComponent.prototype, "actionFailureTemplate", void 0);
DropDownListComponent = DropDownListComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], DropDownListComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DropDownListComponent, [{
    type: Component,
    args: [{
      selector: "ejs-dropdownlist",
      inputs: inputs$6,
      outputs: outputs$6,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DropDownListComponent),
        multi: true
      }],
      queries: {}
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: Renderer2
    }, {
      type: ViewContainerRef
    }, {
      type: Injector
    }, {
      type: ChangeDetectorRef
    }];
  }, {
    footerTemplate: [{
      type: ContentChild,
      args: ["footerTemplate"]
    }],
    headerTemplate: [{
      type: ContentChild,
      args: ["headerTemplate"]
    }],
    valueTemplate: [{
      type: ContentChild,
      args: ["valueTemplate"]
    }],
    groupTemplate: [{
      type: ContentChild,
      args: ["groupTemplate"]
    }],
    itemTemplate: [{
      type: ContentChild,
      args: ["itemTemplate"]
    }],
    noRecordsTemplate: [{
      type: ContentChild,
      args: ["noRecordsTemplate"]
    }],
    actionFailureTemplate: [{
      type: ContentChild,
      args: ["actionFailureTemplate"]
    }]
  });
})();
var DropDownListModule = class {
};
DropDownListModule.ɵfac = function DropDownListModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DropDownListModule)();
};
DropDownListModule.ɵmod = ɵɵdefineNgModule({
  type: DropDownListModule,
  declarations: [DropDownListComponent],
  imports: [CommonModule],
  exports: [DropDownListComponent]
});
DropDownListModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DropDownListModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [DropDownListComponent],
      exports: [DropDownListComponent]
    }]
  }], null, null);
})();
var VirtualScrollService = {
  provide: "DropDownsVirtualScroll",
  useValue: VirtualScroll
};
var DropDownListAllModule = class {
};
DropDownListAllModule.ɵfac = function DropDownListAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DropDownListAllModule)();
};
DropDownListAllModule.ɵmod = ɵɵdefineNgModule({
  type: DropDownListAllModule,
  imports: [CommonModule, DropDownListModule],
  exports: [DropDownListModule]
});
DropDownListAllModule.ɵinj = ɵɵdefineInjector({
  providers: [VirtualScrollService],
  imports: [[CommonModule, DropDownListModule], DropDownListModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DropDownListAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, DropDownListModule],
      exports: [DropDownListModule],
      providers: [VirtualScrollService]
    }]
  }], null, null);
})();
var ComboBoxComponent_1;
var inputs$5 = ["actionFailureTemplate", "allowCustom", "allowFiltering", "allowObjectBinding", "allowResize", "autofill", "cssClass", "dataSource", "debounceDelay", "enablePersistence", "enableRtl", "enableVirtualization", "enabled", "fields", "filterBarPlaceholder", "filterType", "floatLabelType", "footerTemplate", "groupTemplate", "headerTemplate", "htmlAttributes", "ignoreAccent", "ignoreCase", "index", "isDeviceFullScreen", "itemTemplate", "locale", "noRecordsTemplate", "placeholder", "popupHeight", "popupWidth", "query", "readonly", "showClearButton", "sortOrder", "text", "value", "valueTemplate", "width", "zIndex"];
var outputs$5 = ["actionBegin", "actionComplete", "actionFailure", "beforeOpen", "blur", "change", "close", "created", "customValueSpecifier", "dataBound", "destroyed", "filtering", "focus", "open", "resizeStart", "resizeStop", "resizing", "select", "valueChange"];
var twoWays$5 = ["value"];
var ComboBoxComponent = ComboBoxComponent_1 = class ComboBoxComponent2 extends ComboBox {
  constructor(ngEle, srenderer, viewContainerRef, injector, cdr) {
    super();
    this.ngEle = ngEle;
    this.srenderer = srenderer;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
    this.cdr = cdr;
    this.skipFromEvent = true;
    this.element = this.ngEle.nativeElement;
    this.injectedModules = this.injectedModules || [];
    try {
      let mod = this.injector.get("DropDownsVirtualScroll");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    this.registerEvents(outputs$5);
    this.addTwoWay.call(this, twoWays$5);
    setValue("currentInstance", this, this.viewContainerRef);
    this.formContext = new FormBase();
    this.formCompContext = new ComponentBase();
  }
  registerOnChange(registerFunction) {
  }
  registerOnTouched(registerFunction) {
  }
  writeValue(value) {
  }
  setDisabledState(disabled) {
  }
  ngOnInit() {
    this.formCompContext.ngOnInit(this);
  }
  ngAfterViewInit() {
    this.formContext.ngAfterViewInit(this);
  }
  ngOnDestroy() {
    this.formCompContext.ngOnDestroy(this);
  }
  ngAfterContentChecked() {
    this.formCompContext.ngAfterContentChecked(this);
  }
};
ComboBoxComponent.ɵfac = function ComboBoxComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || ComboBoxComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
ComboBoxComponent.ɵcmp = ɵɵdefineComponent({
  type: ComboBoxComponent,
  selectors: [["ejs-combobox"]],
  contentQueries: function ComboBoxComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, _c0, 5);
      ɵɵcontentQuery(dirIndex, _c1, 5);
      ɵɵcontentQuery(dirIndex, _c3, 5);
      ɵɵcontentQuery(dirIndex, _c4, 5);
      ɵɵcontentQuery(dirIndex, _c5, 5);
      ɵɵcontentQuery(dirIndex, _c6, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.footerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.headerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.groupTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.itemTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.noRecordsTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.actionFailureTemplate = _t.first);
    }
  },
  inputs: {
    actionFailureTemplate: "actionFailureTemplate",
    allowCustom: "allowCustom",
    allowFiltering: "allowFiltering",
    allowObjectBinding: "allowObjectBinding",
    allowResize: "allowResize",
    autofill: "autofill",
    cssClass: "cssClass",
    dataSource: "dataSource",
    debounceDelay: "debounceDelay",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enableVirtualization: "enableVirtualization",
    enabled: "enabled",
    fields: "fields",
    filterBarPlaceholder: "filterBarPlaceholder",
    filterType: "filterType",
    floatLabelType: "floatLabelType",
    footerTemplate: "footerTemplate",
    groupTemplate: "groupTemplate",
    headerTemplate: "headerTemplate",
    htmlAttributes: "htmlAttributes",
    ignoreAccent: "ignoreAccent",
    ignoreCase: "ignoreCase",
    index: "index",
    isDeviceFullScreen: "isDeviceFullScreen",
    itemTemplate: "itemTemplate",
    locale: "locale",
    noRecordsTemplate: "noRecordsTemplate",
    placeholder: "placeholder",
    popupHeight: "popupHeight",
    popupWidth: "popupWidth",
    query: "query",
    readonly: "readonly",
    showClearButton: "showClearButton",
    sortOrder: "sortOrder",
    text: "text",
    value: "value",
    valueTemplate: "valueTemplate",
    width: "width",
    zIndex: "zIndex"
  },
  outputs: {
    actionBegin: "actionBegin",
    actionComplete: "actionComplete",
    actionFailure: "actionFailure",
    beforeOpen: "beforeOpen",
    blur: "blur",
    change: "change",
    close: "close",
    created: "created",
    customValueSpecifier: "customValueSpecifier",
    dataBound: "dataBound",
    destroyed: "destroyed",
    filtering: "filtering",
    focus: "focus",
    open: "open",
    resizeStart: "resizeStart",
    resizeStop: "resizeStop",
    resizing: "resizing",
    select: "select",
    valueChange: "valueChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ComboBoxComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function ComboBoxComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
__decorate([Template()], ComboBoxComponent.prototype, "footerTemplate", void 0);
__decorate([Template()], ComboBoxComponent.prototype, "headerTemplate", void 0);
__decorate([Template()], ComboBoxComponent.prototype, "groupTemplate", void 0);
__decorate([Template()], ComboBoxComponent.prototype, "itemTemplate", void 0);
__decorate([Template("No records found")], ComboBoxComponent.prototype, "noRecordsTemplate", void 0);
__decorate([Template("Request failed")], ComboBoxComponent.prototype, "actionFailureTemplate", void 0);
ComboBoxComponent = ComboBoxComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], ComboBoxComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ComboBoxComponent, [{
    type: Component,
    args: [{
      selector: "ejs-combobox",
      inputs: inputs$5,
      outputs: outputs$5,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ComboBoxComponent),
        multi: true
      }],
      queries: {}
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: Renderer2
    }, {
      type: ViewContainerRef
    }, {
      type: Injector
    }, {
      type: ChangeDetectorRef
    }];
  }, {
    footerTemplate: [{
      type: ContentChild,
      args: ["footerTemplate"]
    }],
    headerTemplate: [{
      type: ContentChild,
      args: ["headerTemplate"]
    }],
    groupTemplate: [{
      type: ContentChild,
      args: ["groupTemplate"]
    }],
    itemTemplate: [{
      type: ContentChild,
      args: ["itemTemplate"]
    }],
    noRecordsTemplate: [{
      type: ContentChild,
      args: ["noRecordsTemplate"]
    }],
    actionFailureTemplate: [{
      type: ContentChild,
      args: ["actionFailureTemplate"]
    }]
  });
})();
var ComboBoxModule = class {
};
ComboBoxModule.ɵfac = function ComboBoxModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || ComboBoxModule)();
};
ComboBoxModule.ɵmod = ɵɵdefineNgModule({
  type: ComboBoxModule,
  declarations: [ComboBoxComponent],
  imports: [CommonModule],
  exports: [ComboBoxComponent]
});
ComboBoxModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ComboBoxModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [ComboBoxComponent],
      exports: [ComboBoxComponent]
    }]
  }], null, null);
})();
var ComboBoxAllModule = class {
};
ComboBoxAllModule.ɵfac = function ComboBoxAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || ComboBoxAllModule)();
};
ComboBoxAllModule.ɵmod = ɵɵdefineNgModule({
  type: ComboBoxAllModule,
  imports: [CommonModule, ComboBoxModule],
  exports: [ComboBoxModule]
});
ComboBoxAllModule.ɵinj = ɵɵdefineInjector({
  providers: [],
  imports: [[CommonModule, ComboBoxModule], ComboBoxModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ComboBoxAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, ComboBoxModule],
      exports: [ComboBoxModule],
      providers: []
    }]
  }], null, null);
})();
var AutoCompleteComponent_1;
var inputs$4 = ["actionFailureTemplate", "allowCustom", "allowFiltering", "allowObjectBinding", "allowResize", "autofill", "cssClass", "dataSource", "debounceDelay", "enablePersistence", "enableRtl", "enableVirtualization", "enabled", "fields", "filterBarPlaceholder", "filterType", "floatLabelType", "footerTemplate", "groupTemplate", "headerTemplate", "highlight", "htmlAttributes", "ignoreAccent", "ignoreCase", "index", "isDeviceFullScreen", "itemTemplate", "locale", "minLength", "noRecordsTemplate", "placeholder", "popupHeight", "popupWidth", "query", "readonly", "showClearButton", "showPopupButton", "sortOrder", "suggestionCount", "text", "value", "valueTemplate", "width", "zIndex"];
var outputs$4 = ["actionBegin", "actionComplete", "actionFailure", "beforeOpen", "blur", "change", "close", "created", "customValueSpecifier", "dataBound", "destroyed", "filtering", "focus", "open", "resizeStart", "resizeStop", "resizing", "select", "valueChange"];
var twoWays$4 = ["value"];
var AutoCompleteComponent = AutoCompleteComponent_1 = class AutoCompleteComponent2 extends AutoComplete {
  constructor(ngEle, srenderer, viewContainerRef, injector, cdr) {
    super();
    this.ngEle = ngEle;
    this.srenderer = srenderer;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
    this.cdr = cdr;
    this.skipFromEvent = true;
    this.element = this.ngEle.nativeElement;
    this.injectedModules = this.injectedModules || [];
    try {
      let mod = this.injector.get("DropDownsVirtualScroll");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    this.registerEvents(outputs$4);
    this.addTwoWay.call(this, twoWays$4);
    setValue("currentInstance", this, this.viewContainerRef);
    this.formContext = new FormBase();
    this.formCompContext = new ComponentBase();
  }
  registerOnChange(registerFunction) {
  }
  registerOnTouched(registerFunction) {
  }
  writeValue(value) {
  }
  setDisabledState(disabled) {
  }
  ngOnInit() {
    this.formCompContext.ngOnInit(this);
  }
  ngAfterViewInit() {
    this.formContext.ngAfterViewInit(this);
  }
  ngOnDestroy() {
    this.formCompContext.ngOnDestroy(this);
  }
  ngAfterContentChecked() {
    this.formCompContext.ngAfterContentChecked(this);
  }
};
AutoCompleteComponent.ɵfac = function AutoCompleteComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || AutoCompleteComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
AutoCompleteComponent.ɵcmp = ɵɵdefineComponent({
  type: AutoCompleteComponent,
  selectors: [["ejs-autocomplete"]],
  contentQueries: function AutoCompleteComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, _c0, 5);
      ɵɵcontentQuery(dirIndex, _c1, 5);
      ɵɵcontentQuery(dirIndex, _c3, 5);
      ɵɵcontentQuery(dirIndex, _c4, 5);
      ɵɵcontentQuery(dirIndex, _c5, 5);
      ɵɵcontentQuery(dirIndex, _c6, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.footerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.headerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.groupTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.itemTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.noRecordsTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.actionFailureTemplate = _t.first);
    }
  },
  inputs: {
    actionFailureTemplate: "actionFailureTemplate",
    allowCustom: "allowCustom",
    allowFiltering: "allowFiltering",
    allowObjectBinding: "allowObjectBinding",
    allowResize: "allowResize",
    autofill: "autofill",
    cssClass: "cssClass",
    dataSource: "dataSource",
    debounceDelay: "debounceDelay",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enableVirtualization: "enableVirtualization",
    enabled: "enabled",
    fields: "fields",
    filterBarPlaceholder: "filterBarPlaceholder",
    filterType: "filterType",
    floatLabelType: "floatLabelType",
    footerTemplate: "footerTemplate",
    groupTemplate: "groupTemplate",
    headerTemplate: "headerTemplate",
    highlight: "highlight",
    htmlAttributes: "htmlAttributes",
    ignoreAccent: "ignoreAccent",
    ignoreCase: "ignoreCase",
    index: "index",
    isDeviceFullScreen: "isDeviceFullScreen",
    itemTemplate: "itemTemplate",
    locale: "locale",
    minLength: "minLength",
    noRecordsTemplate: "noRecordsTemplate",
    placeholder: "placeholder",
    popupHeight: "popupHeight",
    popupWidth: "popupWidth",
    query: "query",
    readonly: "readonly",
    showClearButton: "showClearButton",
    showPopupButton: "showPopupButton",
    sortOrder: "sortOrder",
    suggestionCount: "suggestionCount",
    text: "text",
    value: "value",
    valueTemplate: "valueTemplate",
    width: "width",
    zIndex: "zIndex"
  },
  outputs: {
    actionBegin: "actionBegin",
    actionComplete: "actionComplete",
    actionFailure: "actionFailure",
    beforeOpen: "beforeOpen",
    blur: "blur",
    change: "change",
    close: "close",
    created: "created",
    customValueSpecifier: "customValueSpecifier",
    dataBound: "dataBound",
    destroyed: "destroyed",
    filtering: "filtering",
    focus: "focus",
    open: "open",
    resizeStart: "resizeStart",
    resizeStop: "resizeStop",
    resizing: "resizing",
    select: "select",
    valueChange: "valueChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutoCompleteComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function AutoCompleteComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
__decorate([Template()], AutoCompleteComponent.prototype, "footerTemplate", void 0);
__decorate([Template()], AutoCompleteComponent.prototype, "headerTemplate", void 0);
__decorate([Template()], AutoCompleteComponent.prototype, "groupTemplate", void 0);
__decorate([Template()], AutoCompleteComponent.prototype, "itemTemplate", void 0);
__decorate([Template("No records found")], AutoCompleteComponent.prototype, "noRecordsTemplate", void 0);
__decorate([Template("Request failed")], AutoCompleteComponent.prototype, "actionFailureTemplate", void 0);
AutoCompleteComponent = AutoCompleteComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], AutoCompleteComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AutoCompleteComponent, [{
    type: Component,
    args: [{
      selector: "ejs-autocomplete",
      inputs: inputs$4,
      outputs: outputs$4,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AutoCompleteComponent),
        multi: true
      }],
      queries: {}
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: Renderer2
    }, {
      type: ViewContainerRef
    }, {
      type: Injector
    }, {
      type: ChangeDetectorRef
    }];
  }, {
    footerTemplate: [{
      type: ContentChild,
      args: ["footerTemplate"]
    }],
    headerTemplate: [{
      type: ContentChild,
      args: ["headerTemplate"]
    }],
    groupTemplate: [{
      type: ContentChild,
      args: ["groupTemplate"]
    }],
    itemTemplate: [{
      type: ContentChild,
      args: ["itemTemplate"]
    }],
    noRecordsTemplate: [{
      type: ContentChild,
      args: ["noRecordsTemplate"]
    }],
    actionFailureTemplate: [{
      type: ContentChild,
      args: ["actionFailureTemplate"]
    }]
  });
})();
var AutoCompleteModule = class {
};
AutoCompleteModule.ɵfac = function AutoCompleteModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || AutoCompleteModule)();
};
AutoCompleteModule.ɵmod = ɵɵdefineNgModule({
  type: AutoCompleteModule,
  declarations: [AutoCompleteComponent],
  imports: [CommonModule],
  exports: [AutoCompleteComponent]
});
AutoCompleteModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AutoCompleteModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [AutoCompleteComponent],
      exports: [AutoCompleteComponent]
    }]
  }], null, null);
})();
var AutoCompleteAllModule = class {
};
AutoCompleteAllModule.ɵfac = function AutoCompleteAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || AutoCompleteAllModule)();
};
AutoCompleteAllModule.ɵmod = ɵɵdefineNgModule({
  type: AutoCompleteAllModule,
  imports: [CommonModule, AutoCompleteModule],
  exports: [AutoCompleteModule]
});
AutoCompleteAllModule.ɵinj = ɵɵdefineInjector({
  providers: [],
  imports: [[CommonModule, AutoCompleteModule], AutoCompleteModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AutoCompleteAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, AutoCompleteModule],
      exports: [AutoCompleteModule],
      providers: []
    }]
  }], null, null);
})();
var MultiSelectComponent_1;
var inputs$3 = ["actionFailureTemplate", "addTagOnBlur", "allowCustomValue", "allowFiltering", "allowObjectBinding", "allowResize", "changeOnBlur", "closePopupOnSelect", "cssClass", "dataSource", "debounceDelay", "delimiterChar", "enableGroupCheckBox", "enableHtmlSanitizer", "enablePersistence", "enableRtl", "enableSelectionOrder", "enableVirtualization", "enabled", "fields", "filterBarPlaceholder", "filterType", "floatLabelType", "footerTemplate", "groupTemplate", "headerTemplate", "hideSelectedItem", "htmlAttributes", "ignoreAccent", "ignoreCase", "isDeviceFullScreen", "itemTemplate", "locale", "maximumSelectionLength", "mode", "noRecordsTemplate", "openOnClick", "placeholder", "popupHeight", "popupWidth", "query", "readonly", "selectAllText", "showClearButton", "showDropDownIcon", "showSelectAll", "sortOrder", "text", "unSelectAllText", "value", "valueTemplate", "width", "zIndex"];
var outputs$3 = ["actionBegin", "actionComplete", "actionFailure", "beforeOpen", "beforeSelectAll", "blur", "change", "chipSelection", "close", "created", "customValueSelection", "dataBound", "destroyed", "filtering", "focus", "open", "removed", "removing", "resizeStart", "resizeStop", "resizing", "select", "selectedAll", "tagging", "valueChange"];
var twoWays$3 = ["value"];
var MultiSelectComponent = MultiSelectComponent_1 = class MultiSelectComponent2 extends MultiSelect {
  constructor(ngEle, srenderer, viewContainerRef, injector, cdr) {
    super();
    this.ngEle = ngEle;
    this.srenderer = srenderer;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
    this.cdr = cdr;
    this.skipFromEvent = true;
    this.element = this.ngEle.nativeElement;
    this.injectedModules = this.injectedModules || [];
    try {
      let mod = this.injector.get("DropDownsCheckBoxSelection");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    try {
      let mod = this.injector.get("DropDownsVirtualScroll");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    this.registerEvents(outputs$3);
    this.addTwoWay.call(this, twoWays$3);
    setValue("currentInstance", this, this.viewContainerRef);
    this.formContext = new FormBase();
    this.formCompContext = new ComponentBase();
  }
  registerOnChange(registerFunction) {
  }
  registerOnTouched(registerFunction) {
  }
  writeValue(value) {
  }
  setDisabledState(disabled) {
  }
  ngOnInit() {
    this.formCompContext.ngOnInit(this);
  }
  ngAfterViewInit() {
    this.formContext.ngAfterViewInit(this);
  }
  ngOnDestroy() {
    this.formCompContext.ngOnDestroy(this);
  }
  ngAfterContentChecked() {
    this.formCompContext.ngAfterContentChecked(this);
  }
};
MultiSelectComponent.ɵfac = function MultiSelectComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MultiSelectComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
MultiSelectComponent.ɵcmp = ɵɵdefineComponent({
  type: MultiSelectComponent,
  selectors: [["ejs-multiselect"]],
  contentQueries: function MultiSelectComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, _c0, 5);
      ɵɵcontentQuery(dirIndex, _c1, 5);
      ɵɵcontentQuery(dirIndex, _c2, 5);
      ɵɵcontentQuery(dirIndex, _c4, 5);
      ɵɵcontentQuery(dirIndex, _c3, 5);
      ɵɵcontentQuery(dirIndex, _c5, 5);
      ɵɵcontentQuery(dirIndex, _c6, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.footerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.headerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.valueTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.itemTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.groupTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.noRecordsTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.actionFailureTemplate = _t.first);
    }
  },
  inputs: {
    actionFailureTemplate: "actionFailureTemplate",
    addTagOnBlur: "addTagOnBlur",
    allowCustomValue: "allowCustomValue",
    allowFiltering: "allowFiltering",
    allowObjectBinding: "allowObjectBinding",
    allowResize: "allowResize",
    changeOnBlur: "changeOnBlur",
    closePopupOnSelect: "closePopupOnSelect",
    cssClass: "cssClass",
    dataSource: "dataSource",
    debounceDelay: "debounceDelay",
    delimiterChar: "delimiterChar",
    enableGroupCheckBox: "enableGroupCheckBox",
    enableHtmlSanitizer: "enableHtmlSanitizer",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enableSelectionOrder: "enableSelectionOrder",
    enableVirtualization: "enableVirtualization",
    enabled: "enabled",
    fields: "fields",
    filterBarPlaceholder: "filterBarPlaceholder",
    filterType: "filterType",
    floatLabelType: "floatLabelType",
    footerTemplate: "footerTemplate",
    groupTemplate: "groupTemplate",
    headerTemplate: "headerTemplate",
    hideSelectedItem: "hideSelectedItem",
    htmlAttributes: "htmlAttributes",
    ignoreAccent: "ignoreAccent",
    ignoreCase: "ignoreCase",
    isDeviceFullScreen: "isDeviceFullScreen",
    itemTemplate: "itemTemplate",
    locale: "locale",
    maximumSelectionLength: "maximumSelectionLength",
    mode: "mode",
    noRecordsTemplate: "noRecordsTemplate",
    openOnClick: "openOnClick",
    placeholder: "placeholder",
    popupHeight: "popupHeight",
    popupWidth: "popupWidth",
    query: "query",
    readonly: "readonly",
    selectAllText: "selectAllText",
    showClearButton: "showClearButton",
    showDropDownIcon: "showDropDownIcon",
    showSelectAll: "showSelectAll",
    sortOrder: "sortOrder",
    text: "text",
    unSelectAllText: "unSelectAllText",
    value: "value",
    valueTemplate: "valueTemplate",
    width: "width",
    zIndex: "zIndex"
  },
  outputs: {
    actionBegin: "actionBegin",
    actionComplete: "actionComplete",
    actionFailure: "actionFailure",
    beforeOpen: "beforeOpen",
    beforeSelectAll: "beforeSelectAll",
    blur: "blur",
    change: "change",
    chipSelection: "chipSelection",
    close: "close",
    created: "created",
    customValueSelection: "customValueSelection",
    dataBound: "dataBound",
    destroyed: "destroyed",
    filtering: "filtering",
    focus: "focus",
    open: "open",
    removed: "removed",
    removing: "removing",
    resizeStart: "resizeStart",
    resizeStop: "resizeStop",
    resizing: "resizing",
    select: "select",
    selectedAll: "selectedAll",
    tagging: "tagging",
    valueChange: "valueChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiSelectComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function MultiSelectComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
__decorate([Template()], MultiSelectComponent.prototype, "footerTemplate", void 0);
__decorate([Template()], MultiSelectComponent.prototype, "headerTemplate", void 0);
__decorate([Template()], MultiSelectComponent.prototype, "valueTemplate", void 0);
__decorate([Template()], MultiSelectComponent.prototype, "itemTemplate", void 0);
__decorate([Template()], MultiSelectComponent.prototype, "groupTemplate", void 0);
__decorate([Template("No records found")], MultiSelectComponent.prototype, "noRecordsTemplate", void 0);
__decorate([Template("Request failed")], MultiSelectComponent.prototype, "actionFailureTemplate", void 0);
MultiSelectComponent = MultiSelectComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], MultiSelectComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MultiSelectComponent, [{
    type: Component,
    args: [{
      selector: "ejs-multiselect",
      inputs: inputs$3,
      outputs: outputs$3,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MultiSelectComponent),
        multi: true
      }],
      queries: {}
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: Renderer2
    }, {
      type: ViewContainerRef
    }, {
      type: Injector
    }, {
      type: ChangeDetectorRef
    }];
  }, {
    footerTemplate: [{
      type: ContentChild,
      args: ["footerTemplate"]
    }],
    headerTemplate: [{
      type: ContentChild,
      args: ["headerTemplate"]
    }],
    valueTemplate: [{
      type: ContentChild,
      args: ["valueTemplate"]
    }],
    itemTemplate: [{
      type: ContentChild,
      args: ["itemTemplate"]
    }],
    groupTemplate: [{
      type: ContentChild,
      args: ["groupTemplate"]
    }],
    noRecordsTemplate: [{
      type: ContentChild,
      args: ["noRecordsTemplate"]
    }],
    actionFailureTemplate: [{
      type: ContentChild,
      args: ["actionFailureTemplate"]
    }]
  });
})();
var MultiSelectModule = class {
};
MultiSelectModule.ɵfac = function MultiSelectModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MultiSelectModule)();
};
MultiSelectModule.ɵmod = ɵɵdefineNgModule({
  type: MultiSelectModule,
  declarations: [MultiSelectComponent],
  imports: [CommonModule],
  exports: [MultiSelectComponent]
});
MultiSelectModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MultiSelectModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [MultiSelectComponent],
      exports: [MultiSelectComponent]
    }]
  }], null, null);
})();
var CheckBoxSelectionService = {
  provide: "DropDownsCheckBoxSelection",
  useValue: CheckBoxSelection
};
var MultiSelectAllModule = class {
};
MultiSelectAllModule.ɵfac = function MultiSelectAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MultiSelectAllModule)();
};
MultiSelectAllModule.ɵmod = ɵɵdefineNgModule({
  type: MultiSelectAllModule,
  imports: [CommonModule, MultiSelectModule],
  exports: [MultiSelectModule]
});
MultiSelectAllModule.ɵinj = ɵɵdefineInjector({
  providers: [CheckBoxSelectionService],
  imports: [[CommonModule, MultiSelectModule], MultiSelectModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MultiSelectAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, MultiSelectModule],
      exports: [MultiSelectModule],
      providers: [CheckBoxSelectionService]
    }]
  }], null, null);
})();
var ListBoxComponent_1;
var inputs$2 = ["actionFailureTemplate", "allowDragAndDrop", "allowFiltering", "cssClass", "dataSource", "enablePersistence", "enableRtl", "enabled", "fields", "filterBarPlaceholder", "filterType", "groupTemplate", "height", "ignoreAccent", "ignoreCase", "itemTemplate", "locale", "maximumSelectionLength", "noRecordsTemplate", "query", "scope", "selectionSettings", "sortOrder", "toolbarSettings", "value", "zIndex"];
var outputs$2 = ["focus", "blur", "actionBegin", "actionComplete", "actionFailure", "beforeDrop", "beforeItemRender", "change", "created", "dataBound", "destroyed", "drag", "dragStart", "drop", "filtering", "select", "valueChange"];
var twoWays$2 = ["value"];
var ListBoxComponent = ListBoxComponent_1 = class ListBoxComponent2 extends ListBox {
  constructor(ngEle, srenderer, viewContainerRef, injector, cdr) {
    super();
    this.ngEle = ngEle;
    this.srenderer = srenderer;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
    this.cdr = cdr;
    this.element = this.ngEle.nativeElement;
    this.injectedModules = this.injectedModules || [];
    try {
      let mod = this.injector.get("DropDownsCheckBoxSelection");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    this.registerEvents(outputs$2);
    this.addTwoWay.call(this, twoWays$2);
    setValue("currentInstance", this, this.viewContainerRef);
    this.formContext = new FormBase();
    this.formCompContext = new ComponentBase();
  }
  registerOnChange(registerFunction) {
  }
  registerOnTouched(registerFunction) {
  }
  writeValue(value) {
  }
  setDisabledState(disabled) {
  }
  ngOnInit() {
    this.formCompContext.ngOnInit(this);
  }
  ngAfterViewInit() {
    this.formContext.ngAfterViewInit(this);
  }
  ngOnDestroy() {
    this.formCompContext.ngOnDestroy(this);
  }
  ngAfterContentChecked() {
    this.formCompContext.ngAfterContentChecked(this);
  }
};
ListBoxComponent.ɵfac = function ListBoxComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || ListBoxComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
ListBoxComponent.ɵcmp = ɵɵdefineComponent({
  type: ListBoxComponent,
  selectors: [["ejs-listbox"]],
  contentQueries: function ListBoxComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, _c4, 5);
      ɵɵcontentQuery(dirIndex, _c5, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.itemTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.noRecordsTemplate = _t.first);
    }
  },
  inputs: {
    actionFailureTemplate: "actionFailureTemplate",
    allowDragAndDrop: "allowDragAndDrop",
    allowFiltering: "allowFiltering",
    cssClass: "cssClass",
    dataSource: "dataSource",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enabled: "enabled",
    fields: "fields",
    filterBarPlaceholder: "filterBarPlaceholder",
    filterType: "filterType",
    groupTemplate: "groupTemplate",
    height: "height",
    ignoreAccent: "ignoreAccent",
    ignoreCase: "ignoreCase",
    itemTemplate: "itemTemplate",
    locale: "locale",
    maximumSelectionLength: "maximumSelectionLength",
    noRecordsTemplate: "noRecordsTemplate",
    query: "query",
    scope: "scope",
    selectionSettings: "selectionSettings",
    sortOrder: "sortOrder",
    toolbarSettings: "toolbarSettings",
    value: "value",
    zIndex: "zIndex"
  },
  outputs: {
    focus: "focus",
    blur: "blur",
    actionBegin: "actionBegin",
    actionComplete: "actionComplete",
    actionFailure: "actionFailure",
    beforeDrop: "beforeDrop",
    beforeItemRender: "beforeItemRender",
    change: "change",
    created: "created",
    dataBound: "dataBound",
    destroyed: "destroyed",
    drag: "drag",
    dragStart: "dragStart",
    drop: "drop",
    filtering: "filtering",
    select: "select",
    valueChange: "valueChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ListBoxComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function ListBoxComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
__decorate([Template()], ListBoxComponent.prototype, "itemTemplate", void 0);
__decorate([Template("No records found")], ListBoxComponent.prototype, "noRecordsTemplate", void 0);
ListBoxComponent = ListBoxComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], ListBoxComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ListBoxComponent, [{
    type: Component,
    args: [{
      selector: "ejs-listbox",
      inputs: inputs$2,
      outputs: outputs$2,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ListBoxComponent),
        multi: true
      }],
      queries: {}
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: Renderer2
    }, {
      type: ViewContainerRef
    }, {
      type: Injector
    }, {
      type: ChangeDetectorRef
    }];
  }, {
    itemTemplate: [{
      type: ContentChild,
      args: ["itemTemplate"]
    }],
    noRecordsTemplate: [{
      type: ContentChild,
      args: ["noRecordsTemplate"]
    }]
  });
})();
var ListBoxModule = class {
};
ListBoxModule.ɵfac = function ListBoxModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || ListBoxModule)();
};
ListBoxModule.ɵmod = ɵɵdefineNgModule({
  type: ListBoxModule,
  declarations: [ListBoxComponent],
  imports: [CommonModule],
  exports: [ListBoxComponent]
});
ListBoxModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ListBoxModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [ListBoxComponent],
      exports: [ListBoxComponent]
    }]
  }], null, null);
})();
var ListBoxAllModule = class {
};
ListBoxAllModule.ɵfac = function ListBoxAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || ListBoxAllModule)();
};
ListBoxAllModule.ɵmod = ɵɵdefineNgModule({
  type: ListBoxAllModule,
  imports: [CommonModule, ListBoxModule],
  exports: [ListBoxModule]
});
ListBoxAllModule.ɵinj = ɵɵdefineInjector({
  providers: [],
  imports: [[CommonModule, ListBoxModule], ListBoxModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ListBoxAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, ListBoxModule],
      exports: [ListBoxModule],
      providers: []
    }]
  }], null, null);
})();
var DropDownTreeComponent_1;
var inputs$1 = ["actionFailureTemplate", "allowFiltering", "allowMultiSelection", "changeOnBlur", "cssClass", "customTemplate", "delimiterChar", "destroyPopupOnHide", "enableHtmlSanitizer", "enablePersistence", "enableRtl", "enabled", "fields", "filterBarPlaceholder", "filterType", "floatLabelType", "footerTemplate", "headerTemplate", "htmlAttributes", "ignoreAccent", "ignoreCase", "itemTemplate", "locale", "mode", "noRecordsTemplate", "placeholder", "popupHeight", "popupWidth", "readonly", "selectAllText", "showCheckBox", "showClearButton", "showDropDownIcon", "showSelectAll", "sortOrder", "text", "treeSettings", "unSelectAllText", "value", "valueTemplate", "width", "wrapText", "zIndex"];
var outputs$1 = ["actionFailure", "beforeOpen", "blur", "change", "close", "created", "dataBound", "destroyed", "filtering", "focus", "keyPress", "open", "select", "valueChange"];
var twoWays$1 = ["value"];
var DropDownTreeComponent = DropDownTreeComponent_1 = class DropDownTreeComponent2 extends DropDownTree {
  constructor(ngEle, srenderer, viewContainerRef, injector, cdr) {
    super();
    this.ngEle = ngEle;
    this.srenderer = srenderer;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
    this.cdr = cdr;
    this.skipFromEvent = true;
    this.element = this.ngEle.nativeElement;
    this.injectedModules = this.injectedModules || [];
    this.registerEvents(outputs$1);
    this.addTwoWay.call(this, twoWays$1);
    setValue("currentInstance", this, this.viewContainerRef);
    this.formContext = new FormBase();
    this.formCompContext = new ComponentBase();
  }
  registerOnChange(registerFunction) {
  }
  registerOnTouched(registerFunction) {
  }
  writeValue(value) {
  }
  setDisabledState(disabled) {
  }
  ngOnInit() {
    this.formCompContext.ngOnInit(this);
  }
  ngAfterViewInit() {
    this.formContext.ngAfterViewInit(this);
  }
  ngOnDestroy() {
    this.formCompContext.ngOnDestroy(this);
  }
  ngAfterContentChecked() {
    this.formCompContext.ngAfterContentChecked(this);
  }
};
DropDownTreeComponent.ɵfac = function DropDownTreeComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DropDownTreeComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
DropDownTreeComponent.ɵcmp = ɵɵdefineComponent({
  type: DropDownTreeComponent,
  selectors: [["ejs-dropdowntree"]],
  contentQueries: function DropDownTreeComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, _c0, 5);
      ɵɵcontentQuery(dirIndex, _c1, 5);
      ɵɵcontentQuery(dirIndex, _c2, 5);
      ɵɵcontentQuery(dirIndex, _c4, 5);
      ɵɵcontentQuery(dirIndex, _c5, 5);
      ɵɵcontentQuery(dirIndex, _c6, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.footerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.headerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.valueTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.itemTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.noRecordsTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.actionFailureTemplate = _t.first);
    }
  },
  inputs: {
    actionFailureTemplate: "actionFailureTemplate",
    allowFiltering: "allowFiltering",
    allowMultiSelection: "allowMultiSelection",
    changeOnBlur: "changeOnBlur",
    cssClass: "cssClass",
    customTemplate: "customTemplate",
    delimiterChar: "delimiterChar",
    destroyPopupOnHide: "destroyPopupOnHide",
    enableHtmlSanitizer: "enableHtmlSanitizer",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enabled: "enabled",
    fields: "fields",
    filterBarPlaceholder: "filterBarPlaceholder",
    filterType: "filterType",
    floatLabelType: "floatLabelType",
    footerTemplate: "footerTemplate",
    headerTemplate: "headerTemplate",
    htmlAttributes: "htmlAttributes",
    ignoreAccent: "ignoreAccent",
    ignoreCase: "ignoreCase",
    itemTemplate: "itemTemplate",
    locale: "locale",
    mode: "mode",
    noRecordsTemplate: "noRecordsTemplate",
    placeholder: "placeholder",
    popupHeight: "popupHeight",
    popupWidth: "popupWidth",
    readonly: "readonly",
    selectAllText: "selectAllText",
    showCheckBox: "showCheckBox",
    showClearButton: "showClearButton",
    showDropDownIcon: "showDropDownIcon",
    showSelectAll: "showSelectAll",
    sortOrder: "sortOrder",
    text: "text",
    treeSettings: "treeSettings",
    unSelectAllText: "unSelectAllText",
    value: "value",
    valueTemplate: "valueTemplate",
    width: "width",
    wrapText: "wrapText",
    zIndex: "zIndex"
  },
  outputs: {
    actionFailure: "actionFailure",
    beforeOpen: "beforeOpen",
    blur: "blur",
    change: "change",
    close: "close",
    created: "created",
    dataBound: "dataBound",
    destroyed: "destroyed",
    filtering: "filtering",
    focus: "focus",
    keyPress: "keyPress",
    open: "open",
    select: "select",
    valueChange: "valueChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropDownTreeComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function DropDownTreeComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
__decorate([Template()], DropDownTreeComponent.prototype, "footerTemplate", void 0);
__decorate([Template()], DropDownTreeComponent.prototype, "headerTemplate", void 0);
__decorate([Template()], DropDownTreeComponent.prototype, "valueTemplate", void 0);
__decorate([Template()], DropDownTreeComponent.prototype, "itemTemplate", void 0);
__decorate([Template("No Records Found")], DropDownTreeComponent.prototype, "noRecordsTemplate", void 0);
__decorate([Template("The Request Failed")], DropDownTreeComponent.prototype, "actionFailureTemplate", void 0);
DropDownTreeComponent = DropDownTreeComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], DropDownTreeComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DropDownTreeComponent, [{
    type: Component,
    args: [{
      selector: "ejs-dropdowntree",
      inputs: inputs$1,
      outputs: outputs$1,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DropDownTreeComponent),
        multi: true
      }],
      queries: {}
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: Renderer2
    }, {
      type: ViewContainerRef
    }, {
      type: Injector
    }, {
      type: ChangeDetectorRef
    }];
  }, {
    footerTemplate: [{
      type: ContentChild,
      args: ["footerTemplate"]
    }],
    headerTemplate: [{
      type: ContentChild,
      args: ["headerTemplate"]
    }],
    valueTemplate: [{
      type: ContentChild,
      args: ["valueTemplate"]
    }],
    itemTemplate: [{
      type: ContentChild,
      args: ["itemTemplate"]
    }],
    noRecordsTemplate: [{
      type: ContentChild,
      args: ["noRecordsTemplate"]
    }],
    actionFailureTemplate: [{
      type: ContentChild,
      args: ["actionFailureTemplate"]
    }]
  });
})();
var DropDownTreeModule = class {
};
DropDownTreeModule.ɵfac = function DropDownTreeModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DropDownTreeModule)();
};
DropDownTreeModule.ɵmod = ɵɵdefineNgModule({
  type: DropDownTreeModule,
  declarations: [DropDownTreeComponent],
  imports: [CommonModule],
  exports: [DropDownTreeComponent]
});
DropDownTreeModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DropDownTreeModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [DropDownTreeComponent],
      exports: [DropDownTreeComponent]
    }]
  }], null, null);
})();
var DropDownTreeAllModule = class {
};
DropDownTreeAllModule.ɵfac = function DropDownTreeAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DropDownTreeAllModule)();
};
DropDownTreeAllModule.ɵmod = ɵɵdefineNgModule({
  type: DropDownTreeAllModule,
  imports: [CommonModule, DropDownTreeModule],
  exports: [DropDownTreeModule]
});
DropDownTreeAllModule.ɵinj = ɵɵdefineInjector({
  providers: [],
  imports: [[CommonModule, DropDownTreeModule], DropDownTreeModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DropDownTreeAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, DropDownTreeModule],
      exports: [DropDownTreeModule],
      providers: []
    }]
  }], null, null);
})();
var inputs = ["allowSpaces", "cssClass", "dataSource", "debounceDelay", "displayTemplate", "fields", "filterType", "highlight", "ignoreCase", "itemTemplate", "locale", "mentionChar", "minLength", "noRecordsTemplate", "popupHeight", "popupWidth", "query", "requireLeadingSpace", "showMentionChar", "sortOrder", "spinnerTemplate", "suffixText", "suggestionCount", "target"];
var outputs = ["actionBegin", "actionComplete", "actionFailure", "beforeOpen", "change", "closed", "created", "destroyed", "filtering", "opened", "select"];
var twoWays = [""];
var MentionComponent = class MentionComponent2 extends Mention {
  constructor(ngEle, srenderer, viewContainerRef, injector) {
    super();
    this.ngEle = ngEle;
    this.srenderer = srenderer;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
    this.element = this.ngEle.nativeElement;
    this.injectedModules = this.injectedModules || [];
    this.registerEvents(outputs);
    this.addTwoWay.call(this, twoWays);
    setValue("currentInstance", this, this.viewContainerRef);
    this.containerContext = new ComponentBase();
  }
  ngOnInit() {
    this.containerContext.ngOnInit(this);
  }
  ngAfterViewInit() {
    this.containerContext.ngAfterViewInit(this);
  }
  ngOnDestroy() {
    this.containerContext.ngOnDestroy(this);
  }
  ngAfterContentChecked() {
    this.containerContext.ngAfterContentChecked(this);
  }
};
MentionComponent.ɵfac = function MentionComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MentionComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector));
};
MentionComponent.ɵcmp = ɵɵdefineComponent({
  type: MentionComponent,
  selectors: [["ejs-mention"]],
  contentQueries: function MentionComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, _c7, 5);
      ɵɵcontentQuery(dirIndex, _c4, 5);
      ɵɵcontentQuery(dirIndex, _c8, 5);
      ɵɵcontentQuery(dirIndex, _c5, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.displayTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.itemTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.spinnerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.noRecordsTemplate = _t.first);
    }
  },
  inputs: {
    allowSpaces: "allowSpaces",
    cssClass: "cssClass",
    dataSource: "dataSource",
    debounceDelay: "debounceDelay",
    displayTemplate: "displayTemplate",
    fields: "fields",
    filterType: "filterType",
    highlight: "highlight",
    ignoreCase: "ignoreCase",
    itemTemplate: "itemTemplate",
    locale: "locale",
    mentionChar: "mentionChar",
    minLength: "minLength",
    noRecordsTemplate: "noRecordsTemplate",
    popupHeight: "popupHeight",
    popupWidth: "popupWidth",
    query: "query",
    requireLeadingSpace: "requireLeadingSpace",
    showMentionChar: "showMentionChar",
    sortOrder: "sortOrder",
    spinnerTemplate: "spinnerTemplate",
    suffixText: "suffixText",
    suggestionCount: "suggestionCount",
    target: "target"
  },
  outputs: {
    actionBegin: "actionBegin",
    actionComplete: "actionComplete",
    actionFailure: "actionFailure",
    beforeOpen: "beforeOpen",
    change: "change",
    closed: "closed",
    created: "created",
    destroyed: "destroyed",
    filtering: "filtering",
    opened: "opened",
    select: "select"
  },
  standalone: false,
  features: [ɵɵInheritDefinitionFeature],
  ngContentSelectors: _c9,
  decls: 1,
  vars: 0,
  template: function MentionComponent_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵprojection(0);
    }
  },
  encapsulation: 2,
  changeDetection: 0
});
__decorate([Template()], MentionComponent.prototype, "displayTemplate", void 0);
__decorate([Template()], MentionComponent.prototype, "itemTemplate", void 0);
__decorate([Template()], MentionComponent.prototype, "spinnerTemplate", void 0);
__decorate([Template("No records found")], MentionComponent.prototype, "noRecordsTemplate", void 0);
MentionComponent = __decorate([ComponentMixins([ComponentBase])], MentionComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MentionComponent, [{
    type: Component,
    args: [{
      selector: "ejs-mention",
      inputs,
      outputs,
      template: `<ng-content ></ng-content>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      queries: {}
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: Renderer2
    }, {
      type: ViewContainerRef
    }, {
      type: Injector
    }];
  }, {
    displayTemplate: [{
      type: ContentChild,
      args: ["displayTemplate"]
    }],
    itemTemplate: [{
      type: ContentChild,
      args: ["itemTemplate"]
    }],
    spinnerTemplate: [{
      type: ContentChild,
      args: ["spinnerTemplate"]
    }],
    noRecordsTemplate: [{
      type: ContentChild,
      args: ["noRecordsTemplate"]
    }]
  });
})();
var MentionModule = class {
};
MentionModule.ɵfac = function MentionModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MentionModule)();
};
MentionModule.ɵmod = ɵɵdefineNgModule({
  type: MentionModule,
  declarations: [MentionComponent],
  imports: [CommonModule],
  exports: [MentionComponent]
});
MentionModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MentionModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [MentionComponent],
      exports: [MentionComponent]
    }]
  }], null, null);
})();
var MentionAllModule = class {
};
MentionAllModule.ɵfac = function MentionAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MentionAllModule)();
};
MentionAllModule.ɵmod = ɵɵdefineNgModule({
  type: MentionAllModule,
  imports: [CommonModule, MentionModule],
  exports: [MentionModule]
});
MentionAllModule.ɵinj = ɵɵdefineInjector({
  providers: [],
  imports: [[CommonModule, MentionModule], MentionModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MentionAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, MentionModule],
      exports: [MentionModule],
      providers: []
    }]
  }], null, null);
})();
export {
  AutoComplete,
  AutoCompleteAllModule,
  AutoCompleteComponent,
  AutoCompleteModule,
  CheckBoxSelection,
  CheckBoxSelectionService,
  ComboBox,
  ComboBoxAllModule,
  ComboBoxComponent,
  ComboBoxModule,
  DropDownBase,
  DropDownList,
  DropDownListAllModule,
  DropDownListComponent,
  DropDownListModule,
  DropDownTree,
  DropDownTreeAllModule,
  DropDownTreeComponent,
  DropDownTreeModule,
  FieldSettings,
  Fields,
  ListBox,
  ListBoxAllModule,
  ListBoxComponent,
  ListBoxModule,
  Mention,
  MentionAllModule,
  MentionComponent,
  MentionModule,
  MultiSelect,
  MultiSelectAllModule,
  MultiSelectComponent,
  MultiSelectModule,
  Search,
  SelectionSettings,
  ToolbarSettings,
  TreeSettings,
  VirtualScroll,
  VirtualScrollService,
  createFloatLabel,
  dropDownBaseClasses,
  dropDownListClasses,
  encodePlaceholder,
  escapeCharRegExp,
  floatLabelBlur,
  floatLabelFocus,
  highlightSearch,
  incrementalSearch,
  removeFloating,
  resetIncrementalSearchValues,
  revertHighlightSearch,
  setPlaceHolder,
  updateFloatLabelState
};
//# sourceMappingURL=@syncfusion_ej2-angular-dropdowns.js.map
