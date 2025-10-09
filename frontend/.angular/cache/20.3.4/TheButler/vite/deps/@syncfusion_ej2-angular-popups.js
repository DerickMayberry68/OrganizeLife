import {
  Animation,
  AnimationSettings,
  ButtonProps,
  Dialog,
  DialogUtility,
  Popup,
  PositionData,
  Spinner,
  Tooltip,
  calculatePosition,
  calculateRelativeBasedPosition,
  createSpinner,
  destroy,
  fit,
  flip,
  getMaxZindex,
  getScrollableParent,
  getTransformElement,
  getZindexPartial,
  getZoomValue,
  hideSpinner,
  isCollide,
  setSpinner,
  showSpinner
} from "./chunk-LSAUX22Z.js";
import {
  ArrayBase,
  ComplexBase,
  ComponentBase,
  ComponentMixins,
  Template,
  setValue
} from "./chunk-LWGRNCSZ.js";
import "./chunk-SUEQP5ZZ.js";
import {
  CommonModule
} from "./chunk-ATMYRN7M.js";
import "./chunk-YLHXK2KV.js";
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  Injector,
  NgModule,
  Renderer2,
  ViewContainerRef,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
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

// node_modules/@syncfusion/ej2-angular-popups/fesm2020/syncfusion-ej2-angular-popups.mjs
var _c0 = ["footerTemplate"];
var _c1 = ["header"];
var _c2 = ["content"];
var _c3 = ["*"];
var input = ["buttonModel", "isFlat", "type"];
var outputs$2 = ["click"];
var DialogButtonDirective = class extends ComplexBase {
  constructor(viewContainerRef) {
    super();
    this.viewContainerRef = viewContainerRef;
    setValue("currentInstance", this, this.viewContainerRef);
    this.registerEvents(outputs$2);
    this.directivePropList = input;
  }
};
DialogButtonDirective.ɵfac = function DialogButtonDirective_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DialogButtonDirective)(ɵɵdirectiveInject(ViewContainerRef));
};
DialogButtonDirective.ɵdir = ɵɵdefineDirective({
  type: DialogButtonDirective,
  selectors: [["e-dialogbutton"]],
  inputs: {
    buttonModel: "buttonModel",
    isFlat: "isFlat",
    type: "type"
  },
  outputs: {
    click: "click"
  },
  standalone: false,
  features: [ɵɵInheritDefinitionFeature]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DialogButtonDirective, [{
    type: Directive,
    args: [{
      selector: "e-buttons>e-dialogbutton",
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
var ButtonsDirective = class extends ArrayBase {
  constructor() {
    super("buttons");
  }
};
ButtonsDirective.ɵfac = function ButtonsDirective_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || ButtonsDirective)();
};
ButtonsDirective.ɵdir = ɵɵdefineDirective({
  type: ButtonsDirective,
  selectors: [["e-buttons"]],
  contentQueries: function ButtonsDirective_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, DialogButtonDirective, 4);
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
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ButtonsDirective, [{
    type: Directive,
    args: [{
      selector: "ejs-dialog>e-buttons",
      queries: {
        children: new ContentChildren(DialogButtonDirective)
      }
    }]
  }], function() {
    return [];
  }, null);
})();
var inputs$1 = ["allowDragging", "animationSettings", "buttons", "closeOnEscape", "content", "cssClass", "enableHtmlSanitizer", "enablePersistence", "enableResize", "enableRtl", "footerTemplate", "header", "height", "isModal", "locale", "minHeight", "position", "resizeHandles", "showCloseIcon", "target", "visible", "width", "zIndex"];
var outputs$1 = ["beforeClose", "beforeOpen", "beforeSanitizeHtml", "close", "created", "destroyed", "drag", "dragStart", "dragStop", "open", "overlayClick", "resizeStart", "resizeStop", "resizing", "visibleChange"];
var twoWays$1 = ["visible"];
var DialogComponent = class DialogComponent2 extends Dialog {
  constructor(ngEle, srenderer, viewContainerRef, injector) {
    super();
    this.ngEle = ngEle;
    this.srenderer = srenderer;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
    this.tags = ["buttons"];
    this.element = this.ngEle.nativeElement;
    this.injectedModules = this.injectedModules || [];
    this.registerEvents(outputs$1);
    this.addTwoWay.call(this, twoWays$1);
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
    this.tagObjects[0].instance = this.childButtons;
    this.containerContext.ngAfterContentChecked(this);
  }
};
DialogComponent.ɵfac = function DialogComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DialogComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector));
};
DialogComponent.ɵcmp = ɵɵdefineComponent({
  type: DialogComponent,
  selectors: [["ejs-dialog"]],
  contentQueries: function DialogComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, _c0, 5);
      ɵɵcontentQuery(dirIndex, _c1, 5);
      ɵɵcontentQuery(dirIndex, _c2, 5);
      ɵɵcontentQuery(dirIndex, ButtonsDirective, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.footerTemplate = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.header = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.content = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.childButtons = _t.first);
    }
  },
  inputs: {
    allowDragging: "allowDragging",
    animationSettings: "animationSettings",
    buttons: "buttons",
    closeOnEscape: "closeOnEscape",
    content: "content",
    cssClass: "cssClass",
    enableHtmlSanitizer: "enableHtmlSanitizer",
    enablePersistence: "enablePersistence",
    enableResize: "enableResize",
    enableRtl: "enableRtl",
    footerTemplate: "footerTemplate",
    header: "header",
    height: "height",
    isModal: "isModal",
    locale: "locale",
    minHeight: "minHeight",
    position: "position",
    resizeHandles: "resizeHandles",
    showCloseIcon: "showCloseIcon",
    target: "target",
    visible: "visible",
    width: "width",
    zIndex: "zIndex"
  },
  outputs: {
    beforeClose: "beforeClose",
    beforeOpen: "beforeOpen",
    beforeSanitizeHtml: "beforeSanitizeHtml",
    close: "close",
    created: "created",
    destroyed: "destroyed",
    drag: "drag",
    dragStart: "dragStart",
    dragStop: "dragStop",
    open: "open",
    overlayClick: "overlayClick",
    resizeStart: "resizeStart",
    resizeStop: "resizeStop",
    resizing: "resizing",
    visibleChange: "visibleChange"
  },
  standalone: false,
  features: [ɵɵInheritDefinitionFeature],
  ngContentSelectors: _c3,
  decls: 1,
  vars: 0,
  template: function DialogComponent_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵprojection(0);
    }
  },
  encapsulation: 2,
  changeDetection: 0
});
__decorate([Template()], DialogComponent.prototype, "footerTemplate", void 0);
__decorate([Template()], DialogComponent.prototype, "header", void 0);
__decorate([Template()], DialogComponent.prototype, "content", void 0);
DialogComponent = __decorate([ComponentMixins([ComponentBase])], DialogComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DialogComponent, [{
    type: Component,
    args: [{
      selector: "ejs-dialog",
      inputs: inputs$1,
      outputs: outputs$1,
      template: `<ng-content ></ng-content>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      queries: {
        childButtons: new ContentChild(ButtonsDirective)
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
    }];
  }, {
    footerTemplate: [{
      type: ContentChild,
      args: ["footerTemplate"]
    }],
    header: [{
      type: ContentChild,
      args: ["header"]
    }],
    content: [{
      type: ContentChild,
      args: ["content"]
    }]
  });
})();
var DialogModule = class {
};
DialogModule.ɵfac = function DialogModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DialogModule)();
};
DialogModule.ɵmod = ɵɵdefineNgModule({
  type: DialogModule,
  declarations: [DialogComponent, DialogButtonDirective, ButtonsDirective],
  imports: [CommonModule],
  exports: [DialogComponent, DialogButtonDirective, ButtonsDirective]
});
DialogModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DialogModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [DialogComponent, DialogButtonDirective, ButtonsDirective],
      exports: [DialogComponent, DialogButtonDirective, ButtonsDirective]
    }]
  }], null, null);
})();
var DialogAllModule = class {
};
DialogAllModule.ɵfac = function DialogAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || DialogAllModule)();
};
DialogAllModule.ɵmod = ɵɵdefineNgModule({
  type: DialogAllModule,
  imports: [CommonModule, DialogModule],
  exports: [DialogModule]
});
DialogAllModule.ɵinj = ɵɵdefineInjector({
  providers: [],
  imports: [[CommonModule, DialogModule], DialogModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DialogAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, DialogModule],
      exports: [DialogModule],
      providers: []
    }]
  }], null, null);
})();
var inputs = ["animation", "closeDelay", "container", "content", "cssClass", "enableHtmlParse", "enableHtmlSanitizer", "enablePersistence", "enableRtl", "height", "htmlAttributes", "isSticky", "locale", "mouseTrail", "offsetX", "offsetY", "openDelay", "opensOn", "position", "showTipPointer", "target", "tipPointerPosition", "width", "windowCollision"];
var outputs = ["afterClose", "afterOpen", "beforeClose", "beforeCollision", "beforeOpen", "beforeRender", "created", "destroyed"];
var twoWays = [""];
var TooltipComponent = class TooltipComponent2 extends Tooltip {
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
TooltipComponent.ɵfac = function TooltipComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || TooltipComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(Injector));
};
TooltipComponent.ɵcmp = ɵɵdefineComponent({
  type: TooltipComponent,
  selectors: [["ejs-tooltip"]],
  contentQueries: function TooltipComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, _c2, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.content = _t.first);
    }
  },
  inputs: {
    animation: "animation",
    closeDelay: "closeDelay",
    container: "container",
    content: "content",
    cssClass: "cssClass",
    enableHtmlParse: "enableHtmlParse",
    enableHtmlSanitizer: "enableHtmlSanitizer",
    enablePersistence: "enablePersistence",
    enableRtl: "enableRtl",
    height: "height",
    htmlAttributes: "htmlAttributes",
    isSticky: "isSticky",
    locale: "locale",
    mouseTrail: "mouseTrail",
    offsetX: "offsetX",
    offsetY: "offsetY",
    openDelay: "openDelay",
    opensOn: "opensOn",
    position: "position",
    showTipPointer: "showTipPointer",
    target: "target",
    tipPointerPosition: "tipPointerPosition",
    width: "width",
    windowCollision: "windowCollision"
  },
  outputs: {
    afterClose: "afterClose",
    afterOpen: "afterOpen",
    beforeClose: "beforeClose",
    beforeCollision: "beforeCollision",
    beforeOpen: "beforeOpen",
    beforeRender: "beforeRender",
    created: "created",
    destroyed: "destroyed"
  },
  standalone: false,
  features: [ɵɵInheritDefinitionFeature],
  ngContentSelectors: _c3,
  decls: 1,
  vars: 0,
  template: function TooltipComponent_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵprojection(0);
    }
  },
  encapsulation: 2,
  changeDetection: 0
});
__decorate([Template()], TooltipComponent.prototype, "content", void 0);
TooltipComponent = __decorate([ComponentMixins([ComponentBase])], TooltipComponent);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TooltipComponent, [{
    type: Component,
    args: [{
      selector: "ejs-tooltip",
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
    content: [{
      type: ContentChild,
      args: ["content"]
    }]
  });
})();
var TooltipModule = class {
};
TooltipModule.ɵfac = function TooltipModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || TooltipModule)();
};
TooltipModule.ɵmod = ɵɵdefineNgModule({
  type: TooltipModule,
  declarations: [TooltipComponent],
  imports: [CommonModule],
  exports: [TooltipComponent]
});
TooltipModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TooltipModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      declarations: [TooltipComponent],
      exports: [TooltipComponent]
    }]
  }], null, null);
})();
var TooltipAllModule = class {
};
TooltipAllModule.ɵfac = function TooltipAllModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || TooltipAllModule)();
};
TooltipAllModule.ɵmod = ɵɵdefineNgModule({
  type: TooltipAllModule,
  imports: [CommonModule, TooltipModule],
  exports: [TooltipModule]
});
TooltipAllModule.ɵinj = ɵɵdefineInjector({
  providers: [],
  imports: [[CommonModule, TooltipModule], TooltipModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TooltipAllModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, TooltipModule],
      exports: [TooltipModule],
      providers: []
    }]
  }], null, null);
})();
export {
  Animation,
  AnimationSettings,
  ButtonProps,
  ButtonsDirective,
  Dialog,
  DialogAllModule,
  DialogButtonDirective,
  DialogComponent,
  DialogModule,
  DialogUtility,
  Popup,
  PositionData,
  Spinner,
  Tooltip,
  TooltipAllModule,
  TooltipComponent,
  TooltipModule,
  calculatePosition,
  calculateRelativeBasedPosition,
  createSpinner,
  destroy,
  fit,
  flip,
  getMaxZindex,
  getScrollableParent,
  getTransformElement,
  getZindexPartial,
  getZoomValue,
  hideSpinner,
  isCollide,
  setSpinner,
  showSpinner
};
//# sourceMappingURL=@syncfusion_ej2-angular-popups.js.map
