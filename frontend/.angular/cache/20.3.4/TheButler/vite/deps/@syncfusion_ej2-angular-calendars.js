import {
  Calendar,
  CalendarBase,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  Islamic,
  MaskedDateTime,
  Presets,
  TimeMaskPlaceholder,
  TimePicker,
  TimePickerBase
} from "./chunk-WCKOTBKT.js";
import "./chunk-HP6GMK4O.js";
import "./chunk-WHNIAQAX.js";
import "./chunk-LSAUX22Z.js";
import {
  ArrayBase,
  ComplexBase,
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
  ContentChildren,
  Directive,
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
  ɵɵdefineDirective,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵloadQuery,
  ɵɵqueryRefresh
} from "./chunk-OTZWD5OV.js";
import {
  __decorate
} from "./chunk-YB2C65QT.js";
import "./chunk-GOMI4DH3.js";

// node_modules/@syncfusion/ej2-angular-calendars/fesm2020/syncfusion-ej2-angular-calendars.mjs
var _c0 = ["start"];
var _c1 = ["end"];
var CalendarComponent_1;
var inputs$4 = ["calendarMode", "cssClass", "dayHeaderFormat", "depth", "enablePersistence", "enableRtl", "enabled", "firstDayOfWeek", "isMultiSelection", "keyConfigs", "locale", "max", "min", "serverTimezoneOffset", "showTodayButton", "start", "value", "values", "weekNumber", "weekRule"];
var outputs$5 = ["focus", "blur", "change", "created", "destroyed", "navigated", "renderDayCell", "valueChange", "valuesChange"];
var twoWays$4 = ["value", "values"];
var CalendarComponent = CalendarComponent_1 = class CalendarComponent2 extends Calendar {
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
      let mod = this.injector.get("CalendarsIslamic");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    this.registerEvents(outputs$5);
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
CalendarComponent.ɵfac = function CalendarComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || CalendarComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
CalendarComponent.ɵcmp = ɵɵdefineComponent({
  type: CalendarComponent,
  selectors: [["ejs-calendar"]],
  inputs: {
    calendarMode: "calendarMode",
    cssClass: "cssClass",
    dayHeaderFormat: "dayHeaderFormat",
    depth: "depth",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enabled: "enabled",
    firstDayOfWeek: "firstDayOfWeek",
    isMultiSelection: "isMultiSelection",
    keyConfigs: "keyConfigs",
    locale: "locale",
    max: "max",
    min: "min",
    serverTimezoneOffset: "serverTimezoneOffset",
    showTodayButton: "showTodayButton",
    start: "start",
    value: "value",
    values: "values",
    weekNumber: "weekNumber",
    weekRule: "weekRule"
  },
  outputs: {
    focus: "focus",
    blur: "blur",
    change: "change",
    created: "created",
    destroyed: "destroyed",
    navigated: "navigated",
    renderDayCell: "renderDayCell",
    valueChange: "valueChange",
    valuesChange: "valuesChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CalendarComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function CalendarComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
CalendarComponent = CalendarComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], CalendarComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CalendarComponent, [{
    type: Component,
    args: [{
      selector: "ejs-calendar",
      inputs: inputs$4,
      outputs: outputs$5,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CalendarComponent),
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
  }, null);
})();
var CalendarModule = class {
};
CalendarModule.ɵfac = function CalendarModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || CalendarModule)();
};
CalendarModule.ɵmod = ɵɵdefineNgModule({
  type: CalendarModule,
  declarations: [CalendarComponent],
  imports: [CommonModule],
  exports: [CalendarComponent]
});
CalendarModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CalendarModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [CalendarComponent],
      exports: [CalendarComponent]
    }]
  }], null, null);
})();
var IslamicService = {
  provide: "CalendarsIslamic",
  useValue: Islamic
};
var CalendarAllModule = class {
};
CalendarAllModule.ɵfac = function CalendarAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || CalendarAllModule)();
};
CalendarAllModule.ɵmod = ɵɵdefineNgModule({
  type: CalendarAllModule,
  imports: [CommonModule, CalendarModule],
  exports: [CalendarModule]
});
CalendarAllModule.ɵinj = ɵɵdefineInjector({
  providers: [IslamicService],
  imports: [[CommonModule, CalendarModule], CalendarModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CalendarAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, CalendarModule],
      exports: [CalendarModule],
      providers: [IslamicService]
    }]
  }], null, null);
})();
var DatePickerComponent_1;
var inputs$3 = ["allowEdit", "calendarMode", "cssClass", "dayHeaderFormat", "depth", "enableMask", "enablePersistence", "enableRtl", "enabled", "firstDayOfWeek", "floatLabelType", "format", "fullScreenMode", "htmlAttributes", "inputFormats", "isMultiSelection", "keyConfigs", "locale", "maskPlaceholder", "max", "min", "openOnFocus", "placeholder", "readonly", "serverTimezoneOffset", "showClearButton", "showTodayButton", "start", "strictMode", "value", "values", "weekNumber", "weekRule", "width", "zIndex"];
var outputs$4 = ["blur", "change", "cleared", "close", "created", "destroyed", "focus", "navigated", "open", "renderDayCell", "valueChange"];
var twoWays$3 = ["value"];
var DatePickerComponent = DatePickerComponent_1 = class DatePickerComponent2 extends DatePicker {
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
      let mod = this.injector.get("CalendarsIslamic");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    try {
      let mod = this.injector.get("CalendarsMaskedDateTime");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    this.registerEvents(outputs$4);
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
DatePickerComponent.ɵfac = function DatePickerComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DatePickerComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
DatePickerComponent.ɵcmp = ɵɵdefineComponent({
  type: DatePickerComponent,
  selectors: [["ejs-datepicker"]],
  inputs: {
    allowEdit: "allowEdit",
    calendarMode: "calendarMode",
    cssClass: "cssClass",
    dayHeaderFormat: "dayHeaderFormat",
    depth: "depth",
    enableMask: "enableMask",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enabled: "enabled",
    firstDayOfWeek: "firstDayOfWeek",
    floatLabelType: "floatLabelType",
    format: "format",
    fullScreenMode: "fullScreenMode",
    htmlAttributes: "htmlAttributes",
    inputFormats: "inputFormats",
    isMultiSelection: "isMultiSelection",
    keyConfigs: "keyConfigs",
    locale: "locale",
    maskPlaceholder: "maskPlaceholder",
    max: "max",
    min: "min",
    openOnFocus: "openOnFocus",
    placeholder: "placeholder",
    readonly: "readonly",
    serverTimezoneOffset: "serverTimezoneOffset",
    showClearButton: "showClearButton",
    showTodayButton: "showTodayButton",
    start: "start",
    strictMode: "strictMode",
    value: "value",
    values: "values",
    weekNumber: "weekNumber",
    weekRule: "weekRule",
    width: "width",
    zIndex: "zIndex"
  },
  outputs: {
    blur: "blur",
    change: "change",
    cleared: "cleared",
    close: "close",
    created: "created",
    destroyed: "destroyed",
    focus: "focus",
    navigated: "navigated",
    open: "open",
    renderDayCell: "renderDayCell",
    valueChange: "valueChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function DatePickerComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
DatePickerComponent = DatePickerComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], DatePickerComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DatePickerComponent, [{
    type: Component,
    args: [{
      selector: "ejs-datepicker",
      inputs: inputs$3,
      outputs: outputs$4,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DatePickerComponent),
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
  }, null);
})();
var DatePickerModule = class {
};
DatePickerModule.ɵfac = function DatePickerModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DatePickerModule)();
};
DatePickerModule.ɵmod = ɵɵdefineNgModule({
  type: DatePickerModule,
  declarations: [DatePickerComponent],
  imports: [CommonModule],
  exports: [DatePickerComponent]
});
DatePickerModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DatePickerModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [DatePickerComponent],
      exports: [DatePickerComponent]
    }]
  }], null, null);
})();
var MaskedDateTimeService = {
  provide: "CalendarsMaskedDateTime",
  useValue: MaskedDateTime
};
var DatePickerAllModule = class {
};
DatePickerAllModule.ɵfac = function DatePickerAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DatePickerAllModule)();
};
DatePickerAllModule.ɵmod = ɵɵdefineNgModule({
  type: DatePickerAllModule,
  imports: [CommonModule, DatePickerModule],
  exports: [DatePickerModule]
});
DatePickerAllModule.ɵinj = ɵɵdefineInjector({
  providers: [MaskedDateTimeService],
  imports: [[CommonModule, DatePickerModule], DatePickerModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DatePickerAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, DatePickerModule],
      exports: [DatePickerModule],
      providers: [MaskedDateTimeService]
    }]
  }], null, null);
})();
var TimePickerComponent_1;
var inputs$2 = ["allowEdit", "cssClass", "enableMask", "enablePersistence", "enableRtl", "enabled", "floatLabelType", "format", "fullScreenMode", "htmlAttributes", "keyConfigs", "locale", "maskPlaceholder", "max", "min", "openOnFocus", "placeholder", "readonly", "scrollTo", "serverTimezoneOffset", "showClearButton", "step", "strictMode", "value", "width", "zIndex"];
var outputs$3 = ["blur", "change", "cleared", "close", "created", "destroyed", "focus", "itemRender", "open", "valueChange"];
var twoWays$2 = ["value"];
var TimePickerComponent = TimePickerComponent_1 = class TimePickerComponent2 extends TimePicker {
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
      let mod = this.injector.get("CalendarsMaskedDateTime");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    this.registerEvents(outputs$3);
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
TimePickerComponent.ɵfac = function TimePickerComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || TimePickerComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
TimePickerComponent.ɵcmp = ɵɵdefineComponent({
  type: TimePickerComponent,
  selectors: [["ejs-timepicker"]],
  inputs: {
    allowEdit: "allowEdit",
    cssClass: "cssClass",
    enableMask: "enableMask",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enabled: "enabled",
    floatLabelType: "floatLabelType",
    format: "format",
    fullScreenMode: "fullScreenMode",
    htmlAttributes: "htmlAttributes",
    keyConfigs: "keyConfigs",
    locale: "locale",
    maskPlaceholder: "maskPlaceholder",
    max: "max",
    min: "min",
    openOnFocus: "openOnFocus",
    placeholder: "placeholder",
    readonly: "readonly",
    scrollTo: "scrollTo",
    serverTimezoneOffset: "serverTimezoneOffset",
    showClearButton: "showClearButton",
    step: "step",
    strictMode: "strictMode",
    value: "value",
    width: "width",
    zIndex: "zIndex"
  },
  outputs: {
    blur: "blur",
    change: "change",
    cleared: "cleared",
    close: "close",
    created: "created",
    destroyed: "destroyed",
    focus: "focus",
    itemRender: "itemRender",
    open: "open",
    valueChange: "valueChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TimePickerComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function TimePickerComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
TimePickerComponent = TimePickerComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], TimePickerComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TimePickerComponent, [{
    type: Component,
    args: [{
      selector: "ejs-timepicker",
      inputs: inputs$2,
      outputs: outputs$3,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TimePickerComponent),
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
  }, null);
})();
var TimePickerModule = class {
};
TimePickerModule.ɵfac = function TimePickerModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || TimePickerModule)();
};
TimePickerModule.ɵmod = ɵɵdefineNgModule({
  type: TimePickerModule,
  declarations: [TimePickerComponent],
  imports: [CommonModule],
  exports: [TimePickerComponent]
});
TimePickerModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TimePickerModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [TimePickerComponent],
      exports: [TimePickerComponent]
    }]
  }], null, null);
})();
var TimePickerAllModule = class {
};
TimePickerAllModule.ɵfac = function TimePickerAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || TimePickerAllModule)();
};
TimePickerAllModule.ɵmod = ɵɵdefineNgModule({
  type: TimePickerAllModule,
  imports: [CommonModule, TimePickerModule],
  exports: [TimePickerModule]
});
TimePickerAllModule.ɵinj = ɵɵdefineInjector({
  providers: [],
  imports: [[CommonModule, TimePickerModule], TimePickerModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TimePickerAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, TimePickerModule],
      exports: [TimePickerModule],
      providers: []
    }]
  }], null, null);
})();
var input = ["end", "label", "start"];
var outputs$2 = [];
var PresetDirective = class extends ComplexBase {
  constructor(viewContainerRef) {
    super();
    this.viewContainerRef = viewContainerRef;
    setValue("currentInstance", this, this.viewContainerRef);
    this.registerEvents(outputs$2);
    this.directivePropList = input;
  }
};
PresetDirective.ɵfac = function PresetDirective_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || PresetDirective)(ɵɵdirectiveInject(ViewContainerRef));
};
PresetDirective.ɵdir = ɵɵdefineDirective({
  type: PresetDirective,
  selectors: [["e-preset"]],
  inputs: {
    end: "end",
    label: "label",
    start: "start"
  },
  standalone: false,
  features: [ɵɵInheritDefinitionFeature]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PresetDirective, [{
    type: Directive,
    args: [{
      selector: "e-presets>e-preset",
      inputs: input,
      outputs: outputs$2,
      queries: {}
    }]
  }], function() {
    return [{
      type: ViewContainerRef
    }];
  }, null);
})();
var PresetsDirective = class extends ArrayBase {
  constructor() {
    super("presets");
  }
};
PresetsDirective.ɵfac = function PresetsDirective_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || PresetsDirective)();
};
PresetsDirective.ɵdir = ɵɵdefineDirective({
  type: PresetsDirective,
  selectors: [["e-presets"]],
  contentQueries: function PresetsDirective_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, PresetDirective, 4);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.children = _t);
    }
  },
  standalone: false,
  features: [ɵɵInheritDefinitionFeature]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PresetsDirective, [{
    type: Directive,
    args: [{
      selector: "ejs-daterangepicker>e-presets",
      queries: {
        children: new ContentChildren(PresetDirective)
      }
    }]
  }], function() {
    return [];
  }, null);
})();
var DateRangePickerComponent_1;
var inputs$1 = ["allowEdit", "calendarMode", "cssClass", "dayHeaderFormat", "depth", "enablePersistence", "enableRtl", "enabled", "endDate", "firstDayOfWeek", "floatLabelType", "format", "fullScreenMode", "htmlAttributes", "inputFormats", "keyConfigs", "locale", "max", "maxDays", "min", "minDays", "openOnFocus", "placeholder", "presets", "readonly", "separator", "serverTimezoneOffset", "showClearButton", "start", "startDate", "strictMode", "value", "weekNumber", "weekRule", "width", "zIndex"];
var outputs$1 = ["blur", "change", "cleared", "close", "created", "destroyed", "focus", "navigated", "open", "renderDayCell", "select", "startDateChange", "endDateChange", "valueChange"];
var twoWays$1 = ["startDate", "endDate", "value"];
var DateRangePickerComponent = DateRangePickerComponent_1 = class DateRangePickerComponent2 extends DateRangePicker {
  constructor(ngEle, srenderer, viewContainerRef, injector, cdr) {
    super();
    this.ngEle = ngEle;
    this.srenderer = srenderer;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
    this.cdr = cdr;
    this.tags = ["presets"];
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
    this.tagObjects[0].instance = this.childPresets;
    this.formCompContext.ngAfterContentChecked(this);
  }
};
DateRangePickerComponent.ɵfac = function DateRangePickerComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DateRangePickerComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
DateRangePickerComponent.ɵcmp = ɵɵdefineComponent({
  type: DateRangePickerComponent,
  selectors: [["ejs-daterangepicker"]],
  contentQueries: function DateRangePickerComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, _c0, 5);
      ɵɵcontentQuery(dirIndex, _c1, 5);
      ɵɵcontentQuery(dirIndex, PresetsDirective, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.start = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.end = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.childPresets = _t.first);
    }
  },
  inputs: {
    allowEdit: "allowEdit",
    calendarMode: "calendarMode",
    cssClass: "cssClass",
    dayHeaderFormat: "dayHeaderFormat",
    depth: "depth",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enabled: "enabled",
    endDate: "endDate",
    firstDayOfWeek: "firstDayOfWeek",
    floatLabelType: "floatLabelType",
    format: "format",
    fullScreenMode: "fullScreenMode",
    htmlAttributes: "htmlAttributes",
    inputFormats: "inputFormats",
    keyConfigs: "keyConfigs",
    locale: "locale",
    max: "max",
    maxDays: "maxDays",
    min: "min",
    minDays: "minDays",
    openOnFocus: "openOnFocus",
    placeholder: "placeholder",
    presets: "presets",
    readonly: "readonly",
    separator: "separator",
    serverTimezoneOffset: "serverTimezoneOffset",
    showClearButton: "showClearButton",
    start: "start",
    startDate: "startDate",
    strictMode: "strictMode",
    value: "value",
    weekNumber: "weekNumber",
    weekRule: "weekRule",
    width: "width",
    zIndex: "zIndex"
  },
  outputs: {
    blur: "blur",
    change: "change",
    cleared: "cleared",
    close: "close",
    created: "created",
    destroyed: "destroyed",
    focus: "focus",
    navigated: "navigated",
    open: "open",
    renderDayCell: "renderDayCell",
    select: "select",
    startDateChange: "startDateChange",
    endDateChange: "endDateChange",
    valueChange: "valueChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateRangePickerComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function DateRangePickerComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
__decorate([Template()], DateRangePickerComponent.prototype, "start", void 0);
__decorate([Template()], DateRangePickerComponent.prototype, "end", void 0);
DateRangePickerComponent = DateRangePickerComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], DateRangePickerComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DateRangePickerComponent, [{
    type: Component,
    args: [{
      selector: "ejs-daterangepicker",
      inputs: inputs$1,
      outputs: outputs$1,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DateRangePickerComponent),
        multi: true
      }],
      queries: {
        childPresets: new ContentChild(PresetsDirective)
      }
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
    start: [{
      type: ContentChild,
      args: ["start"]
    }],
    end: [{
      type: ContentChild,
      args: ["end"]
    }]
  });
})();
var DateRangePickerModule = class {
};
DateRangePickerModule.ɵfac = function DateRangePickerModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DateRangePickerModule)();
};
DateRangePickerModule.ɵmod = ɵɵdefineNgModule({
  type: DateRangePickerModule,
  declarations: [DateRangePickerComponent, PresetDirective, PresetsDirective],
  imports: [CommonModule],
  exports: [DateRangePickerComponent, PresetDirective, PresetsDirective]
});
DateRangePickerModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DateRangePickerModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [DateRangePickerComponent, PresetDirective, PresetsDirective],
      exports: [DateRangePickerComponent, PresetDirective, PresetsDirective]
    }]
  }], null, null);
})();
var DateRangePickerAllModule = class {
};
DateRangePickerAllModule.ɵfac = function DateRangePickerAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DateRangePickerAllModule)();
};
DateRangePickerAllModule.ɵmod = ɵɵdefineNgModule({
  type: DateRangePickerAllModule,
  imports: [CommonModule, DateRangePickerModule],
  exports: [DateRangePickerModule]
});
DateRangePickerAllModule.ɵinj = ɵɵdefineInjector({
  providers: [],
  imports: [[CommonModule, DateRangePickerModule], DateRangePickerModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DateRangePickerAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, DateRangePickerModule],
      exports: [DateRangePickerModule],
      providers: []
    }]
  }], null, null);
})();
var DateTimePickerComponent_1;
var inputs = ["allowEdit", "calendarMode", "cssClass", "dayHeaderFormat", "depth", "enableMask", "enablePersistence", "enableRtl", "enabled", "firstDayOfWeek", "floatLabelType", "format", "fullScreenMode", "htmlAttributes", "inputFormats", "isMultiSelection", "keyConfigs", "locale", "maskPlaceholder", "max", "maxTime", "min", "minTime", "openOnFocus", "placeholder", "readonly", "scrollTo", "serverTimezoneOffset", "showClearButton", "showTodayButton", "start", "step", "strictMode", "timeFormat", "value", "values", "weekNumber", "weekRule", "width", "zIndex"];
var outputs = ["blur", "change", "cleared", "close", "created", "destroyed", "focus", "navigated", "open", "renderDayCell", "valueChange"];
var twoWays = ["value"];
var DateTimePickerComponent = DateTimePickerComponent_1 = class DateTimePickerComponent2 extends DateTimePicker {
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
      let mod = this.injector.get("CalendarsIslamic");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    try {
      let mod = this.injector.get("CalendarsMaskedDateTime");
      if (this.injectedModules.indexOf(mod) === -1) {
        this.injectedModules.push(mod);
      }
    } catch {
    }
    this.registerEvents(outputs);
    this.addTwoWay.call(this, twoWays);
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
DateTimePickerComponent.ɵfac = function DateTimePickerComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DateTimePickerComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector), ɵɵdirectiveInject(ChangeDetectorRef));
};
DateTimePickerComponent.ɵcmp = ɵɵdefineComponent({
  type: DateTimePickerComponent,
  selectors: [["ejs-datetimepicker"]],
  inputs: {
    allowEdit: "allowEdit",
    calendarMode: "calendarMode",
    cssClass: "cssClass",
    dayHeaderFormat: "dayHeaderFormat",
    depth: "depth",
    enableMask: "enableMask",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    enabled: "enabled",
    firstDayOfWeek: "firstDayOfWeek",
    floatLabelType: "floatLabelType",
    format: "format",
    fullScreenMode: "fullScreenMode",
    htmlAttributes: "htmlAttributes",
    inputFormats: "inputFormats",
    isMultiSelection: "isMultiSelection",
    keyConfigs: "keyConfigs",
    locale: "locale",
    maskPlaceholder: "maskPlaceholder",
    max: "max",
    maxTime: "maxTime",
    min: "min",
    minTime: "minTime",
    openOnFocus: "openOnFocus",
    placeholder: "placeholder",
    readonly: "readonly",
    scrollTo: "scrollTo",
    serverTimezoneOffset: "serverTimezoneOffset",
    showClearButton: "showClearButton",
    showTodayButton: "showTodayButton",
    start: "start",
    step: "step",
    strictMode: "strictMode",
    timeFormat: "timeFormat",
    value: "value",
    values: "values",
    weekNumber: "weekNumber",
    weekRule: "weekRule",
    width: "width",
    zIndex: "zIndex"
  },
  outputs: {
    blur: "blur",
    change: "change",
    cleared: "cleared",
    close: "close",
    created: "created",
    destroyed: "destroyed",
    focus: "focus",
    navigated: "navigated",
    open: "open",
    renderDayCell: "renderDayCell",
    valueChange: "valueChange"
  },
  standalone: false,
  features: [ɵɵProvidersFeature([{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateTimePickerComponent_1),
    multi: true
  }]), ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function DateTimePickerComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
DateTimePickerComponent = DateTimePickerComponent_1 = __decorate([ComponentMixins([ComponentBase, FormBase])], DateTimePickerComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DateTimePickerComponent, [{
    type: Component,
    args: [{
      selector: "ejs-datetimepicker",
      inputs,
      outputs,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DateTimePickerComponent),
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
  }, null);
})();
var DateTimePickerModule = class {
};
DateTimePickerModule.ɵfac = function DateTimePickerModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DateTimePickerModule)();
};
DateTimePickerModule.ɵmod = ɵɵdefineNgModule({
  type: DateTimePickerModule,
  declarations: [DateTimePickerComponent],
  imports: [CommonModule],
  exports: [DateTimePickerComponent]
});
DateTimePickerModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DateTimePickerModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [DateTimePickerComponent],
      exports: [DateTimePickerComponent]
    }]
  }], null, null);
})();
var DateTimePickerAllModule = class {
};
DateTimePickerAllModule.ɵfac = function DateTimePickerAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DateTimePickerAllModule)();
};
DateTimePickerAllModule.ɵmod = ɵɵdefineNgModule({
  type: DateTimePickerAllModule,
  imports: [CommonModule, DateTimePickerModule],
  exports: [DateTimePickerModule]
});
DateTimePickerAllModule.ɵinj = ɵɵdefineInjector({
  providers: [],
  imports: [[CommonModule, DateTimePickerModule], DateTimePickerModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DateTimePickerAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, DateTimePickerModule],
      exports: [DateTimePickerModule],
      providers: []
    }]
  }], null, null);
})();
export {
  Calendar,
  CalendarAllModule,
  CalendarBase,
  CalendarComponent,
  CalendarModule,
  DatePicker,
  DatePickerAllModule,
  DatePickerComponent,
  DatePickerModule,
  DateRangePicker,
  DateRangePickerAllModule,
  DateRangePickerComponent,
  DateRangePickerModule,
  DateTimePicker,
  DateTimePickerAllModule,
  DateTimePickerComponent,
  DateTimePickerModule,
  Islamic,
  IslamicService,
  MaskedDateTime,
  MaskedDateTimeService,
  PresetDirective,
  Presets,
  PresetsDirective,
  TimeMaskPlaceholder,
  TimePicker,
  TimePickerAllModule,
  TimePickerBase,
  TimePickerComponent,
  TimePickerModule
};
//# sourceMappingURL=@syncfusion_ej2-angular-calendars.js.map
