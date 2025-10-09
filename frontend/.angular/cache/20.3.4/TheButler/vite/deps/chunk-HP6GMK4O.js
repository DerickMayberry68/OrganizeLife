import {
  createCheckBox
} from "./chunk-LWGRNCSZ.js";
import {
  Animation,
  Base,
  Browser,
  ChildProperty,
  Complex,
  Component,
  Draggable,
  Event,
  EventHandler,
  Fetch,
  NotifyPropertyChanges,
  Property,
  SanitizeHtmlHelper,
  Touch,
  addClass,
  animationMode,
  append,
  attributes,
  closest,
  compareElementParent,
  compile,
  detach,
  extend,
  formatUnit,
  getComponent,
  getUniqueID,
  getValue,
  isBlazor,
  isNullOrUndefined,
  isVisible,
  merge,
  prepend,
  remove,
  removeClass,
  rippleEffect,
  select
} from "./chunk-SUEQP5ZZ.js";

// node_modules/@syncfusion/ej2-data/src/adaptors.js
var __extends = /* @__PURE__ */ (function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var consts = { GroupGuid: "{271bbba0-1ee7}" };
var Adaptor = (
  /** @class */
  (function() {
    function Adaptor2(ds) {
      this.options = {
        from: "table",
        requestType: "json",
        sortBy: "sorted",
        select: "select",
        skip: "skip",
        group: "group",
        take: "take",
        search: "search",
        count: "requiresCounts",
        where: "where",
        aggregates: "aggregates",
        expand: "expand"
      };
      this.type = Adaptor2;
      this.dataSource = ds;
      this.pvt = {};
    }
    Adaptor2.prototype.processResponse = function(data, ds, query, xhr) {
      return data;
    };
    return Adaptor2;
  })()
);
var JsonAdaptor = (
  /** @class */
  (function(_super) {
    __extends(JsonAdaptor2, _super);
    function JsonAdaptor2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    JsonAdaptor2.prototype.processQuery = function(dataManager, query) {
      var result = dataManager.dataSource.json.slice(0);
      var count = result.length;
      var countFlg = true;
      var ret;
      var key;
      var lazyLoad = {};
      var keyCount = 0;
      var group = [];
      var sort = [];
      var page;
      for (var i = 0; i < query.lazyLoad.length; i++) {
        keyCount++;
        lazyLoad[query.lazyLoad[i].key] = query.lazyLoad[i].value;
      }
      var agg = {};
      var isGroupByFormat = false;
      if (query.lazyLoad.length) {
        for (var i = 0; i < query.queries.length; i++) {
          key = query.queries[i];
          if (key.fn === "onGroup" && !isNullOrUndefined(key.e.format)) {
            isGroupByFormat = true;
            break;
          }
        }
      }
      for (var i = 0; i < query.queries.length; i++) {
        key = query.queries[i];
        if ((key.fn === "onPage" || key.fn === "onGroup" || key.fn === "onSortBy" && !isGroupByFormat) && query.lazyLoad.length) {
          if (key.fn === "onGroup") {
            group.push(key.e);
          }
          if (key.fn === "onPage") {
            page = key.e;
          }
          if (key.fn === "onSortBy") {
            sort.unshift(key.e);
          }
          continue;
        }
        ret = this[key.fn].call(this, result, key.e, query);
        if (key.fn === "onAggregates") {
          agg[key.e.field + " - " + key.e.type] = ret;
        } else {
          result = ret !== void 0 ? ret : result;
        }
        if (key.fn === "onPage" || key.fn === "onSkip" || key.fn === "onTake" || key.fn === "onRange") {
          countFlg = false;
        }
        if (countFlg) {
          count = result.length;
        }
      }
      if (keyCount) {
        var args = {
          query,
          lazyLoad,
          result,
          group,
          page,
          sort
        };
        var lazyLoadData = this.lazyLoadGroup(args);
        result = lazyLoadData.result;
        count = lazyLoadData.count;
      }
      if (query.isCountRequired) {
        result = {
          result,
          count,
          aggregates: agg
        };
      }
      return result;
    };
    JsonAdaptor2.prototype.lazyLoadGroup = function(args) {
      var count = 0;
      var agg = this.getAggregate(args.query);
      var result = args.result;
      if (!isNullOrUndefined(args.lazyLoad.onDemandGroupInfo)) {
        var req = args.lazyLoad.onDemandGroupInfo;
        for (var i = req.where.length - 1; i >= 0; i--) {
          result = this.onWhere(result, req.where[i]);
        }
        if (args.group.length !== req.level) {
          var field = args.group[req.level].fieldName;
          result = DataUtil.group(result, field, agg, null, null, args.group[req.level].comparer, true);
          if (args.sort.length) {
            result = this.onSortBy(result, args.sort[parseInt(req.level.toString(), 10)], args.query, true);
          }
        } else {
          for (var i = args.sort.length - 1; i >= req.level; i--) {
            result = this.onSortBy(result, args.sort[parseInt(i.toString(), 10)], args.query, false);
          }
        }
        count = result.length;
        var data = result;
        result = result.slice(req.skip);
        result = result.slice(0, req.take);
        if (args.group.length !== req.level) {
          this.formGroupResult(result, data);
        }
      } else {
        var field_1 = args.group[0].fieldName;
        result = DataUtil.group(result, field_1, agg, null, null, args.group[0].comparer, true);
        count = result.length;
        var data = result;
        if (args.sort.length) {
          var sort = args.sort.length > 1 ? args.sort.filter(function(x) {
            return x.fieldName === field_1;
          })[0] : args.sort[0];
          result = this.onSortBy(result, sort, args.query, true);
        }
        if (args.page) {
          result = this.onPage(result, args.page, args.query);
        }
        this.formGroupResult(result, data);
      }
      return { result, count };
    };
    JsonAdaptor2.prototype.formGroupResult = function(result, data) {
      if (result.length && data.length) {
        var uid = "GroupGuid";
        var childLevel = "childLevels";
        var level = "level";
        var records = "records";
        result[uid] = data[uid];
        result[childLevel] = data[childLevel];
        result[level] = data[level];
        result[records] = data[records];
      }
      return result;
    };
    JsonAdaptor2.prototype.getAggregate = function(query) {
      var aggQuery = Query.filterQueries(query.queries, "onAggregates");
      var agg = [];
      if (aggQuery.length) {
        var tmp = void 0;
        for (var i = 0; i < aggQuery.length; i++) {
          tmp = aggQuery[i].e;
          agg.push({ type: tmp.type, field: DataUtil.getValue(tmp.field, query) });
        }
      }
      return agg;
    };
    JsonAdaptor2.prototype.batchRequest = function(dm, changes, e) {
      var i;
      var deletedRecordsLen = changes.deletedRecords.length;
      for (i = 0; i < changes.addedRecords.length; i++) {
        this.insert(dm, changes.addedRecords[i]);
      }
      for (i = 0; i < changes.changedRecords.length; i++) {
        this.update(dm, e.key, changes.changedRecords[i]);
      }
      for (i = 0; i < deletedRecordsLen; i++) {
        this.remove(dm, e.key, changes.deletedRecords[i]);
      }
      return changes;
    };
    JsonAdaptor2.prototype.onWhere = function(ds, e) {
      if (!ds || !ds.length) {
        return ds;
      }
      return ds.filter(function(obj) {
        if (e) {
          return e.validate(obj);
        }
      });
    };
    JsonAdaptor2.prototype.onAggregates = function(ds, e) {
      var fn = DataUtil.aggregates[e.type];
      if (!ds || !fn || ds.length === 0) {
        return null;
      }
      return fn(ds, e.field);
    };
    JsonAdaptor2.prototype.onSearch = function(ds, e) {
      if (!ds || !ds.length) {
        return ds;
      }
      if (e.fieldNames.length === 0) {
        DataUtil.getFieldList(ds[0], e.fieldNames);
      }
      return ds.filter(function(obj) {
        for (var j = 0; j < e.fieldNames.length; j++) {
          if (e.comparer.call(obj, DataUtil.getObject(e.fieldNames[j], obj), e.searchKey, e.ignoreCase, e.ignoreAccent)) {
            return true;
          }
        }
        return false;
      });
    };
    JsonAdaptor2.prototype.onSortBy = function(ds, e, query, isLazyLoadGroupSort) {
      if (!ds || !ds.length) {
        return ds;
      }
      var fnCompare;
      var field = DataUtil.getValue(e.fieldName, query);
      if (!field) {
        return ds.sort(e.comparer);
      }
      if (field instanceof Array) {
        field = field.slice(0);
        for (var i = field.length - 1; i >= 0; i--) {
          if (!field[i]) {
            continue;
          }
          fnCompare = e.comparer;
          if (DataUtil.endsWith(field[i], " desc")) {
            fnCompare = DataUtil.fnSort("descending");
            field[i] = field[i].replace(" desc", "");
          }
          ds = DataUtil.sort(ds, field[i], fnCompare);
        }
        return ds;
      }
      return DataUtil.sort(ds, isLazyLoadGroupSort ? "key" : field, e.comparer);
    };
    JsonAdaptor2.prototype.onGroup = function(ds, e, query) {
      if (!ds || !ds.length) {
        return ds;
      }
      var agg = this.getAggregate(query);
      return DataUtil.group(ds, DataUtil.getValue(e.fieldName, query), agg, null, null, e.comparer);
    };
    JsonAdaptor2.prototype.onPage = function(ds, e, query) {
      var size = DataUtil.getValue(e.pageSize, query);
      var start = (DataUtil.getValue(e.pageIndex, query) - 1) * size;
      var end = start + size;
      if (!ds || !ds.length) {
        return ds;
      }
      return ds.slice(start, end);
    };
    JsonAdaptor2.prototype.onRange = function(ds, e) {
      if (!ds || !ds.length) {
        return ds;
      }
      return ds.slice(DataUtil.getValue(e.start), DataUtil.getValue(e.end));
    };
    JsonAdaptor2.prototype.onTake = function(ds, e) {
      if (!ds || !ds.length) {
        return ds;
      }
      return ds.slice(0, DataUtil.getValue(e.nos));
    };
    JsonAdaptor2.prototype.onSkip = function(ds, e) {
      if (!ds || !ds.length) {
        return ds;
      }
      return ds.slice(DataUtil.getValue(e.nos));
    };
    JsonAdaptor2.prototype.onSelect = function(ds, e) {
      if (!ds || !ds.length) {
        return ds;
      }
      return DataUtil.select(ds, DataUtil.getValue(e.fieldNames));
    };
    JsonAdaptor2.prototype.insert = function(dm, data, tableName, query, position) {
      if (isNullOrUndefined(position)) {
        return dm.dataSource.json.push(data);
      } else {
        return dm.dataSource.json.splice(position, 0, data);
      }
    };
    JsonAdaptor2.prototype.remove = function(dm, keyField, value, tableName) {
      var ds = dm.dataSource.json;
      var i;
      if (typeof value === "object" && !(value instanceof Date)) {
        value = DataUtil.getObject(keyField, value);
      }
      for (i = 0; i < ds.length; i++) {
        if (DataUtil.getObject(keyField, ds[i]) === value) {
          break;
        }
      }
      return i !== ds.length ? ds.splice(i, 1) : null;
    };
    JsonAdaptor2.prototype.update = function(dm, keyField, value, tableName) {
      var ds = dm.dataSource.json;
      var i;
      var key;
      if (!isNullOrUndefined(keyField)) {
        key = getValue(keyField, value);
      }
      for (i = 0; i < ds.length; i++) {
        if (!isNullOrUndefined(keyField) && getValue(keyField, ds[i]) === key) {
          break;
        }
      }
      return i < ds.length ? merge(ds[i], value) : null;
    };
    return JsonAdaptor2;
  })(Adaptor)
);
var UrlAdaptor = (
  /** @class */
  (function(_super) {
    __extends(UrlAdaptor2, _super);
    function UrlAdaptor2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    UrlAdaptor2.prototype.processQuery = function(dm, query, hierarchyFilters) {
      var queries = this.getQueryRequest(query);
      var singles = Query.filterQueryLists(query.queries, ["onSelect", "onPage", "onSkip", "onTake", "onRange"]);
      var params = query.params;
      var url = dm.dataSource.url;
      var temp;
      var skip;
      var take = null;
      var options = this.options;
      var request = { sorts: [], groups: [], filters: [], searches: [], aggregates: [] };
      if ("onPage" in singles) {
        temp = singles.onPage;
        skip = DataUtil.getValue(temp.pageIndex, query);
        take = DataUtil.getValue(temp.pageSize, query);
        skip = (skip - 1) * take;
      } else if ("onRange" in singles) {
        temp = singles.onRange;
        skip = temp.start;
        take = temp.end - temp.start;
      }
      for (var i = 0; i < queries.sorts.length; i++) {
        temp = DataUtil.getValue(queries.sorts[i].e.fieldName, query);
        request.sorts.push(DataUtil.callAdaptorFunction(this, "onEachSort", { name: temp, direction: queries.sorts[i].e.direction }, query));
      }
      if (hierarchyFilters) {
        temp = this.getFiltersFrom(hierarchyFilters, query);
        if (temp) {
          request.filters.push(DataUtil.callAdaptorFunction(this, "onEachWhere", temp.toJson(), query));
        }
      }
      for (var i = 0; i < queries.filters.length; i++) {
        var res = DataUtil.callAdaptorFunction(this, "onEachWhere", queries.filters[i].e.toJson(), query);
        if (this.getModuleName && this.getModuleName() === "ODataV4Adaptor" && !isNullOrUndefined(queries.filters[i].e.key) && queries.filters.length > 1) {
          res = "(" + res + ")";
        }
        request.filters.push(res);
        var keys_3 = typeof request.filters[i] === "object" ? Object.keys(request.filters[i]) : [];
        for (var _i = 0, keys_1 = keys_3; _i < keys_1.length; _i++) {
          var prop = keys_1[_i];
          if (DataUtil.isNull(request[prop])) {
            delete request[prop];
          }
        }
      }
      for (var i = 0; i < queries.searches.length; i++) {
        temp = queries.searches[i].e;
        request.searches.push(DataUtil.callAdaptorFunction(this, "onEachSearch", {
          fields: temp.fieldNames,
          operator: temp.operator,
          key: temp.searchKey,
          ignoreCase: temp.ignoreCase,
          ignoreAccent: temp.ignoreAccent
        }, query));
      }
      for (var i = 0; i < queries.groups.length; i++) {
        request.groups.push(DataUtil.getValue(queries.groups[i].e.fieldName, query));
      }
      for (var i = 0; i < queries.aggregates.length; i++) {
        temp = queries.aggregates[i].e;
        request.aggregates.push({ type: temp.type, field: DataUtil.getValue(temp.field, query) });
      }
      var req = {};
      this.getRequestQuery(options, query, singles, request, req);
      DataUtil.callAdaptorFunction(this, "addParams", { dm, query, params, reqParams: req });
      if (query.lazyLoad.length) {
        for (var i = 0; i < query.lazyLoad.length; i++) {
          req[query.lazyLoad[i].key] = query.lazyLoad[i].value;
        }
      }
      var keys = Object.keys(req);
      for (var _a = 0, keys_2 = keys; _a < keys_2.length; _a++) {
        var prop = keys_2[_a];
        if (DataUtil.isNull(req[prop]) || req[prop] === "" || req[prop].length === 0) {
          delete req[prop];
        }
      }
      if (!(options.skip in req && options.take in req) && take !== null) {
        req[options.skip] = DataUtil.callAdaptorFunction(this, "onSkip", skip, query);
        req[options.take] = DataUtil.callAdaptorFunction(this, "onTake", take, query);
      }
      var p = this.pvt;
      this.pvt = {};
      if (this.options.requestType === "json") {
        return {
          data: JSON.stringify(req, DataUtil.parse.jsonDateReplacer),
          url,
          pvtData: p,
          type: "POST",
          contentType: "application/json; charset=utf-8"
        };
      }
      temp = this.convertToQueryString(req, query, dm);
      temp = (dm.dataSource.url.indexOf("?") !== -1 ? "&" : "/") + temp;
      return {
        type: "GET",
        url: temp.length ? url.replace(/\/*$/, temp) : url,
        pvtData: p
      };
    };
    UrlAdaptor2.prototype.getRequestQuery = function(options, query, singles, request, request1) {
      var param = "param";
      var req = request1;
      req[options.from] = query.fromTable;
      if (options.apply && query.distincts.length) {
        req[options.apply] = "onDistinct" in this ? DataUtil.callAdaptorFunction(this, "onDistinct", query.distincts) : "";
      }
      if (!query.distincts.length && options.expand) {
        req[options.expand] = "onExpand" in this && "onSelect" in singles ? DataUtil.callAdaptorFunction(this, "onExpand", { selects: DataUtil.getValue(singles.onSelect.fieldNames, query), expands: query.expands }, query) : query.expands;
      }
      req[options.select] = "onSelect" in singles && !query.distincts.length ? DataUtil.callAdaptorFunction(this, "onSelect", DataUtil.getValue(singles.onSelect.fieldNames, query), query) : "";
      req[options.count] = query.isCountRequired ? DataUtil.callAdaptorFunction(this, "onCount", query.isCountRequired, query) : "";
      req[options.search] = request.searches.length ? DataUtil.callAdaptorFunction(this, "onSearch", request.searches, query) : "";
      req[options.skip] = "onSkip" in singles ? DataUtil.callAdaptorFunction(this, "onSkip", DataUtil.getValue(singles.onSkip.nos, query), query) : "";
      req[options.take] = "onTake" in singles ? DataUtil.callAdaptorFunction(this, "onTake", DataUtil.getValue(singles.onTake.nos, query), query) : "";
      req[options.where] = request.filters.length || request.searches.length ? DataUtil.callAdaptorFunction(this, "onWhere", request.filters, query) : "";
      req[options.sortBy] = request.sorts.length ? DataUtil.callAdaptorFunction(this, "onSortBy", request.sorts, query) : "";
      req[options.group] = request.groups.length ? DataUtil.callAdaptorFunction(this, "onGroup", request.groups, query) : "";
      req[options.aggregates] = request.aggregates.length ? DataUtil.callAdaptorFunction(this, "onAggregates", request.aggregates, query) : "";
      req[param] = [];
    };
    UrlAdaptor2.prototype.convertToQueryString = function(request, query, dm) {
      return "";
    };
    UrlAdaptor2.prototype.processResponse = function(data, ds, query, xhr, request, changes) {
      if (xhr && xhr.headers.get("Content-Type") && xhr.headers.get("Content-Type").indexOf("application/json") !== -1) {
        var handleTimeZone = DataUtil.timeZoneHandling;
        if (ds && !ds.timeZoneHandling) {
          DataUtil.timeZoneHandling = false;
        }
        if (!ds.enableCache) {
          data = DataUtil.parse.parseJson(data);
        }
        DataUtil.timeZoneHandling = handleTimeZone;
      }
      var requests = request;
      var pvt = requests.pvtData || {};
      var groupDs = data ? data.groupDs : [];
      if (xhr && xhr.headers.get("Content-Type") && xhr.headers.get("Content-Type").indexOf("xml") !== -1) {
        return query.isCountRequired ? { result: [], count: 0 } : [];
      }
      var d = JSON.parse(requests.data);
      if (d && d.action === "batch" && data && data.addedRecords && !isNullOrUndefined(changes)) {
        changes.addedRecords = data.addedRecords;
        return changes;
      }
      if (data && data.d) {
        data = data.d;
      }
      var args = {};
      if (data && "count" in data) {
        args.count = data.count;
      }
      args.result = data && data.result ? data.result : data;
      var isExpand = false;
      if (Array.isArray(data.result) && data.result.length) {
        var key = "key";
        var val = "value";
        var level = "level";
        if (!isNullOrUndefined(data.result[0][key])) {
          args.result = this.formRemoteGroupedData(args.result, 1, pvt.groups.length - 1);
        }
        if (query && query.lazyLoad.length && pvt.groups.length) {
          for (var i = 0; i < query.lazyLoad.length; i++) {
            if (query.lazyLoad[i][key] === "onDemandGroupInfo") {
              var value = query.lazyLoad[i][val][level];
              if (pvt.groups.length === value) {
                isExpand = true;
              }
            }
          }
        }
      }
      if (!isExpand) {
        this.getAggregateResult(pvt, data, args, groupDs, query);
      }
      return DataUtil.isNull(args.count) ? args.result : { result: args.result, count: args.count, aggregates: args.aggregates };
    };
    UrlAdaptor2.prototype.formRemoteGroupedData = function(data, level, childLevel) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].items.length && Object.keys(data[i].items[0]).indexOf("key") > -1) {
          this.formRemoteGroupedData(data[i].items, level + 1, childLevel - 1);
        }
      }
      var uid = "GroupGuid";
      var childLvl = "childLevels";
      var lvl = "level";
      var records = "records";
      data[uid] = consts[uid];
      data[lvl] = level;
      data[childLvl] = childLevel;
      data[records] = data[0].items.length ? this.getGroupedRecords(data, !isNullOrUndefined(data[0].items[records])) : [];
      return data;
    };
    UrlAdaptor2.prototype.getGroupedRecords = function(data, hasRecords) {
      var childGroupedRecords = [];
      var records = "records";
      for (var i = 0; i < data.length; i++) {
        if (!hasRecords) {
          for (var j = 0; j < data[i].items.length; j++) {
            childGroupedRecords.push(data[i].items[j]);
          }
        } else {
          childGroupedRecords = childGroupedRecords.concat(data[i].items[records]);
        }
      }
      return childGroupedRecords;
    };
    UrlAdaptor2.prototype.onGroup = function(e) {
      this.pvt.groups = e;
      return e;
    };
    UrlAdaptor2.prototype.onAggregates = function(e) {
      this.pvt.aggregates = e;
    };
    UrlAdaptor2.prototype.batchRequest = function(dm, changes, e, query, original) {
      var url;
      var key;
      return {
        type: "POST",
        url: dm.dataSource.batchUrl || dm.dataSource.crudUrl || dm.dataSource.removeUrl || dm.dataSource.url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(extend({}, {
          changed: changes.changedRecords,
          added: changes.addedRecords,
          deleted: changes.deletedRecords,
          action: "batch",
          table: e[url],
          key: e[key]
        }, DataUtil.getAddParams(this, dm, query)))
      };
    };
    UrlAdaptor2.prototype.beforeSend = function(dm, request, settings) {
    };
    UrlAdaptor2.prototype.insert = function(dm, data, tableName, query) {
      return {
        url: dm.dataSource.insertUrl || dm.dataSource.crudUrl || dm.dataSource.url,
        data: JSON.stringify(extend({}, {
          value: data,
          table: tableName,
          action: "insert"
        }, DataUtil.getAddParams(this, dm, query)))
      };
    };
    UrlAdaptor2.prototype.remove = function(dm, keyField, value, tableName, query) {
      return {
        type: "POST",
        url: dm.dataSource.removeUrl || dm.dataSource.crudUrl || dm.dataSource.url,
        data: JSON.stringify(extend({}, {
          key: value,
          keyColumn: keyField,
          table: tableName,
          action: "remove"
        }, DataUtil.getAddParams(this, dm, query)))
      };
    };
    UrlAdaptor2.prototype.update = function(dm, keyField, value, tableName, query) {
      return {
        type: "POST",
        url: dm.dataSource.updateUrl || dm.dataSource.crudUrl || dm.dataSource.url,
        data: JSON.stringify(extend({}, {
          value,
          action: "update",
          keyColumn: keyField,
          key: DataUtil.getObject(keyField, value),
          table: tableName
        }, DataUtil.getAddParams(this, dm, query)))
      };
    };
    UrlAdaptor2.prototype.getFiltersFrom = function(data, query) {
      var key = query.fKey;
      var value;
      var prop = key;
      var pKey = query.key;
      var predicats = [];
      if (typeof data[0] !== "object") {
        prop = null;
      }
      for (var i = 0; i < data.length; i++) {
        if (typeof data[0] === "object") {
          value = DataUtil.getObject(pKey || prop, data[i]);
        } else {
          value = data[i];
        }
        predicats.push(new Predicate(key, "equal", value));
      }
      return Predicate.or(predicats);
    };
    UrlAdaptor2.prototype.getAggregateResult = function(pvt, data, args, groupDs, query) {
      var pData = data;
      if (data && data.result) {
        pData = data.result;
      }
      if (pvt && pvt.aggregates && pvt.aggregates.length) {
        var agg = pvt.aggregates;
        var fn = void 0;
        var aggregateData = pData;
        var res = {};
        if (data.aggregate) {
          aggregateData = data.aggregate;
        }
        for (var i = 0; i < agg.length; i++) {
          fn = DataUtil.aggregates[agg[i].type];
          if (fn) {
            res[agg[i].field + " - " + agg[i].type] = fn(aggregateData, agg[i].field);
          }
        }
        args.aggregates = res;
      }
      var key = "key";
      var isServerGrouping = Array.isArray(data.result) && data.result.length && !isNullOrUndefined(data.result[0][key]);
      if (pvt && pvt.groups && pvt.groups.length && !isServerGrouping) {
        var groups = pvt.groups;
        for (var i = 0; i < groups.length; i++) {
          var level = null;
          if (!isNullOrUndefined(groupDs)) {
            groupDs = DataUtil.group(groupDs, groups[i]);
          }
          var groupQuery = Query.filterQueries(query.queries, "onGroup")[i].e;
          pData = DataUtil.group(pData, groups[i], pvt.aggregates, level, groupDs, groupQuery.comparer);
        }
        args.result = pData;
      }
      return args;
    };
    UrlAdaptor2.prototype.getQueryRequest = function(query) {
      var req = { sorts: [], groups: [], filters: [], searches: [], aggregates: [] };
      req.sorts = Query.filterQueries(query.queries, "onSortBy");
      req.groups = Query.filterQueries(query.queries, "onGroup");
      req.filters = Query.filterQueries(query.queries, "onWhere");
      req.searches = Query.filterQueries(query.queries, "onSearch");
      req.aggregates = Query.filterQueries(query.queries, "onAggregates");
      return req;
    };
    UrlAdaptor2.prototype.addParams = function(options) {
      var req = options.reqParams;
      if (options.params.length) {
        req.params = {};
      }
      for (var _i = 0, _a = options.params; _i < _a.length; _i++) {
        var tmp = _a[_i];
        if (req[tmp.key]) {
          throw new Error("Query() - addParams: Custom Param is conflicting other request arguments");
        }
        req[tmp.key] = tmp.value;
        if (tmp.fn) {
          req[tmp.key] = tmp.fn.call(options.query, tmp.key, options.query, options.dm);
        }
        req.params[tmp.key] = req[tmp.key];
      }
    };
    return UrlAdaptor2;
  })(Adaptor)
);
var ODataAdaptor = (
  /** @class */
  (function(_super) {
    __extends(ODataAdaptor2, _super);
    function ODataAdaptor2(props) {
      var _this = _super.call(this) || this;
      _this.options = extend({}, _this.options, {
        requestType: "get",
        accept: "application/json;odata=light;q=1,application/json;odata=verbose;q=0.5",
        multipartAccept: "multipart/mixed",
        sortBy: "$orderby",
        select: "$select",
        skip: "$skip",
        take: "$top",
        count: "$inlinecount",
        where: "$filter",
        expand: "$expand",
        batch: "$batch",
        changeSet: "--changeset_",
        batchPre: "batch_",
        contentId: "Content-Id: ",
        batchContent: "Content-Type: multipart/mixed; boundary=",
        changeSetContent: "Content-Type: application/http\nContent-Transfer-Encoding: binary ",
        batchChangeSetContentType: "Content-Type: application/json; charset=utf-8 ",
        updateType: "PUT"
      });
      extend(_this.options, props || {});
      return _this;
    }
    ODataAdaptor2.prototype.getModuleName = function() {
      return "ODataAdaptor";
    };
    ODataAdaptor2.prototype.onPredicate = function(predicate, query, requiresCast) {
      var returnValue = "";
      var operator;
      var guid;
      var val = predicate.value;
      var type = typeof val;
      var field = predicate.field ? ODataAdaptor2.getField(predicate.field) : null;
      if (val instanceof Date) {
        val = "datetime'" + DataUtil.parse.replacer(val) + "'";
      }
      if (type === "string") {
        val = val.replace(/'/g, "''");
        if (predicate.ignoreCase) {
          val = val.toLowerCase();
        }
        if (predicate.operator !== "like") {
          val = encodeURIComponent(val);
        }
        if (predicate.operator !== "wildcard" && predicate.operator !== "like") {
          val = "'" + val + "'";
        }
        if (requiresCast) {
          field = "cast(" + field + ", 'Edm.String')";
        }
        if (DataUtil.parse.isGuid(val)) {
          guid = "guid";
        }
        if (predicate.ignoreCase) {
          if (!guid) {
            field = "tolower(" + field + ")";
          }
          val = val.toLowerCase();
        }
      }
      if (predicate.operator === "isempty" || predicate.operator === "isnull" || predicate.operator === "isnotempty" || predicate.operator === "isnotnull") {
        operator = predicate.operator.indexOf("isnot") !== -1 ? DataUtil.odBiOperator["notequal"] : DataUtil.odBiOperator["equal"];
        val = predicate.operator === "isnull" || predicate.operator === "isnotnull" ? null : "''";
      } else {
        operator = DataUtil.odBiOperator[predicate.operator];
      }
      if (operator) {
        returnValue += field;
        returnValue += operator;
        if (guid) {
          returnValue += guid;
        }
        return returnValue + val;
      }
      if (!isNullOrUndefined(this.getModuleName) && this.getModuleName() === "ODataV4Adaptor") {
        operator = DataUtil.odv4UniOperator[predicate.operator];
      } else {
        operator = DataUtil.odUniOperator[predicate.operator];
      }
      if (operator === "like") {
        val = val;
        if (val.indexOf("%") !== -1) {
          if (val.charAt(0) === "%" && val.lastIndexOf("%") < 2) {
            val = val.substring(1, val.length);
            operator = !isNullOrUndefined(this.getModuleName) && this.getModuleName() === "ODataV4Adaptor" ? DataUtil.odv4UniOperator["startswith"] : DataUtil.odUniOperator["startswith"];
          } else if (val.charAt(val.length - 1) === "%" && val.indexOf("%") > val.length - 3) {
            val = val.substring(0, val.length - 1);
            operator = !isNullOrUndefined(this.getModuleName) && this.getModuleName() === "ODataV4Adaptor" ? DataUtil.odv4UniOperator["endswith"] : DataUtil.odUniOperator["endswith"];
          } else if (val.lastIndexOf("%") !== val.indexOf("%") && val.lastIndexOf("%") > val.indexOf("%") + 1) {
            val = val.substring(val.indexOf("%") + 1, val.lastIndexOf("%"));
            operator = !isNullOrUndefined(this.getModuleName) && this.getModuleName() === "ODataV4Adaptor" ? DataUtil.odv4UniOperator["contains"] : DataUtil.odUniOperator["contains"];
          } else {
            operator = !isNullOrUndefined(this.getModuleName) && this.getModuleName() === "ODataV4Adaptor" ? DataUtil.odv4UniOperator["contains"] : DataUtil.odUniOperator["contains"];
          }
        }
        val = encodeURIComponent(val);
        val = "'" + val + "'";
      } else if (operator === "wildcard") {
        val = val;
        if (val.indexOf("*") !== -1) {
          var splittedStringValue = val.split("*");
          var splittedValue = void 0;
          var count = 0;
          if (val.indexOf("*") !== 0 && splittedStringValue[0].indexOf("%3f") === -1 && splittedStringValue[0].indexOf("?") === -1) {
            splittedValue = splittedStringValue[0];
            splittedValue = "'" + splittedValue + "'";
            operator = !isNullOrUndefined(this.getModuleName) && this.getModuleName() === "ODataV4Adaptor" ? DataUtil.odv4UniOperator["startswith"] : DataUtil.odUniOperator["startswith"];
            returnValue += operator + "(";
            returnValue += field + ",";
            if (guid) {
              returnValue += guid;
            }
            returnValue += splittedValue + ")";
            count++;
          }
          if (val.lastIndexOf("*") !== val.length - 1 && splittedStringValue[splittedStringValue.length - 1].indexOf("%3f") === -1 && splittedStringValue[splittedStringValue.length - 1].indexOf("?") === -1) {
            splittedValue = splittedStringValue[splittedStringValue.length - 1];
            splittedValue = "'" + splittedValue + "'";
            operator = !isNullOrUndefined(this.getModuleName) && this.getModuleName() === "ODataV4Adaptor" ? DataUtil.odv4UniOperator["endswith"] : DataUtil.odUniOperator["endswith"];
            if (count > 0) {
              returnValue += " and ";
            }
            returnValue += operator + "(";
            returnValue += field + ",";
            if (guid) {
              returnValue += guid;
            }
            returnValue += splittedValue + ")";
            count++;
          }
          if (splittedStringValue.length > 2) {
            for (var i = 1; i < splittedStringValue.length - 1; i++) {
              if (splittedStringValue[i].indexOf("%3f") === -1 && splittedStringValue[i].indexOf("?") === -1) {
                splittedValue = splittedStringValue[i];
                splittedValue = "'" + splittedValue + "'";
                operator = !isNullOrUndefined(this.getModuleName) && this.getModuleName() === "ODataV4Adaptor" ? DataUtil.odv4UniOperator["contains"] : DataUtil.odUniOperator["contains"];
                if (count > 0) {
                  returnValue += " and ";
                }
                if (operator === "substringof" || operator === "not substringof") {
                  var temp = splittedValue;
                  splittedValue = field;
                  field = temp;
                }
                returnValue += operator + "(";
                returnValue += field + ",";
                if (guid) {
                  returnValue += guid;
                }
                returnValue += splittedValue + ")";
                count++;
              }
            }
          }
          if (count === 0) {
            operator = !isNullOrUndefined(this.getModuleName) && this.getModuleName() === "ODataV4Adaptor" ? DataUtil.odv4UniOperator["contains"] : DataUtil.odUniOperator["contains"];
            if (val.indexOf("?") !== -1 || val.indexOf("%3f") !== -1) {
              val = val.indexOf("?") !== -1 ? val.split("?").join("") : val.split("%3f").join("");
            }
            val = "'" + val + "'";
          } else {
            operator = "wildcard";
          }
        } else {
          operator = !isNullOrUndefined(this.getModuleName) && this.getModuleName() === "ODataV4Adaptor" ? DataUtil.odv4UniOperator["contains"] : DataUtil.odUniOperator["contains"];
          if (val.indexOf("?") !== -1 || val.indexOf("%3f") !== -1) {
            val = val.indexOf("?") !== -1 ? val.split("?").join("") : val.split("%3f").join("");
          }
          val = "'" + val + "'";
        }
      }
      if (operator === "substringof" || operator === "not substringof") {
        var temp = val;
        val = field;
        field = temp;
      }
      if (operator !== "wildcard") {
        returnValue += operator + "(";
        returnValue += field + ",";
        if (guid) {
          returnValue += guid;
        }
        returnValue += val + ")";
      }
      return returnValue;
    };
    ODataAdaptor2.prototype.addParams = function(options) {
      _super.prototype.addParams.call(this, options);
      delete options.reqParams.params;
    };
    ODataAdaptor2.prototype.onComplexPredicate = function(predicate, query, requiresCast) {
      var res = [];
      for (var i = 0; i < predicate.predicates.length; i++) {
        res.push("(" + this.onEachWhere(predicate.predicates[i], query, requiresCast) + ")");
      }
      return res.join(" " + predicate.condition + " ");
    };
    ODataAdaptor2.prototype.onEachWhere = function(filter, query, requiresCast) {
      return filter.isComplex ? this.onComplexPredicate(filter, query, requiresCast) : this.onPredicate(filter, query, requiresCast);
    };
    ODataAdaptor2.prototype.onWhere = function(filters) {
      if (this.pvt.search) {
        filters.push(this.onEachWhere(this.pvt.search, null, true));
      }
      return filters.join(" and ");
    };
    ODataAdaptor2.prototype.onEachSearch = function(e) {
      if (e.fields && e.fields.length === 0) {
        DataUtil.throwError("Query() - Search : oData search requires list of field names to search");
      }
      var filter = this.pvt.search || [];
      for (var i = 0; i < e.fields.length; i++) {
        filter.push(new Predicate(e.fields[i], e.operator, e.key, e.ignoreCase));
      }
      this.pvt.search = filter;
    };
    ODataAdaptor2.prototype.onSearch = function(e) {
      this.pvt.search = Predicate.or(this.pvt.search);
      return "";
    };
    ODataAdaptor2.prototype.onEachSort = function(e) {
      var res = [];
      if (e.name instanceof Array) {
        for (var i = 0; i < e.name.length; i++) {
          res.push(ODataAdaptor2.getField(e.name[i]) + (e.direction === "descending" ? " desc" : ""));
        }
      } else {
        res.push(ODataAdaptor2.getField(e.name) + (e.direction === "descending" ? " desc" : ""));
      }
      return res.join(",");
    };
    ODataAdaptor2.prototype.onSortBy = function(e) {
      return e.reverse().join(",");
    };
    ODataAdaptor2.prototype.onGroup = function(e) {
      this.pvt.groups = e;
      return [];
    };
    ODataAdaptor2.prototype.onSelect = function(e) {
      for (var i = 0; i < e.length; i++) {
        e[i] = ODataAdaptor2.getField(e[i]);
      }
      return e.join(",");
    };
    ODataAdaptor2.prototype.onAggregates = function(e) {
      this.pvt.aggregates = e;
      return "";
    };
    ODataAdaptor2.prototype.onCount = function(e) {
      return e === true ? "allpages" : "";
    };
    ODataAdaptor2.prototype.beforeSend = function(dm, request, settings) {
      if (DataUtil.endsWith(settings.url, this.options.batch) && settings.type.toLowerCase() === "post") {
        request.headers.set("Accept", this.options.multipartAccept);
        request.headers.set("DataServiceVersion", "2.0");
      } else {
        request.headers.set("Accept", this.options.accept);
      }
      request.headers.set("DataServiceVersion", "2.0");
      request.headers.set("MaxDataServiceVersion", "2.0");
    };
    ODataAdaptor2.prototype.processResponse = function(data, ds, query, xhr, request, changes) {
      var metaCheck = "odata.metadata";
      if (request && request.type === "GET" && !this.rootUrl && data[metaCheck]) {
        var dataUrls = data[metaCheck].split("/$metadata#");
        this.rootUrl = dataUrls[0];
        this.resourceTableName = dataUrls[1];
      }
      var pvtData = "pvtData";
      if (!isNullOrUndefined(data.d)) {
        var dataCopy = query && query.isCountRequired ? data.d.results : data.d;
        var metaData = "__metadata";
        if (!isNullOrUndefined(dataCopy)) {
          for (var i = 0; i < dataCopy.length; i++) {
            if (!isNullOrUndefined(dataCopy[i][metaData])) {
              delete dataCopy[i][metaData];
            }
          }
        }
      }
      var pvt = request && request[pvtData];
      var emptyAndBatch = this.processBatchResponse(data, query, xhr, request, changes);
      if (emptyAndBatch) {
        return emptyAndBatch;
      }
      var versionCheck = xhr && request.fetchRequest.headers.get("DataServiceVersion");
      var count = null;
      var version = versionCheck && parseInt(versionCheck, 10) || 2;
      if (query && query.isCountRequired) {
        var oDataCount = "__count";
        if (data[oDataCount] || data["odata.count"]) {
          count = data[oDataCount] || data["odata.count"];
        }
        if (data.d) {
          data = data.d;
        }
        if (data[oDataCount] || data["odata.count"]) {
          count = data[oDataCount] || data["odata.count"];
        }
      }
      if (version === 3 && data.value) {
        data = data.value;
      }
      if (data.d) {
        data = data.d;
      }
      if (version < 3 && data.results) {
        data = data.results;
      }
      var args = {};
      args.count = count;
      args.result = data;
      this.getAggregateResult(pvt, data, args, null, query);
      return DataUtil.isNull(count) ? args.result : { result: args.result, count: args.count, aggregates: args.aggregates };
    };
    ODataAdaptor2.prototype.convertToQueryString = function(request, query, dm) {
      var res = [];
      var table = "table";
      var tableName = request[table] || "";
      var format = "$format";
      delete request[table];
      if (dm.dataSource.requiresFormat) {
        request[format] = "json";
      }
      var keys = Object.keys(request);
      for (var _i = 0, keys_4 = keys; _i < keys_4.length; _i++) {
        var prop = keys_4[_i];
        res.push(prop + "=" + request[prop]);
      }
      res = res.join("&");
      if (dm.dataSource.url && dm.dataSource.url.indexOf("?") !== -1 && !tableName) {
        return res;
      }
      return res.length ? tableName + "?" + res : tableName || "";
    };
    ODataAdaptor2.prototype.localTimeReplacer = function(key, convertObj) {
      for (var _i = 0, _a = !isNullOrUndefined(convertObj) ? Object.keys(convertObj) : []; _i < _a.length; _i++) {
        var prop = _a[_i];
        if (convertObj[prop] instanceof Date) {
          convertObj[prop] = DataUtil.dateParse.toLocalTime(convertObj[prop]);
        }
      }
      return convertObj;
    };
    ODataAdaptor2.prototype.insert = function(dm, data, tableName) {
      return {
        url: (dm.dataSource.insertUrl || dm.dataSource.url).replace(/\/*$/, tableName ? "/" + tableName : ""),
        data: JSON.stringify(data, this.options.localTime ? this.localTimeReplacer : null)
      };
    };
    ODataAdaptor2.prototype.remove = function(dm, keyField, value, tableName) {
      var url;
      if (typeof value === "string" && !DataUtil.parse.isGuid(value)) {
        url = "('" + value + "')";
      } else {
        url = "(" + value + ")";
      }
      return {
        type: "DELETE",
        url: (dm.dataSource.removeUrl || dm.dataSource.url).replace(/\/*$/, tableName ? "/" + tableName : "") + url
      };
    };
    ODataAdaptor2.prototype.update = function(dm, keyField, value, tableName, query, original) {
      if (this.options.updateType === "PATCH" && !isNullOrUndefined(original)) {
        value = this.compareAndRemove(value, original, keyField);
      }
      var url;
      if (typeof value[keyField] === "string" && !DataUtil.parse.isGuid(value[keyField])) {
        url = "('" + value[keyField] + "')";
      } else {
        url = "(" + value[keyField] + ")";
      }
      return {
        type: this.options.updateType,
        url: (dm.dataSource.updateUrl || dm.dataSource.url).replace(/\/*$/, tableName ? "/" + tableName : "") + url,
        data: JSON.stringify(value, this.options.localTime ? this.localTimeReplacer : null),
        accept: this.options.accept
      };
    };
    ODataAdaptor2.prototype.batchRequest = function(dm, changes, e, query, original) {
      var initialGuid = e.guid = DataUtil.getGuid(this.options.batchPre);
      var url = dm.dataSource.batchUrl || this.rootUrl ? (dm.dataSource.batchUrl || this.rootUrl) + "/" + this.options.batch : (dm.dataSource.batchUrl || dm.dataSource.url).replace(/\/*$/, "/" + this.options.batch);
      e.url = this.resourceTableName ? this.resourceTableName : e.url;
      var args = {
        url: e.url,
        key: e.key,
        cid: 1,
        cSet: DataUtil.getGuid(this.options.changeSet)
      };
      var req = "--" + initialGuid + "\n";
      req += "Content-Type: multipart/mixed; boundary=" + args.cSet.replace("--", "") + "\n";
      this.pvt.changeSet = 0;
      req += this.generateInsertRequest(changes.addedRecords, args, dm);
      req += this.generateUpdateRequest(changes.changedRecords, args, dm, original ? original.changedRecords : []);
      req += this.generateDeleteRequest(changes.deletedRecords, args, dm);
      req += args.cSet + "--\n";
      req += "--" + initialGuid + "--";
      return {
        type: "POST",
        url,
        dataType: "json",
        contentType: "multipart/mixed; charset=UTF-8;boundary=" + initialGuid,
        data: req
      };
    };
    ODataAdaptor2.prototype.generateDeleteRequest = function(arr, e, dm) {
      if (!arr) {
        return "";
      }
      var req = "";
      var stat = {
        "method": "DELETE ",
        "url": function(data, i, key) {
          var url = DataUtil.getObject(key, data[i]);
          if (typeof url === "number" || DataUtil.parse.isGuid(url)) {
            return "(" + url + ")";
          } else if (url instanceof Date) {
            var dateTime = data[i][key];
            return "(" + dateTime.toJSON() + ")";
          } else {
            return "('" + url + "')";
          }
        },
        "data": function(data, i) {
          return "";
        }
      };
      req = this.generateBodyContent(arr, e, stat, dm);
      return req + "\n";
    };
    ODataAdaptor2.prototype.generateInsertRequest = function(arr, e, dm) {
      if (!arr) {
        return "";
      }
      var req = "";
      var stat = {
        "method": "POST ",
        "url": function(data, i, key) {
          return "";
        },
        "data": function(data, i) {
          return JSON.stringify(data[i]) + "\n\n";
        }
      };
      req = this.generateBodyContent(arr, e, stat, dm);
      return req;
    };
    ODataAdaptor2.prototype.generateUpdateRequest = function(arr, e, dm, org) {
      var _this = this;
      if (!arr) {
        return "";
      }
      var req = "";
      arr.forEach(function(change) {
        return change = _this.compareAndRemove(change, org.filter(function(o) {
          return DataUtil.getObject(e.key, o) === DataUtil.getObject(e.key, change);
        })[0], e.key);
      });
      var stat = {
        "method": this.options.updateType + " ",
        "url": function(data, i, key) {
          if (typeof data[i][key] === "number" || DataUtil.parse.isGuid(data[i][key])) {
            return "(" + data[i][key] + ")";
          } else if (data[i][key] instanceof Date) {
            var date = data[i][key];
            return "(" + date.toJSON() + ")";
          } else {
            return "('" + data[i][key] + "')";
          }
        },
        "data": function(data, i) {
          return JSON.stringify(data[i]) + "\n\n";
        }
      };
      req = this.generateBodyContent(arr, e, stat, dm);
      return req;
    };
    ODataAdaptor2.getField = function(prop) {
      return prop.replace(/\./g, "/");
    };
    ODataAdaptor2.prototype.generateBodyContent = function(arr, e, stat, dm) {
      var req = "";
      for (var i = 0; i < arr.length; i++) {
        req += "\n" + e.cSet + "\n";
        req += this.options.changeSetContent + "\n\n";
        req += stat.method;
        if (stat.method === "POST ") {
          req += (dm.dataSource.insertUrl || dm.dataSource.crudUrl || e.url) + stat.url(arr, i, e.key) + " HTTP/1.1\n";
        } else if (stat.method === "PUT " || stat.method === "PATCH ") {
          req += (dm.dataSource.updateUrl || dm.dataSource.crudUrl || e.url) + stat.url(arr, i, e.key) + " HTTP/1.1\n";
        } else if (stat.method === "DELETE ") {
          req += (dm.dataSource.removeUrl || dm.dataSource.crudUrl || e.url) + stat.url(arr, i, e.key) + " HTTP/1.1\n";
        }
        req += "Accept: " + this.options.accept + "\n";
        req += "Content-Id: " + this.pvt.changeSet++ + "\n";
        req += this.options.batchChangeSetContentType + "\n";
        if (!isNullOrUndefined(arr[i]["@odata.etag"])) {
          req += "If-Match: " + arr[i]["@odata.etag"] + "\n\n";
          delete arr[i]["@odata.etag"];
        } else {
          req += "\n";
        }
        req += stat.data(arr, i);
      }
      return req;
    };
    ODataAdaptor2.prototype.processBatchResponse = function(data, query, xhr, request, changes) {
      if (xhr && xhr.headers.get("Content-Type") && xhr.headers.get("Content-Type").indexOf("xml") !== -1) {
        return query.isCountRequired ? { result: [], count: 0 } : [];
      }
      if (request && this.options.batch && DataUtil.endsWith(request.url, this.options.batch) && request.type.toLowerCase() === "post") {
        var guid = xhr.headers.get("Content-Type");
        var cIdx = void 0;
        var jsonObj = void 0;
        var d = data + "";
        guid = guid.substring(guid.indexOf("=batchresponse") + 1);
        d = d.split(guid);
        if (d.length < 2) {
          return {};
        }
        d = d[1];
        var exVal = /(?:\bContent-Type.+boundary=)(changesetresponse.+)/i.exec(d);
        if (exVal) {
          d.replace(exVal[0], "");
        }
        var changeGuid = exVal ? exVal[1] : "";
        d = d.split(changeGuid);
        for (var i = d.length; i > -1; i--) {
          if (!/\bContent-ID:/i.test(d[i]) || !/\bHTTP.+201/.test(d[i])) {
            continue;
          }
          cIdx = parseInt(/\bContent-ID: (\d+)/i.exec(d[i])[1], 10);
          if (changes.addedRecords[cIdx]) {
            jsonObj = DataUtil.parse.parseJson(/^\{.+\}/m.exec(d[i])[0]);
            extend({}, changes.addedRecords[cIdx], this.processResponse(jsonObj));
          }
        }
        return changes;
      }
      return null;
    };
    ODataAdaptor2.prototype.compareAndRemove = function(data, original, key) {
      var _this = this;
      if (isNullOrUndefined(original)) {
        return data;
      }
      Object.keys(data).forEach(function(prop) {
        if (prop !== key && prop !== "@odata.etag") {
          if (DataUtil.isPlainObject(data[prop])) {
            _this.compareAndRemove(data[prop], original[prop]);
            var final = Object.keys(data[prop]).filter(function(data2) {
              return data2 !== "@odata.etag";
            });
            if (final.length === 0) {
              delete data[prop];
            }
          } else if (data[prop] === original[prop]) {
            delete data[prop];
          } else if (data[prop] && original[prop] && data[prop].valueOf() === original[prop].valueOf()) {
            delete data[prop];
          }
        }
      });
      return data;
    };
    return ODataAdaptor2;
  })(UrlAdaptor)
);
var ODataV4Adaptor = (
  /** @class */
  (function(_super) {
    __extends(ODataV4Adaptor2, _super);
    function ODataV4Adaptor2(props) {
      var _this = _super.call(this, props) || this;
      _this.options = extend({}, _this.options, {
        requestType: "get",
        accept: "application/json, text/javascript, */*; q=0.01",
        multipartAccept: "multipart/mixed",
        sortBy: "$orderby",
        select: "$select",
        skip: "$skip",
        take: "$top",
        count: "$count",
        search: "$search",
        where: "$filter",
        expand: "$expand",
        batch: "$batch",
        changeSet: "--changeset_",
        batchPre: "batch_",
        contentId: "Content-Id: ",
        batchContent: "Content-Type: multipart/mixed; boundary=",
        changeSetContent: "Content-Type: application/http\nContent-Transfer-Encoding: binary ",
        batchChangeSetContentType: "Content-Type: application/json; charset=utf-8 ",
        updateType: "PATCH",
        localTime: false,
        apply: "$apply"
      });
      extend(_this.options, props || {});
      return _this;
    }
    ODataV4Adaptor2.prototype.getModuleName = function() {
      return "ODataV4Adaptor";
    };
    ODataV4Adaptor2.prototype.onCount = function(e) {
      return e === true ? "true" : "";
    };
    ODataV4Adaptor2.prototype.onPredicate = function(predicate, query, requiresCast) {
      var returnValue = "";
      var val = predicate.value;
      var isDate = val instanceof Date;
      if (query instanceof Query) {
        var queries = this.getQueryRequest(query);
        for (var i = 0; i < queries.filters.length; i++) {
          if (queries.filters[i].e.key === predicate.value) {
            requiresCast = true;
          }
        }
      }
      returnValue = _super.prototype.onPredicate.call(this, predicate, query, requiresCast);
      if (isDate) {
        returnValue = returnValue.replace(/datetime'(.*)'$/, "$1");
      }
      if (DataUtil.parse.isGuid(val)) {
        returnValue = returnValue.replace("guid", "").replace(/'/g, "");
      }
      return returnValue;
    };
    ODataV4Adaptor2.prototype.onEachSearch = function(e) {
      var search = this.pvt.searches || [];
      search.push(e.key);
      this.pvt.searches = search;
    };
    ODataV4Adaptor2.prototype.onSearch = function(e) {
      return this.pvt.searches.join(" OR ");
    };
    ODataV4Adaptor2.prototype.onExpand = function(e) {
      var _this = this;
      var selected = {};
      var expanded = {};
      var expands = e.expands.slice();
      var exArr = [];
      var selects = e.selects.filter(function(item) {
        return item.indexOf(".") > -1;
      });
      selects.forEach(function(select2) {
        var splits = select2.split(".");
        if (!(splits[0] in selected)) {
          selected[splits[0]] = [];
        }
        if (splits.length === 2) {
          if (selected[splits[0]].length && Object.keys(selected).indexOf(splits[0]) !== -1) {
            if (selected[splits[0]][0].indexOf("$expand") !== -1 && selected[splits[0]][0].indexOf(";$select=") === -1) {
              selected[splits[0]][0] = selected[splits[0]][0] + ";$select=" + splits[1];
            } else {
              selected[splits[0]][0] = selected[splits[0]][0] + "," + splits[1];
            }
          } else {
            selected[splits[0]].push("$select=" + splits[1]);
          }
        } else {
          var sel = "$select=" + splits[splits.length - 1];
          var exp = "";
          var close_1 = "";
          for (var i = 1; i < splits.length - 1; i++) {
            exp = exp + "$expand=" + splits[i] + "(";
            close_1 = close_1 + ")";
          }
          var combineVal = exp + sel + close_1;
          if (selected[splits[0]].length && Object.keys(selected).indexOf(splits[0]) !== -1 && _this.expandQueryIndex(selected[splits[0]], true)) {
            var idx = _this.expandQueryIndex(selected[splits[0]]);
            selected[splits[0]][idx] = selected[splits[0]][idx] + combineVal.replace("$expand=", ",");
          } else {
            selected[splits[0]].push(combineVal);
          }
        }
      });
      Object.keys(selected).forEach(function(expand) {
        if (expands.indexOf(expand) === -1) {
          expands.push(expand);
        }
      });
      expands.forEach(function(expand) {
        expanded[expand] = expand in selected ? expand + "(" + selected[expand].join(";") + ")" : expand;
      });
      Object.keys(expanded).forEach(function(ex) {
        return exArr.push(expanded[ex]);
      });
      return exArr.join(",");
    };
    ODataV4Adaptor2.prototype.expandQueryIndex = function(query, isExpand) {
      for (var i = 0; i < query.length; i++) {
        if (query[i].indexOf("$expand") !== -1) {
          return isExpand ? true : i;
        }
      }
      return isExpand ? false : 0;
    };
    ODataV4Adaptor2.prototype.onDistinct = function(distinctFields) {
      var fields = distinctFields.map(function(field) {
        return ODataAdaptor.getField(field);
      }).join(",");
      return "groupby((" + fields + "))";
    };
    ODataV4Adaptor2.prototype.onSelect = function(e) {
      return _super.prototype.onSelect.call(this, e.filter(function(item) {
        return item.indexOf(".") === -1;
      }));
    };
    ODataV4Adaptor2.prototype.beforeSend = function(dm, request, settings) {
      if (settings.type === "POST" || settings.type === "PUT" || settings.type === "PATCH") {
        request.headers.set("Prefer", "return=representation");
      }
      request.headers.set("Accept", this.options.accept);
    };
    ODataV4Adaptor2.prototype.processResponse = function(data, ds, query, xhr, request, changes) {
      var metaName = "@odata.context";
      var metaV4Name = "@context";
      if (request && request.type === "GET" && !this.rootUrl && (data[metaName] || data[metaV4Name])) {
        var dataUrl = data[metaName] ? data[metaName].split("/$metadata#") : data[metaV4Name].split("/$metadata#");
        this.rootUrl = dataUrl[0];
        this.resourceTableName = dataUrl[1];
      }
      var pvtData = "pvtData";
      var pvt = request && request[pvtData];
      var emptyAndBatch = _super.prototype.processBatchResponse.call(this, data, query, xhr, request, changes);
      if (emptyAndBatch) {
        return emptyAndBatch;
      }
      var count = null;
      var dataCount = "@odata.count";
      var dataV4Count = "@count";
      if (query && query.isCountRequired) {
        if (dataCount in data) {
          count = data[dataCount];
        } else if (dataV4Count in data) {
          count = data[dataV4Count];
        }
      }
      data = !isNullOrUndefined(data.value) ? data.value : data;
      var args = {};
      args.count = count;
      args.result = data;
      this.getAggregateResult(pvt, data, args, null, query);
      return DataUtil.isNull(count) ? args.result : { result: args.result, count, aggregates: args.aggregates };
    };
    return ODataV4Adaptor2;
  })(ODataAdaptor)
);
var WebApiAdaptor = (
  /** @class */
  (function(_super) {
    __extends(WebApiAdaptor2, _super);
    function WebApiAdaptor2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    WebApiAdaptor2.prototype.getModuleName = function() {
      return "WebApiAdaptor";
    };
    WebApiAdaptor2.prototype.insert = function(dm, data, tableName) {
      return {
        type: "POST",
        url: dm.dataSource.url,
        data: JSON.stringify(data)
      };
    };
    WebApiAdaptor2.prototype.remove = function(dm, keyField, value, tableName) {
      return {
        type: "DELETE",
        url: dm.dataSource.url + "/" + value,
        data: JSON.stringify(value)
      };
    };
    WebApiAdaptor2.prototype.update = function(dm, keyField, value, tableName) {
      return {
        type: "PUT",
        url: dm.dataSource.url,
        data: JSON.stringify(value)
      };
    };
    WebApiAdaptor2.prototype.batchRequest = function(dm, changes, e) {
      var _this = this;
      var initialGuid = e.guid = DataUtil.getGuid(this.options.batchPre);
      var url = dm.dataSource.url.replace(/\/*$/, "/" + this.options.batch);
      e.url = this.resourceTableName ? this.resourceTableName : e.url;
      var req = [];
      var _loop_1 = function(i2, x2) {
        changes.addedRecords.forEach(function(j, d) {
          var stat = {
            "method": "POST ",
            "url": function(data, i3, key) {
              return "";
            },
            "data": function(data, i3) {
              return JSON.stringify(data[i3]) + "\n\n";
            }
          };
          req.push("--" + initialGuid);
          req.push("Content-Type: application/http; msgtype=request", "");
          req.push("POST /api/" + (dm.dataSource.insertUrl || dm.dataSource.crudUrl || e.url) + stat.url(changes.addedRecords, i2, e.key) + " HTTP/1.1");
          req.push("Content-Type: application/json; charset=utf-8");
          req.push("Host: " + location.host);
          req.push("", j ? JSON.stringify(j) : "");
        });
      };
      for (var i = 0, x = changes.addedRecords.length; i < x; i++) {
        _loop_1(i, x);
      }
      var _loop_2 = function(i2, x2) {
        changes.changedRecords.forEach(function(j, d) {
          var stat = {
            "method": _this.options.updateType + " ",
            "url": function(data, i3, key) {
              return "";
            },
            "data": function(data, i3) {
              return JSON.stringify(data[i3]) + "\n\n";
            }
          };
          req.push("--" + initialGuid);
          req.push("Content-Type: application/http; msgtype=request", "");
          req.push("PUT /api/" + (dm.dataSource.updateUrl || dm.dataSource.crudUrl || e.url) + stat.url(changes.changedRecords, i2, e.key) + " HTTP/1.1");
          req.push("Content-Type: application/json; charset=utf-8");
          req.push("Host: " + location.host);
          req.push("", j ? JSON.stringify(j) : "");
        });
      };
      for (var i = 0, x = changes.changedRecords.length; i < x; i++) {
        _loop_2(i, x);
      }
      var _loop_3 = function(i2, x2) {
        changes.deletedRecords.forEach(function(j, d) {
          var state = {
            "mtd": "DELETE ",
            "url": function(data, i3, key) {
              var url2 = DataUtil.getObject(key, data[i3]);
              if (typeof url2 === "number" || DataUtil.parse.isGuid(url2)) {
                return "/" + url2;
              } else if (url2 instanceof Date) {
                var datTime = data[i3][key];
                return "/" + datTime.toJSON();
              } else {
                return "/'" + url2 + "'";
              }
            },
            "data": function(data, i3) {
              return "";
            }
          };
          req.push("--" + initialGuid);
          req.push("Content-Type: application/http; msgtype=request", "");
          req.push("DELETE /api/" + (dm.dataSource.removeUrl || dm.dataSource.crudUrl || e.url) + state.url(changes.deletedRecords, i2, e.key) + " HTTP/1.1");
          req.push("Content-Type: application/json; charset=utf-8");
          req.push("Host: " + location.host);
          req.push("", j ? JSON.stringify(j) : "");
        });
      };
      for (var i = 0, x = changes.deletedRecords.length; i < x; i++) {
        _loop_3(i, x);
      }
      req.push("--" + initialGuid + "--", "");
      return {
        type: "POST",
        url,
        contentType: "multipart/mixed; boundary=" + initialGuid,
        data: req.join("\r\n")
      };
    };
    WebApiAdaptor2.prototype.beforeSend = function(dm, request, settings) {
      request.headers.set("Accept", "application/json, text/javascript, */*; q=0.01");
    };
    WebApiAdaptor2.prototype.processResponse = function(data, ds, query, xhr, request, changes) {
      var pvtData = "pvtData";
      var pvt = request && request[pvtData];
      var count = null;
      var args = {};
      if (request && request.type.toLowerCase() !== "post") {
        var versionCheck = xhr && request.fetchRequest.headers.get("DataServiceVersion");
        var version = versionCheck && parseInt(versionCheck, 10) || 2;
        if (query && query.isCountRequired) {
          if (!DataUtil.isNull(data.Count)) {
            count = data.Count;
          }
        }
        if (version < 3 && data.Items) {
          data = data.Items;
        }
        args.count = count;
        args.result = data;
        this.getAggregateResult(pvt, data, args, null, query);
      }
      args.result = args.result || data;
      return DataUtil.isNull(count) ? args.result : { result: args.result, count: args.count, aggregates: args.aggregates };
    };
    return WebApiAdaptor2;
  })(ODataAdaptor)
);
var WebMethodAdaptor = (
  /** @class */
  (function(_super) {
    __extends(WebMethodAdaptor2, _super);
    function WebMethodAdaptor2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    WebMethodAdaptor2.prototype.processQuery = function(dm, query, hierarchyFilters) {
      var obj = new UrlAdaptor().processQuery(dm, query, hierarchyFilters);
      var getData = "data";
      var data = DataUtil.parse.parseJson(obj[getData]);
      var result = {};
      var value = "value";
      if (data.param) {
        for (var i = 0; i < data.param.length; i++) {
          var param = data.param[i];
          var key = Object.keys(param)[0];
          result[key] = param[key];
        }
      }
      result[value] = data;
      var pvtData = "pvtData";
      var url = "url";
      return {
        data: JSON.stringify(result, DataUtil.parse.jsonDateReplacer),
        url: obj[url],
        pvtData: obj[pvtData],
        type: "POST",
        contentType: "application/json; charset=utf-8"
      };
    };
    return WebMethodAdaptor2;
  })(UrlAdaptor)
);
var RemoteSaveAdaptor = (
  /** @class */
  (function(_super) {
    __extends(RemoteSaveAdaptor2, _super);
    function RemoteSaveAdaptor2() {
      return _super.call(this) || this;
    }
    RemoteSaveAdaptor2.prototype.insert = function(dm, data, tableName, query, position) {
      this.pvt.position = position;
      this.updateType = "add";
      return {
        url: dm.dataSource.insertUrl || dm.dataSource.crudUrl || dm.dataSource.url,
        data: JSON.stringify(extend({}, {
          value: data,
          table: tableName,
          action: "insert"
        }, DataUtil.getAddParams(this, dm, query)))
      };
    };
    RemoteSaveAdaptor2.prototype.remove = function(dm, keyField, val, tableName, query) {
      _super.prototype.remove.call(this, dm, keyField, val);
      return {
        type: "POST",
        url: dm.dataSource.removeUrl || dm.dataSource.crudUrl || dm.dataSource.url,
        data: JSON.stringify(extend({}, {
          key: val,
          keyColumn: keyField,
          table: tableName,
          action: "remove"
        }, DataUtil.getAddParams(this, dm, query)))
      };
    };
    RemoteSaveAdaptor2.prototype.update = function(dm, keyField, val, tableName, query) {
      this.updateType = "update";
      this.updateKey = keyField;
      return {
        type: "POST",
        url: dm.dataSource.updateUrl || dm.dataSource.crudUrl || dm.dataSource.url,
        data: JSON.stringify(extend({}, {
          value: val,
          action: "update",
          keyColumn: keyField,
          key: val[keyField],
          table: tableName
        }, DataUtil.getAddParams(this, dm, query)))
      };
    };
    RemoteSaveAdaptor2.prototype.processResponse = function(data, ds, query, xhr, request, changes, e) {
      var i;
      var newData = request ? JSON.parse(request.data) : data;
      data = newData.action === "batch" ? DataUtil.parse.parseJson(data) : data;
      if (this.updateType === "add") {
        _super.prototype.insert.call(this, ds, data, null, null, this.pvt.position);
      }
      if (this.updateType === "update") {
        _super.prototype.update.call(this, ds, this.updateKey, data);
      }
      this.updateType = void 0;
      if (data.added) {
        for (i = 0; i < data.added.length; i++) {
          _super.prototype.insert.call(this, ds, data.added[i]);
        }
      }
      if (data.changed) {
        for (i = 0; i < data.changed.length; i++) {
          _super.prototype.update.call(this, ds, e.key, data.changed[i]);
        }
      }
      if (data.deleted) {
        for (i = 0; i < data.deleted.length; i++) {
          _super.prototype.remove.call(this, ds, e.key, data.deleted[i]);
        }
      }
      return data;
    };
    RemoteSaveAdaptor2.prototype.batchRequest = function(dm, changes, e, query, original) {
      return {
        type: "POST",
        url: dm.dataSource.batchUrl || dm.dataSource.crudUrl || dm.dataSource.url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(extend({}, {
          changed: changes.changedRecords,
          added: changes.addedRecords,
          deleted: changes.deletedRecords,
          action: "batch",
          table: e.url,
          key: e.key
        }, DataUtil.getAddParams(this, dm, query)))
      };
    };
    RemoteSaveAdaptor2.prototype.addParams = function(options) {
      var urlParams = new UrlAdaptor();
      urlParams.addParams(options);
    };
    RemoteSaveAdaptor2.prototype.beforeSend = function(dm, request, settings) {
    };
    return RemoteSaveAdaptor2;
  })(JsonAdaptor)
);
var CustomDataAdaptor = (
  /** @class */
  (function(_super) {
    __extends(CustomDataAdaptor2, _super);
    function CustomDataAdaptor2(props) {
      var _this = _super.call(this) || this;
      _this.options = extend({}, _this.options, {
        getData: function() {
        },
        addRecord: function() {
        },
        updateRecord: function() {
        },
        deleteRecord: function() {
        },
        batchUpdate: function() {
        }
      });
      extend(_this.options, props || {});
      return _this;
    }
    CustomDataAdaptor2.prototype.getModuleName = function() {
      return "CustomDataAdaptor";
    };
    return CustomDataAdaptor2;
  })(UrlAdaptor)
);
var GraphQLAdaptor = (
  /** @class */
  (function(_super) {
    __extends(GraphQLAdaptor2, _super);
    function GraphQLAdaptor2(options) {
      var _this = _super.call(this) || this;
      _this.opt = options;
      _this.schema = _this.opt.response;
      _this.query = _this.opt.query;
      _this.getVariables = _this.opt.getVariables ? _this.opt.getVariables : function() {
      };
      _this.getQuery = function() {
        return _this.query;
      };
      return _this;
    }
    GraphQLAdaptor2.prototype.getModuleName = function() {
      return "GraphQLAdaptor";
    };
    GraphQLAdaptor2.prototype.processQuery = function(datamanager, query) {
      var urlQuery = _super.prototype.processQuery.apply(this, arguments);
      var dm = JSON.parse(urlQuery.data);
      var keys = [
        "skip",
        "take",
        "sorted",
        "table",
        "select",
        "where",
        "search",
        "requiresCounts",
        "aggregates",
        "params"
      ];
      var temp = {};
      var str = "searchwhereparams";
      keys.filter(function(e) {
        temp[e] = str.indexOf(e) > -1 ? JSON.stringify(dm[e]) : dm[e];
      });
      var vars = this.getVariables() || {};
      vars["datamanager"] = temp;
      var data = JSON.stringify({
        query: this.getQuery(),
        variables: vars
      });
      urlQuery.data = data;
      return urlQuery;
    };
    GraphQLAdaptor2.prototype.processResponse = function(resData, ds, query, xhr, request) {
      var res = resData;
      var count;
      var aggregates;
      var result = getValue(this.schema.result, res.data);
      if (this.schema.count) {
        count = getValue(this.schema.count, res.data);
      }
      if (this.schema.aggregates) {
        aggregates = getValue(this.schema.aggregates, res.data);
        aggregates = !isNullOrUndefined(aggregates) ? DataUtil.parse.parseJson(aggregates) : aggregates;
      }
      var pvt = request.pvtData || {};
      var args = { result, aggregates };
      var data = args;
      if (pvt && pvt.groups && pvt.groups.length) {
        this.getAggregateResult(pvt, data, args, null, query);
      }
      return !isNullOrUndefined(count) ? { result: args.result, count, aggregates } : args.result;
    };
    GraphQLAdaptor2.prototype.insert = function() {
      var inserted = _super.prototype.insert.apply(this, arguments);
      return this.generateCrudData(inserted, "insert");
    };
    GraphQLAdaptor2.prototype.update = function() {
      var inserted = _super.prototype.update.apply(this, arguments);
      return this.generateCrudData(inserted, "update");
    };
    GraphQLAdaptor2.prototype.remove = function() {
      var inserted = _super.prototype.remove.apply(this, arguments);
      return this.generateCrudData(inserted, "remove");
    };
    GraphQLAdaptor2.prototype.batchRequest = function(dm, changes, e, query, original) {
      var batch = _super.prototype.batchRequest.apply(this, arguments);
      var bData = JSON.parse(batch.data);
      bData.key = e.key;
      batch.data = JSON.stringify(bData);
      return this.generateCrudData(batch, "batch");
    };
    GraphQLAdaptor2.prototype.generateCrudData = function(crudData, action) {
      var parsed = JSON.parse(crudData.data);
      crudData.data = JSON.stringify({
        query: this.opt.getMutation(action),
        variables: parsed
      });
      return crudData;
    };
    return GraphQLAdaptor2;
  })(UrlAdaptor)
);
var CacheAdaptor = (
  /** @class */
  (function(_super) {
    __extends(CacheAdaptor2, _super);
    function CacheAdaptor2(adaptor, timeStamp, pageSize) {
      var _this = _super.call(this) || this;
      _this.isCrudAction = false;
      _this.isInsertAction = false;
      if (!isNullOrUndefined(adaptor)) {
        _this.cacheAdaptor = adaptor;
      }
      _this.pageSize = pageSize;
      _this.guidId = DataUtil.getGuid("cacheAdaptor");
      var obj = { keys: [], results: [] };
      window.localStorage.setItem(_this.guidId, JSON.stringify(obj));
      var guid = _this.guidId;
      if (!isNullOrUndefined(timeStamp)) {
        setInterval(function() {
          var data = DataUtil.parse.parseJson(window.localStorage.getItem(guid));
          var forDel = [];
          for (var i = 0; i < data.results.length; i++) {
            var currentTime = +/* @__PURE__ */ new Date();
            var requestTime = +new Date(data.results[i].timeStamp);
            data.results[i].timeStamp = currentTime - requestTime;
            if (currentTime - requestTime > timeStamp) {
              forDel.push(i);
            }
          }
          for (var i = 0; i < forDel.length; i++) {
            data.results.splice(forDel[i], 1);
            data.keys.splice(forDel[i], 1);
          }
          window.localStorage.removeItem(guid);
          window.localStorage.setItem(guid, JSON.stringify(data));
        }, timeStamp);
      }
      return _this;
    }
    CacheAdaptor2.prototype.generateKey = function(url, query) {
      var queries = this.getQueryRequest(query);
      var singles = Query.filterQueryLists(query.queries, ["onSelect", "onPage", "onSkip", "onTake", "onRange"]);
      var key = url;
      var page = "onPage";
      if (page in singles) {
        key += singles[page].pageIndex;
      }
      queries.sorts.forEach(function(obj) {
        key += obj.e.direction + obj.e.fieldName;
      });
      queries.groups.forEach(function(obj) {
        key += obj.e.fieldName;
      });
      queries.searches.forEach(function(obj) {
        key += obj.e.searchKey;
      });
      for (var filter = 0; filter < queries.filters.length; filter++) {
        var currentFilter = queries.filters[filter];
        if (currentFilter.e.isComplex) {
          var newQuery = query.clone();
          newQuery.queries = [];
          for (var i = 0; i < currentFilter.e.predicates.length; i++) {
            newQuery.queries.push({ fn: "onWhere", e: currentFilter.e.predicates[i], filter: query.queries.filter });
          }
          key += currentFilter.e.condition + this.generateKey(url, newQuery);
        } else {
          key += currentFilter.e.field + currentFilter.e.operator + currentFilter.e.value;
        }
      }
      return key;
    };
    CacheAdaptor2.prototype.processQuery = function(dm, query, hierarchyFilters) {
      var key = this.generateKey(dm.dataSource.url, query);
      var cachedItems = DataUtil.parse.parseJson(window.localStorage.getItem(this.guidId));
      var data = cachedItems ? cachedItems.results[cachedItems.keys.indexOf(key)] : null;
      if (data != null && !this.isCrudAction && !this.isInsertAction) {
        return data;
      }
      this.isCrudAction = null;
      this.isInsertAction = null;
      return this.cacheAdaptor.processQuery.apply(this.cacheAdaptor, [].slice.call(arguments, 0));
    };
    CacheAdaptor2.prototype.processResponse = function(data, ds, query, xhr, request, changes) {
      if (this.isInsertAction || request && this.cacheAdaptor.options.batch && DataUtil.endsWith(request.url, this.cacheAdaptor.options.batch) && request.type.toLowerCase() === "post") {
        return this.cacheAdaptor.processResponse(data, ds, query, xhr, request, changes);
      }
      data = this.cacheAdaptor.processResponse.apply(this.cacheAdaptor, [].slice.call(arguments, 0));
      var key = query ? this.generateKey(ds.dataSource.url, query) : ds.dataSource.url;
      var obj = {};
      obj = DataUtil.parse.parseJson(window.localStorage.getItem(this.guidId));
      var index = obj.keys.indexOf(key);
      if (index !== -1) {
        obj.results.splice(index, 1);
        obj.keys.splice(index, 1);
      }
      obj.results[obj.keys.push(key) - 1] = { keys: key, result: data.result, timeStamp: /* @__PURE__ */ new Date(), count: data.count };
      while (obj.results.length > this.pageSize) {
        obj.results.splice(0, 1);
        obj.keys.splice(0, 1);
      }
      window.localStorage.setItem(this.guidId, JSON.stringify(obj));
      return data;
    };
    CacheAdaptor2.prototype.beforeSend = function(dm, request, settings) {
      if (!isNullOrUndefined(this.cacheAdaptor.options.batch) && DataUtil.endsWith(settings.url, this.cacheAdaptor.options.batch) && settings.type.toLowerCase() === "post") {
        request.headers.set("Accept", this.cacheAdaptor.options.multipartAccept);
      }
      if (!dm.dataSource.crossDomain) {
        request.headers.set("Accept", this.cacheAdaptor.options.accept);
      }
    };
    CacheAdaptor2.prototype.update = function(dm, keyField, value, tableName) {
      this.isCrudAction = true;
      return this.cacheAdaptor.update(dm, keyField, value, tableName);
    };
    CacheAdaptor2.prototype.insert = function(dm, data, tableName) {
      this.isInsertAction = true;
      return this.cacheAdaptor.insert(dm, data, tableName);
    };
    CacheAdaptor2.prototype.remove = function(dm, keyField, value, tableName) {
      this.isCrudAction = true;
      return this.cacheAdaptor.remove(dm, keyField, value, tableName);
    };
    CacheAdaptor2.prototype.batchRequest = function(dm, changes, e) {
      return this.cacheAdaptor.batchRequest(dm, changes, e);
    };
    return CacheAdaptor2;
  })(UrlAdaptor)
);

// node_modules/@syncfusion/ej2-data/src/manager.js
var __awaiter = function(thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : new P(function(resolve2) {
        resolve2(result.value);
      }).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1) throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return { value: op[1], done: false };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var DataManager = (
  /** @class */
  (function() {
    function DataManager2(dataSource, query, adaptor, middlewares) {
      var _this = this;
      this.dateParse = true;
      this.timeZoneHandling = true;
      this.persistQuery = {};
      this.isInitialLoad = false;
      this.requests = [];
      this.isEnableCache = false;
      this.isInitialLoad = true;
      this.isEnableCache = false;
      if (middlewares && middlewares.applyPostRequestMiddlewares) {
        this.applyPostRequestMiddlewares = middlewares.applyPostRequestMiddlewares;
      }
      if (middlewares && middlewares.applyPreRequestMiddlewares) {
        this.applyPreRequestMiddlewares = middlewares.applyPreRequestMiddlewares;
      }
      if (!dataSource && !this.dataSource) {
        dataSource = [];
      }
      adaptor = adaptor || dataSource.adaptor;
      if (dataSource && dataSource.timeZoneHandling === false) {
        this.timeZoneHandling = dataSource.timeZoneHandling;
      }
      var data;
      if (dataSource instanceof Array) {
        data = {
          json: dataSource,
          offline: true
        };
      } else if (typeof dataSource === "object") {
        if (!dataSource.json) {
          dataSource.json = [];
        }
        if (!dataSource.enablePersistence) {
          dataSource.enablePersistence = false;
        }
        if (!dataSource.id) {
          dataSource.id = "";
        }
        if (!dataSource.ignoreOnPersist) {
          dataSource.ignoreOnPersist = [];
        }
        data = {
          url: dataSource.url,
          insertUrl: dataSource.insertUrl,
          removeUrl: dataSource.removeUrl,
          updateUrl: dataSource.updateUrl,
          crudUrl: dataSource.crudUrl,
          batchUrl: dataSource.batchUrl,
          json: dataSource.json,
          headers: dataSource.headers,
          accept: dataSource.accept,
          data: dataSource.data,
          enableCache: dataSource.enableCache,
          timeTillExpiration: dataSource.timeTillExpiration,
          cachingPageSize: dataSource.cachingPageSize,
          enableCaching: dataSource.enableCaching,
          requestType: dataSource.requestType,
          key: dataSource.key,
          crossDomain: dataSource.crossDomain,
          jsonp: dataSource.jsonp,
          dataType: dataSource.dataType,
          offline: dataSource.offline !== void 0 ? dataSource.offline : dataSource.adaptor instanceof RemoteSaveAdaptor || dataSource.adaptor instanceof CustomDataAdaptor ? false : dataSource.url ? false : true,
          requiresFormat: dataSource.requiresFormat,
          enablePersistence: dataSource.enablePersistence,
          id: dataSource.id,
          ignoreOnPersist: dataSource.ignoreOnPersist
        };
      } else {
        DataUtil.throwError("DataManager: Invalid arguments");
      }
      if (data.requiresFormat === void 0 && !DataUtil.isCors()) {
        data.requiresFormat = isNullOrUndefined(data.crossDomain) ? true : data.crossDomain;
      }
      if (data.dataType === void 0) {
        data.dataType = "json";
      }
      this.isEnableCache = data.enableCache;
      this.dataSource = data;
      this.defaultQuery = query;
      if (this.dataSource.enablePersistence && this.dataSource.id) {
        window.addEventListener("unload", this.setPersistData.bind(this));
      }
      if (data.url && data.offline && !data.json.length) {
        this.isDataAvailable = false;
        this.adaptor = adaptor || new ODataAdaptor();
        this.dataSource.offline = false;
        this.ready = this.executeQuery(query || new Query());
        this.ready.then(function(e) {
          _this.dataSource.offline = true;
          _this.isDataAvailable = true;
          data.json = e.result;
          _this.adaptor = new JsonAdaptor();
        });
      } else {
        this.adaptor = data.offline ? new JsonAdaptor() : new ODataAdaptor();
      }
      if (!data.jsonp && this.adaptor instanceof ODataAdaptor) {
        data.jsonp = "callback";
      }
      this.adaptor = adaptor || this.adaptor;
      if (this.isEnableCache) {
        this.guidId = DataUtil.getGuid("cacheAdaptor");
        var obj = { keys: [], results: [] };
        window.localStorage.setItem(this.guidId, JSON.stringify(obj));
      }
      if (data.enableCaching) {
        this.adaptor = new CacheAdaptor(this.adaptor, data.timeTillExpiration, data.cachingPageSize);
      }
      return this;
    }
    Object.defineProperty(DataManager2.prototype, "moduleName", {
      /** @hidden */
      get: function() {
        return "datamanager";
      },
      enumerable: true,
      configurable: true
    });
    ;
    DataManager2.prototype.getPersistedData = function(id) {
      var persistedData = localStorage.getItem(id || this.dataSource.id);
      return JSON.parse(persistedData);
    };
    DataManager2.prototype.setPersistData = function(e, id, persistData) {
      localStorage.setItem(id || this.dataSource.id, JSON.stringify(persistData || this.persistQuery));
    };
    DataManager2.prototype.setPersistQuery = function(query) {
      var _this = this;
      var persistedQuery = this.getPersistedData();
      if (this.isInitialLoad && persistedQuery && Object.keys(persistedQuery).length) {
        this.persistQuery = persistedQuery;
        this.persistQuery.queries = this.persistQuery.queries.filter(function(query2) {
          if (_this.dataSource.ignoreOnPersist && _this.dataSource.ignoreOnPersist.length) {
            if (query2.fn && _this.dataSource.ignoreOnPersist.some(function(keyword) {
              return query2.fn === keyword;
            })) {
              return false;
            }
          }
          if (query2.fn === "onWhere") {
            var e = query2.e;
            if (e && e.isComplex && e.predicates instanceof Array) {
              var allPredicates = e.predicates.map(function(predicateObj) {
                if (predicateObj.predicates && predicateObj.predicates instanceof Array) {
                  var nestedPredicates = predicateObj.predicates.map(function(nestedPredicate) {
                    var field2 = nestedPredicate.field, operator2 = nestedPredicate.operator, value2 = nestedPredicate.value, ignoreCase2 = nestedPredicate.ignoreCase, ignoreAccent2 = nestedPredicate.ignoreAccent, matchCase2 = nestedPredicate.matchCase;
                    return new Predicate(field2, operator2, value2, ignoreCase2, ignoreAccent2, matchCase2);
                  });
                  return predicateObj.condition === "and" ? Predicate.and(nestedPredicates) : Predicate.or(nestedPredicates);
                } else {
                  var field = predicateObj.field, operator = predicateObj.operator, value = predicateObj.value, ignoreCase = predicateObj.ignoreCase, ignoreAccent = predicateObj.ignoreAccent, matchCase = predicateObj.matchCase;
                  return new Predicate(field, operator, value, ignoreCase, ignoreAccent, matchCase);
                }
              });
              query2.e = new Predicate(allPredicates[0], e.condition, allPredicates.slice(1));
            }
          }
          return true;
        });
        var newQuery = extend(new Query(), this.persistQuery);
        this.isInitialLoad = false;
        return newQuery;
      } else {
        this.persistQuery = query;
        this.isInitialLoad = false;
        return query;
      }
    };
    DataManager2.prototype.setDefaultQuery = function(query) {
      this.defaultQuery = query;
      return this;
    };
    DataManager2.prototype.executeLocal = function(query) {
      if (!this.defaultQuery && !(query instanceof Query)) {
        DataUtil.throwError("DataManager - executeLocal() : A query is required to execute");
      }
      if (!this.dataSource.json) {
        DataUtil.throwError("DataManager - executeLocal() : Json data is required to execute");
      }
      if (this.dataSource.enablePersistence && this.dataSource.id) {
        query = this.setPersistQuery(query);
      }
      query = query || this.defaultQuery;
      var result = this.adaptor.processQuery(this, query);
      if (query.subQuery) {
        var from = query.subQuery.fromTable;
        var lookup = query.subQuery.lookups;
        var res = query.isCountRequired ? result.result : result;
        if (lookup && lookup instanceof Array) {
          DataUtil.buildHierarchy(query.subQuery.fKey, from, res, lookup, query.subQuery.key);
        }
        for (var j = 0; j < res.length; j++) {
          if (res[j][from] instanceof Array) {
            res[j] = extend({}, {}, res[j]);
            res[j][from] = this.adaptor.processResponse(query.subQuery.using(new DataManager2(res[j][from].slice(0))).executeLocal(), this, query);
          }
        }
      }
      return this.adaptor.processResponse(result, this, query);
    };
    DataManager2.prototype.executeQuery = function(query, done, fail, always) {
      var _this = this;
      var makeRequest = "makeRequest";
      if (this.dataSource.enablePersistence && this.dataSource.id) {
        query = this.setPersistQuery(query);
      }
      if (typeof query === "function") {
        always = fail;
        fail = done;
        done = query;
        query = null;
      }
      if (!query) {
        query = this.defaultQuery;
      }
      if (!(query instanceof Query)) {
        DataUtil.throwError("DataManager - executeQuery() : A query is required to execute");
      }
      var deffered = new Deferred();
      var args = { query };
      if (!this.dataSource.offline && (this.dataSource.url !== void 0 && this.dataSource.url !== "") || !isNullOrUndefined(this.adaptor[makeRequest]) || this.isCustomDataAdaptor(this.adaptor)) {
        var result = this.isEnableCache ? this.processQuery(query) : this.adaptor.processQuery(this, query);
        if (!isNullOrUndefined(this.adaptor[makeRequest])) {
          this.adaptor[makeRequest](result, deffered, args, query);
        } else if (!isNullOrUndefined(result.url) || this.isCustomDataAdaptor(this.adaptor)) {
          this.requests = [];
          this.makeRequest(result, deffered, args, query);
        } else {
          args = DataManager2.getDeferedArgs(query, result, args);
          deffered.resolve(args);
        }
      } else {
        DataManager2.nextTick(function() {
          var res = _this.executeLocal(query);
          args = DataManager2.getDeferedArgs(query, res, args);
          deffered.resolve(args);
        });
      }
      if (done || fail) {
        deffered.promise.then(done, fail);
      }
      if (always) {
        deffered.promise.then(always, always);
      }
      return deffered.promise;
    };
    DataManager2.prototype.getQueryRequest = function(query) {
      var req = { sorts: [], groups: [], filters: [], searches: [], aggregates: [] };
      req.sorts = Query.filterQueries(query.queries, "onSortBy");
      req.groups = Query.filterQueries(query.queries, "onGroup");
      req.filters = Query.filterQueries(query.queries, "onWhere");
      req.searches = Query.filterQueries(query.queries, "onSearch");
      req.aggregates = Query.filterQueries(query.queries, "onAggregates");
      return req;
    };
    DataManager2.prototype.generateKey = function(url, query) {
      var queries = this.getQueryRequest(query);
      var singles = Query.filterQueryLists(query.queries, ["onSelect", "onPage", "onSkip", "onTake", "onRange"]);
      var key = url;
      var page = "onPage";
      queries.sorts.forEach(function(obj2) {
        key += obj2.e.direction + obj2.e.fieldName;
      });
      queries.groups.forEach(function(obj2) {
        key += obj2.e.fieldName;
      });
      queries.searches.forEach(function(obj2) {
        key += obj2.e.searchKey;
      });
      for (var filter = 0; filter < queries.filters.length; filter++) {
        var currentFilter = queries.filters[filter];
        if (currentFilter.e.isComplex) {
          var newQuery = query.clone();
          newQuery.queries = [];
          for (var i = 0; i < currentFilter.e.predicates.length; i++) {
            newQuery.queries.push({ fn: "onWhere", e: currentFilter.e.predicates[i], filter: query.queries.filter });
          }
          key += currentFilter.e.condition + this.generateKey(url, newQuery);
        } else {
          key += currentFilter.e.field + currentFilter.e.operator + currentFilter.e.value;
        }
      }
      if (!isNullOrUndefined(this.previousCacheQuery) && this.previousCacheQuery !== key) {
        var obj = { keys: [], results: [] };
        window.localStorage.setItem(this.guidId, JSON.stringify(obj));
      }
      this.previousCacheQuery = key;
      if (page in singles) {
        key += singles[page].pageIndex;
      }
      return key;
    };
    DataManager2.prototype.processQuery = function(query) {
      var key = this.generateKey(this.dataSource.url, query);
      var cachedItems = JSON.parse(window.localStorage.getItem(this.guidId));
      var data = cachedItems ? cachedItems.results[cachedItems.keys.indexOf(key)] : null;
      if (data != null) {
        return DataUtil.parse.parseJson(data);
      }
      return this.adaptor.processQuery(this, query);
    };
    DataManager2.getDeferedArgs = function(query, result, args) {
      if (query.isCountRequired) {
        args.result = result.result;
        args.count = result.count;
        args.aggregates = result.aggregates;
      } else {
        args.result = result;
      }
      return args;
    };
    DataManager2.nextTick = function(fn) {
      (window.setImmediate || window.setTimeout)(fn, 0);
    };
    DataManager2.prototype.extendRequest = function(url, fnSuccess, fnFail) {
      return extend({}, {
        type: "GET",
        dataType: this.dataSource.dataType,
        crossDomain: this.dataSource.crossDomain,
        jsonp: this.dataSource.jsonp,
        cache: true,
        processData: false,
        onSuccess: fnSuccess,
        onFailure: fnFail
      }, url);
    };
    DataManager2.prototype.makeRequest = function(url, deffered, args, query) {
      var _this = this;
      var isSelector = !!query.subQuerySelector;
      var fnFail = function(e) {
        args.error = e;
        deffered.reject(args);
      };
      var process = function(data, count, xhr, request2, actual, aggregates, virtualSelectRecords) {
        args.xhr = xhr;
        args.count = count ? parseInt(count.toString(), 10) : 0;
        args.result = data;
        args.request = request2;
        args.aggregates = aggregates;
        args.actual = actual;
        args.virtualSelectRecords = virtualSelectRecords;
        deffered.resolve(args);
      };
      var fnQueryChild = function(data, selector) {
        var subDeffer = new Deferred();
        var childArgs = { parent: args };
        query.subQuery.isChild = true;
        var subUrl = _this.adaptor.processQuery(_this, query.subQuery, data ? _this.adaptor.processResponse(data) : selector);
        var childReq = _this.makeRequest(subUrl, subDeffer, childArgs, query.subQuery);
        if (!isSelector) {
          subDeffer.then(function(subData) {
            if (data) {
              DataUtil.buildHierarchy(query.subQuery.fKey, query.subQuery.fromTable, data, subData, query.subQuery.key);
              process(data, subData.count, subData.xhr);
            }
          }, fnFail);
        }
        return childReq;
      };
      var fnSuccess = function(data, request2) {
        if (_this.isGraphQLAdaptor(_this.adaptor)) {
          if (!isNullOrUndefined(data["errors"])) {
            return fnFail(data["errors"], request2);
          }
        }
        if (_this.isCustomDataAdaptor(_this.adaptor)) {
          request2 = extend({}, _this.fetchReqOption, request2);
        }
        if (request2.contentType.indexOf("xml") === -1 && _this.dateParse && !_this.isEnableCache) {
          data = DataUtil.parse.parseJson(data);
        }
        var result;
        var promise2 = _this.afterReponseRequest(data);
        promise2.then(function(data2) {
          result = _this.adaptor.processResponse(data2, _this, query, request2.fetchRequest, request2);
          if (_this.isEnableCache) {
            var key = query ? _this.generateKey(_this.dataSource.url, query) : _this.dataSource.url;
            var obj = {};
            obj = JSON.parse(window.localStorage.getItem(_this.guidId));
            var index = obj.keys.indexOf(key);
            if (index !== -1) {
              obj.results.splice(index, 1);
              obj.keys.splice(index, 1);
            }
            obj.results[obj.keys.push(key) - 1] = { keys: key, result: result.result, timeStamp: /* @__PURE__ */ new Date(), count: result.count };
            window.localStorage.setItem(_this.guidId, JSON.stringify(obj));
          }
          if (request2.contentType.indexOf("xml") === -1 && _this.dateParse && _this.isEnableCache) {
            result = DataUtil.parse.parseJson(result);
          }
          var count = 0;
          var aggregates = null;
          var virtualSelectRecords = "virtualSelectRecords";
          var virtualRecords = data2[virtualSelectRecords];
          if (query.isCountRequired) {
            count = result.count;
            aggregates = result.aggregates;
            result = result.result;
          }
          if (!query.subQuery) {
            process(result, count, request2.fetchRequest, request2.type, data2, aggregates, virtualRecords);
            return;
          }
          if (!isSelector) {
            fnQueryChild(result, request2);
          }
          ;
        }).catch(function(e) {
          return _this.dataManagerFailure(e, deffered, args);
        });
      };
      var req = this.extendRequest(url, fnSuccess, fnFail);
      if (!this.isCustomDataAdaptor(this.adaptor)) {
        var promise = this.useMiddleware(req);
        var fetch_1;
        promise.then(function(response) {
          fetch_1 = new Fetch(req);
          fetch_1.beforeSend = function() {
            _this.beforeSend(fetch_1.fetchRequest, fetch_1, response);
          };
          req = fetch_1.send();
          req.catch(function(e) {
            return true;
          });
          _this.requests.push(fetch_1);
        }).catch(function(e) {
          return _this.dataManagerFailure(e, deffered, args);
        });
      } else {
        this.fetchReqOption = req;
        var request = req;
        this.adaptor.options.getData({
          data: request.data,
          onSuccess: request.onSuccess,
          onFailure: request.onFailure
        });
      }
      if (isSelector) {
        var promise = void 0;
        var res = query.subQuerySelector.call(this, { query: query.subQuery, parent: query });
        if (res && res.length) {
          promise = Promise.all([req, fnQueryChild(null, res)]);
          promise.then(function() {
            var args2 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args2[_i] = arguments[_i];
            }
            var result = args2[0];
            var pResult = _this.adaptor.processResponse(result[0], _this, query, _this.requests[0].fetchRequest, _this.requests[0]);
            var count = 0;
            if (query.isCountRequired) {
              count = pResult.count;
              pResult = pResult.result;
            }
            var cResult = _this.adaptor.processResponse(result[1], _this, query.subQuery, _this.requests[1].fetchRequest, _this.requests[1]);
            count = 0;
            if (query.subQuery.isCountRequired) {
              count = cResult.count;
              cResult = cResult.result;
            }
            DataUtil.buildHierarchy(query.subQuery.fKey, query.subQuery.fromTable, pResult, cResult, query.subQuery.key);
            isSelector = false;
            process(pResult, count, _this.requests[0].fetchRequest);
          });
        } else {
          isSelector = false;
        }
      }
      return req;
    };
    DataManager2.prototype.dataManagerFailure = function(e, deffered, args) {
      args.error = e;
      deffered.reject(args);
    };
    DataManager2.prototype.afterReponseRequest = function(data) {
      return __awaiter(this, void 0, void 0, function() {
        var reponse, deffered;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              return [4, this.applyPostRequestMiddlewares(data)];
            case 1:
              reponse = _a.sent();
              deffered = new Deferred();
              deffered.resolve(reponse);
              return [2, deffered.promise];
          }
        });
      });
    };
    DataManager2.prototype.applyPostRequestMiddlewares = function(response) {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          return [2, response];
        });
      });
    };
    DataManager2.prototype.useMiddleware = function(request) {
      return __awaiter(this, void 0, void 0, function() {
        var reponse, deffered;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              return [4, this.applyPreRequestMiddlewares(request)];
            case 1:
              reponse = _a.sent();
              deffered = new Deferred();
              deffered.resolve(reponse);
              return [2, deffered.promise];
          }
        });
      });
    };
    DataManager2.prototype.applyPreRequestMiddlewares = function(request) {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          return [2, request];
        });
      });
    };
    DataManager2.prototype.beforeSend = function(request, settings, response) {
      this.adaptor.beforeSend(this, request, settings);
      var headers = [];
      if (this.dataSource.headers) {
        headers = headers.concat(this.dataSource.headers);
      }
      var props;
      if (response && response.headers) {
        headers = headers.concat(response.headers);
      }
      for (var i = 0; headers && i < headers.length; i++) {
        props = [];
        var keys = Object.keys(headers[i]);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
          var prop = keys_1[_i];
          props.push(prop);
          request.headers.set(prop, headers[i][prop]);
        }
      }
    };
    DataManager2.prototype.saveChanges = function(changes, key, tableName, query, original) {
      var _this = this;
      if (tableName instanceof Query) {
        query = tableName;
        tableName = null;
      }
      var args = {
        url: tableName,
        key: key || this.dataSource.key
      };
      var req = this.adaptor.batchRequest(this, changes, args, query || new Query(), original);
      var dofetchRequest = "dofetchRequest";
      if (this.dataSource.offline) {
        return req;
      }
      if (!isNullOrUndefined(this.adaptor[dofetchRequest])) {
        return this.adaptor[dofetchRequest](req);
      } else if (!this.isCustomDataAdaptor(this.adaptor)) {
        var deff_1 = new Deferred();
        var fetch_2 = new Fetch(req);
        fetch_2.beforeSend = function() {
          _this.beforeSend(fetch_2.fetchRequest, fetch_2);
        };
        fetch_2.onSuccess = function(data, request) {
          if (_this.isGraphQLAdaptor(_this.adaptor)) {
            if (!isNullOrUndefined(data["errors"])) {
              fetch_2.onFailure(JSON.stringify(data["errors"]));
            }
          }
          deff_1.resolve(_this.adaptor.processResponse(data, _this, null, request.fetchRequest, request, changes, args));
        };
        fetch_2.onFailure = function(e) {
          deff_1.reject([{ error: e }]);
        };
        fetch_2.send().catch(function(e) {
          return true;
        });
        return deff_1.promise;
      } else {
        return this.dofetchRequest(req, this.adaptor.options.batchUpdate, changes);
      }
    };
    DataManager2.prototype.insert = function(data, tableName, query, position) {
      if (tableName instanceof Query) {
        query = tableName;
        tableName = null;
      }
      var req = this.adaptor.insert(this, data, tableName, query, position);
      var dofetchRequest = "dofetchRequest";
      if (this.dataSource.offline) {
        return req;
      }
      if (!isNullOrUndefined(this.adaptor[dofetchRequest])) {
        return this.adaptor[dofetchRequest](req);
      } else {
        return this.dofetchRequest(req, this.adaptor.options.addRecord);
      }
    };
    DataManager2.prototype.remove = function(keyField, value, tableName, query) {
      if (typeof value === "object") {
        value = DataUtil.getObject(keyField, value);
      }
      if (tableName instanceof Query) {
        query = tableName;
        tableName = null;
      }
      var res = this.adaptor.remove(this, keyField, value, tableName, query);
      var dofetchRequest = "dofetchRequest";
      if (this.dataSource.offline) {
        return res;
      }
      if (!isNullOrUndefined(this.adaptor[dofetchRequest])) {
        return this.adaptor[dofetchRequest](res);
      } else {
        var remove2 = this.adaptor.options.deleteRecord;
        return this.dofetchRequest(res, remove2);
      }
    };
    DataManager2.prototype.update = function(keyField, value, tableName, query, original) {
      if (tableName instanceof Query) {
        query = tableName;
        tableName = null;
      }
      if (this.isEnableCache) {
        this.cacheQuery = this.generateKey(this.dataSource.url, query);
      }
      var res = this.adaptor.update(this, keyField, value, tableName, query, original);
      var dofetchRequest = "dofetchRequest";
      if (this.dataSource.offline) {
        return res;
      }
      if (!isNullOrUndefined(this.adaptor[dofetchRequest])) {
        return this.adaptor[dofetchRequest](res);
      } else {
        var update = this.adaptor.options.updateRecord;
        return this.dofetchRequest(res, update);
      }
    };
    DataManager2.prototype.isCustomDataAdaptor = function(dataSource) {
      return this.adaptor.getModuleName && this.adaptor.getModuleName() === "CustomDataAdaptor";
    };
    DataManager2.prototype.isGraphQLAdaptor = function(dataSource) {
      return this.adaptor.getModuleName && this.adaptor.getModuleName() === "GraphQLAdaptor";
    };
    DataManager2.prototype.successFunc = function(record, request, changes) {
      if (this.isGraphQLAdaptor(this.adaptor)) {
        var data = typeof record === "object" ? record : JSON.parse(record);
        if (!isNullOrUndefined(data["errors"])) {
          this.failureFunc(JSON.stringify(data["errors"]));
        }
      }
      if (this.isCustomDataAdaptor(this.adaptor)) {
        request = extend({}, this.fetchReqOption, request);
      }
      try {
        DataUtil.parse.parseJson(record);
      } catch (e) {
        record = [];
      }
      if (this.isEnableCache) {
        var requests = JSON.parse(request.data);
        if (requests.action === "insert" || requests.action === "remove") {
          var obj = { keys: [], results: [] };
          window.localStorage.setItem(this.guidId, JSON.stringify(obj));
        } else if (requests.action === "update") {
          var cachedItems = JSON.parse(window.localStorage.getItem(this.guidId));
          var data = cachedItems ? cachedItems.results[cachedItems.keys.indexOf(this.cacheQuery)] : null;
          if (data && data.result) {
            var cacheData = data.result;
            for (var i = 0; i < cacheData.length; i++) {
              if (cacheData[i][requests.keyColumn] === requests.key) {
                cacheData[i] = requests.value;
                window.localStorage.setItem(this.guidId, JSON.stringify(cachedItems));
                break;
              }
            }
          }
        }
      }
      record = this.adaptor.processResponse(DataUtil.parse.parseJson(record), this, null, request.fetchRequest, request, changes);
      this.fetchDeffered.resolve(record);
    };
    DataManager2.prototype.failureFunc = function(e) {
      if (this.isEnableCache) {
        this.cacheQuery = "";
      }
      this.fetchDeffered.reject([{ error: e }]);
    };
    DataManager2.prototype.dofetchRequest = function(res, fetchFunc, changes) {
      var _this = this;
      res = extend({}, {
        type: "POST",
        contentType: "application/json; charset=utf-8",
        processData: false
      }, res);
      this.fetchDeffered = new Deferred();
      if (!this.isCustomDataAdaptor(this.adaptor)) {
        var promise = this.useMiddleware(res);
        var fetch_3;
        promise.then(function(response) {
          fetch_3 = new Fetch(res);
          fetch_3.beforeSend = function() {
            _this.beforeSend(fetch_3.fetchRequest, fetch_3, response);
          };
          fetch_3.onSuccess = _this.successFunc.bind(_this);
          fetch_3.onFailure = _this.failureFunc.bind(_this);
          res = fetch_3.send();
          res.catch(function(e) {
            return true;
          });
        }).catch(function(e) {
          return _this.dataManagerFailure(e, _this.fetchDeffered, {});
        });
      } else {
        this.fetchReqOption = res;
        fetchFunc.call(this, {
          data: res.data,
          onSuccess: this.successFunc.bind(this),
          onFailure: this.failureFunc.bind(this),
          changes
        });
      }
      return this.fetchDeffered.promise;
    };
    DataManager2.prototype.clearPersistence = function() {
      window.removeEventListener("unload", this.setPersistData.bind(this));
      this.dataSource.enablePersistence = false;
      this.persistQuery = {};
      window.localStorage.setItem(this.dataSource.id, "[]");
    };
    return DataManager2;
  })()
);
var Deferred = (
  /** @class */
  /* @__PURE__ */ (function() {
    function Deferred2() {
      var _this = this;
      this.promise = new Promise(function(resolve, reject) {
        _this.resolve = resolve;
        _this.reject = reject;
      });
      this.then = this.promise.then.bind(this.promise);
      this.catch = this.promise.catch.bind(this.promise);
    }
    return Deferred2;
  })()
);

// node_modules/@syncfusion/ej2-data/src/util.js
var consts2 = { GroupGuid: "{271bbba0-1ee7}" };
var DataUtil = (
  /** @class */
  (function() {
    function DataUtil2() {
    }
    DataUtil2.getValue = function(value, inst) {
      if (typeof value === "function") {
        return value.call(inst || {});
      }
      return value;
    };
    DataUtil2.endsWith = function(input, substr) {
      return input.slice && input.slice(-substr.length) === substr;
    };
    DataUtil2.notEndsWith = function(input, substr) {
      return input.slice && input.slice(-substr.length) !== substr;
    };
    DataUtil2.startsWith = function(input, start) {
      return input.slice(0, start.length) === start;
    };
    DataUtil2.notStartsWith = function(input, start) {
      return input.slice(0, start.length) !== start;
    };
    DataUtil2.wildCard = function(input, pattern) {
      var asteriskSplit;
      var optionalSplit;
      if (pattern.indexOf("[") !== -1) {
        pattern = pattern.split("[").join("[[]");
      }
      if (pattern.indexOf("(") !== -1) {
        pattern = pattern.split("(").join("[(]");
      }
      if (pattern.indexOf(")") !== -1) {
        pattern = pattern.split(")").join("[)]");
      }
      if (pattern.indexOf("\\") !== -1) {
        pattern = pattern.split("\\").join("[\\\\]");
      }
      if (pattern.indexOf("*") !== -1) {
        if (pattern.charAt(0) !== "*") {
          pattern = "^" + pattern;
        }
        if (pattern.charAt(pattern.length - 1) !== "*") {
          pattern = pattern + "$";
        }
        asteriskSplit = pattern.split("*");
        for (var i = 0; i < asteriskSplit.length; i++) {
          if (asteriskSplit[i].indexOf(".") === -1) {
            asteriskSplit[i] = asteriskSplit[i] + ".*";
          } else {
            asteriskSplit[i] = asteriskSplit[i] + "*";
          }
        }
        pattern = asteriskSplit.join("");
      }
      if (pattern.indexOf("%3f") !== -1 || pattern.indexOf("?") !== -1) {
        optionalSplit = pattern.indexOf("%3f") !== -1 ? pattern.split("%3f") : pattern.split("?");
        pattern = optionalSplit.join(".");
      }
      var regexPattern = new RegExp(pattern, "g");
      return regexPattern.test(input);
    };
    DataUtil2.like = function(input, pattern) {
      if (pattern.indexOf("%") !== -1) {
        if (pattern.charAt(0) === "%" && pattern.lastIndexOf("%") < 2) {
          pattern = pattern.substring(1, pattern.length);
          return DataUtil2.startsWith(DataUtil2.toLowerCase(input), DataUtil2.toLowerCase(pattern));
        } else if (pattern.charAt(pattern.length - 1) === "%" && pattern.indexOf("%") > pattern.length - 3) {
          pattern = pattern.substring(0, pattern.length - 1);
          return DataUtil2.endsWith(DataUtil2.toLowerCase(input), DataUtil2.toLowerCase(pattern));
        } else if (pattern.lastIndexOf("%") !== pattern.indexOf("%") && pattern.lastIndexOf("%") > pattern.indexOf("%") + 1) {
          pattern = pattern.substring(pattern.indexOf("%") + 1, pattern.lastIndexOf("%"));
          return input.indexOf(pattern) !== -1;
        } else {
          return input.indexOf(pattern) !== -1;
        }
      } else {
        return false;
      }
    };
    DataUtil2.fnSort = function(order) {
      order = order ? DataUtil2.toLowerCase(order) : "ascending";
      if (order === "ascending") {
        return this.fnAscending;
      }
      return this.fnDescending;
    };
    DataUtil2.fnAscending = function(x, y) {
      if (isNullOrUndefined(x) && isNullOrUndefined(y)) {
        return 0;
      }
      if (y === null || y === void 0) {
        return -1;
      }
      if (typeof x === "string") {
        return x.localeCompare(y);
      }
      if (x === null || x === void 0) {
        return 1;
      }
      return x - y;
    };
    DataUtil2.fnDescending = function(x, y) {
      if (isNullOrUndefined(x) && isNullOrUndefined(y)) {
        return 0;
      }
      if (y === null || y === void 0) {
        return 1;
      }
      if (typeof x === "string") {
        return x.localeCompare(y) * -1;
      }
      if (x === null || x === void 0) {
        return -1;
      }
      return y - x;
    };
    DataUtil2.extractFields = function(obj, fields) {
      var newObj = {};
      for (var i = 0; i < fields.length; i++) {
        newObj = this.setValue(fields[i], this.getObject(fields[i], obj), newObj);
      }
      return newObj;
    };
    DataUtil2.select = function(jsonArray, fields) {
      var newData = [];
      for (var i = 0; i < jsonArray.length; i++) {
        newData.push(this.extractFields(jsonArray[i], fields));
      }
      return newData;
    };
    DataUtil2.group = function(jsonArray, field, aggregates, level, groupDs, format, isLazyLoad) {
      level = level || 1;
      var jsonData = jsonArray;
      var guid = "GroupGuid";
      if (jsonData.GroupGuid === consts2[guid]) {
        var _loop_1 = function(j2) {
          if (!isNullOrUndefined(groupDs)) {
            var indx = -1;
            var temp = groupDs.filter(function(e) {
              return e.key === jsonData[j2].key;
            });
            indx = groupDs.indexOf(temp[0]);
            jsonData[j2].items = this_1.group(jsonData[j2].items, field, aggregates, jsonData.level + 1, groupDs[indx].items, format, isLazyLoad);
            jsonData[j2].count = groupDs[indx].count;
          } else {
            jsonData[j2].items = this_1.group(jsonData[j2].items, field, aggregates, jsonData.level + 1, null, format, isLazyLoad);
            jsonData[j2].count = jsonData[j2].items.length;
          }
        };
        var this_1 = this;
        for (var j = 0; j < jsonData.length; j++) {
          _loop_1(j);
        }
        jsonData.childLevels += 1;
        return jsonData;
      }
      var grouped = {};
      var groupedArray = [];
      groupedArray.GroupGuid = consts2[guid];
      groupedArray.level = level;
      groupedArray.childLevels = 0;
      groupedArray.records = jsonData;
      var _loop_2 = function(i2) {
        var val = this_2.getVal(jsonData, i2, field);
        if (!isNullOrUndefined(format)) {
          val = format(val, field);
        }
        if (!grouped[val]) {
          grouped[val] = {
            key: val,
            count: 0,
            items: [],
            aggregates: {},
            field
          };
          groupedArray.push(grouped[val]);
          if (!isNullOrUndefined(groupDs)) {
            var tempObj = groupDs.filter(function(e) {
              return e.key === grouped[val].key;
            });
            grouped[val].count = tempObj[0].count;
          }
        }
        grouped[val].count = !isNullOrUndefined(groupDs) ? grouped[val].count : grouped[val].count += 1;
        if (!isLazyLoad || isLazyLoad && aggregates.length) {
          grouped[val].items.push(jsonData[i2]);
        }
      };
      var this_2 = this;
      for (var i = 0; i < jsonData.length; i++) {
        _loop_2(i);
      }
      if (aggregates && aggregates.length) {
        var _loop_3 = function(i2) {
          var res = {};
          var fn = void 0;
          var aggs = aggregates;
          for (var j2 = 0; j2 < aggregates.length; j2++) {
            fn = DataUtil2.aggregates[aggregates[j2].type];
            if (!isNullOrUndefined(groupDs)) {
              var temp = groupDs.filter(function(e) {
                return e.key === groupedArray[i2].key;
              });
              if (fn) {
                res[aggs[j2].field + " - " + aggs[j2].type] = fn(temp[0].items, aggs[j2].field);
              }
            } else {
              if (fn) {
                res[aggs[j2].field + " - " + aggs[j2].type] = fn(groupedArray[i2].items, aggs[j2].field);
              }
            }
          }
          groupedArray[i2].aggregates = res;
        };
        for (var i = 0; i < groupedArray.length; i++) {
          _loop_3(i);
        }
      }
      if (isLazyLoad && groupedArray.length && aggregates.length) {
        for (var i = 0; i < groupedArray.length; i++) {
          groupedArray[i].items = [];
        }
      }
      return jsonData.length && groupedArray || jsonData;
    };
    DataUtil2.buildHierarchy = function(fKey, from, source, lookup, pKey) {
      var i;
      var grp = {};
      var temp;
      if (lookup.result) {
        lookup = lookup.result;
      }
      if (lookup.GroupGuid) {
        this.throwError("DataManager: Do not have support Grouping in hierarchy");
      }
      for (i = 0; i < lookup.length; i++) {
        var fKeyData = this.getObject(fKey, lookup[i]);
        temp = grp[fKeyData] || (grp[fKeyData] = []);
        temp.push(lookup[i]);
      }
      for (i = 0; i < source.length; i++) {
        var fKeyData = this.getObject(pKey || fKey, source[i]);
        source[i][from] = grp[fKeyData];
      }
    };
    DataUtil2.getFieldList = function(obj, fields, prefix) {
      if (prefix === void 0) {
        prefix = "";
      }
      if (fields === void 0 || fields === null) {
        return this.getFieldList(obj, [], prefix);
      }
      var copyObj = obj;
      var keys = Object.keys(obj);
      for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var prop = keys_1[_i];
        if (typeof copyObj[prop] === "object" && !(copyObj[prop] instanceof Array)) {
          this.getFieldList(copyObj[prop], fields, prefix + prop + ".");
        } else {
          fields.push(prefix + prop);
        }
      }
      return fields;
    };
    DataUtil2.getObject = function(nameSpace, from) {
      if (!nameSpace) {
        return from;
      }
      if (!from) {
        return void 0;
      }
      if (nameSpace.indexOf(".") === -1) {
        if (!isNullOrUndefined(from[nameSpace])) {
          return from[nameSpace];
        } else {
          var lowerCaseNameSpace = nameSpace.charAt(0).toLowerCase() + nameSpace.slice(1);
          var upperCaseNameSpace = nameSpace.charAt(0).toUpperCase() + nameSpace.slice(1);
          if (!isNullOrUndefined(from[lowerCaseNameSpace])) {
            return from[lowerCaseNameSpace];
          } else if (!isNullOrUndefined(from[upperCaseNameSpace])) {
            return from[upperCaseNameSpace];
          } else {
            return null;
          }
        }
      }
      var value = from;
      var splits = nameSpace.split(".");
      for (var i = 0; i < splits.length; i++) {
        if (value == null) {
          break;
        }
        value = value[splits[i]];
        if (value === void 0) {
          var casing = splits[i].charAt(0).toUpperCase() + splits[i].slice(1);
          value = from[casing] || from[casing.charAt(0).toLowerCase() + casing.slice(1)] || null;
        }
        from = value;
      }
      return value;
    };
    DataUtil2.setValue = function(nameSpace, value, obj) {
      var keys = nameSpace.toString().split(".");
      var start = obj || {};
      var fromObj = start;
      var i;
      var length = keys.length;
      var key;
      for (i = 0; i < length; i++) {
        key = keys[i];
        if (i + 1 === length) {
          fromObj[key] = value === void 0 ? void 0 : value;
        } else if (isNullOrUndefined(fromObj[key])) {
          fromObj[key] = {};
        }
        fromObj = fromObj[key];
      }
      return start;
    };
    DataUtil2.sort = function(dataSource, field, comparer) {
      var _this = this;
      if (dataSource.length <= 1) {
        return dataSource;
      }
      return dataSource.slice().sort(function(a, b) {
        return comparer(_this.getVal([a], 0, field), _this.getVal([b], 0, field), a, b);
      });
    };
    DataUtil2.ignoreDiacritics = function(value) {
      if (typeof value !== "string") {
        return value;
      }
      var result = value.split("");
      var newValue = result.map(function(temp) {
        return temp in DataUtil2.diacritics ? DataUtil2.diacritics[temp] : temp;
      });
      return newValue.join("");
    };
    DataUtil2.ignoreDiacriticsForArrays = function(valueArray) {
      if (!Array.isArray(valueArray)) {
        return [];
      }
      return valueArray.map(function(item) {
        return DataUtil2.ignoreDiacritics(item);
      });
    };
    DataUtil2.merge = function(left, right, fieldName, comparer) {
      var result = [];
      var current;
      while (left.length > 0 || right.length > 0) {
        if (left.length > 0 && right.length > 0) {
          if (comparer) {
            current = comparer(this.getVal(left, 0, fieldName), this.getVal(right, 0, fieldName), left[0], right[0]) <= 0 ? left : right;
          } else {
            current = left[0][fieldName] < left[0][fieldName] ? left : right;
          }
        } else {
          current = left.length > 0 ? left : right;
        }
        result.push(current.shift());
      }
      return result;
    };
    DataUtil2.getVal = function(array, index, field) {
      return field ? this.getObject(field, array[index]) : array[index];
    };
    DataUtil2.toLowerCase = function(val) {
      if (isNullOrUndefined(val))
        return "";
      if (typeof val === "string")
        return val.toLowerCase();
      if (val instanceof Date)
        return val.toString().toLowerCase();
      return val.toString();
    };
    DataUtil2.callAdaptorFunction = function(adaptor, fnName, param1, param2) {
      if (fnName in adaptor) {
        var res = adaptor[fnName](param1, param2);
        if (!isNullOrUndefined(res)) {
          param1 = res;
        }
      }
      return param1;
    };
    DataUtil2.getAddParams = function(adp, dm, query) {
      var req = {};
      DataUtil2.callAdaptorFunction(adp, "addParams", {
        dm,
        query,
        params: query ? query.params : [],
        reqParams: req
      });
      return req;
    };
    DataUtil2.isPlainObject = function(obj) {
      return !!obj && obj.constructor === Object;
    };
    DataUtil2.isCors = function() {
      var xhr = null;
      var request = "XMLHttpRequest";
      try {
        xhr = new window[request]();
      } catch (e) {
      }
      return !!xhr && "withCredentials" in xhr;
    };
    DataUtil2.getGuid = function(prefix) {
      var hexs = "0123456789abcdef";
      var rand;
      return (prefix || "") + "00000000-0000-4000-0000-000000000000".replace(/0/g, function(val, i) {
        if ("crypto" in window && "getRandomValues" in crypto) {
          var arr = new Uint8Array(1);
          window.crypto.getRandomValues(arr);
          rand = arr[0] % 16 | 0;
        }
        return hexs[i === 19 ? rand & 3 | 8 : rand];
      });
    };
    DataUtil2.isNull = function(val) {
      return val === void 0 || val === null;
    };
    DataUtil2.getItemFromComparer = function(array, field, comparer) {
      var keyVal;
      var current;
      var key;
      var i = 0;
      var castRequired = typeof DataUtil2.getVal(array, 0, field) === "string";
      if (array.length) {
        while (isNullOrUndefined(keyVal) && i < array.length) {
          keyVal = DataUtil2.getVal(array, i, field);
          key = array[i++];
        }
      }
      for (; i < array.length; i++) {
        current = DataUtil2.getVal(array, i, field);
        if (isNullOrUndefined(current)) {
          continue;
        }
        if (castRequired) {
          keyVal = +keyVal;
          current = +current;
        }
        if (comparer(keyVal, current) > 0) {
          keyVal = current;
          key = array[i];
        }
      }
      return key;
    };
    DataUtil2.distinct = function(json, fieldName, requiresCompleteRecord) {
      requiresCompleteRecord = isNullOrUndefined(requiresCompleteRecord) ? false : requiresCompleteRecord;
      var result = [];
      var val;
      var tmp = {};
      json.forEach(function(data, index) {
        val = typeof json[index] === "object" ? DataUtil2.getVal(json, index, fieldName) : json[index];
        if (!(val in tmp)) {
          result.push(!requiresCompleteRecord ? val : json[index]);
          tmp[val] = 1;
        }
      });
      return result;
    };
    DataUtil2.processData = function(dm, records) {
      var query = this.prepareQuery(dm);
      var sampledata = new DataManager(records);
      if (dm.requiresCounts) {
        query.requiresCount();
      }
      var result = sampledata.executeLocal(query);
      var returnValue = {
        result: dm.requiresCounts ? result.result : result,
        count: result.count,
        aggregates: JSON.stringify(result.aggregates)
      };
      return dm.requiresCounts ? returnValue : result;
    };
    DataUtil2.prepareQuery = function(dm) {
      var _this = this;
      var query = new Query();
      if (dm.select) {
        query.select(dm.select);
      }
      if (dm.where) {
        var where = DataUtil2.parse.parseJson(dm.where);
        where.filter(function(pred) {
          if (isNullOrUndefined(pred.condition)) {
            query.where(pred.field, pred.operator, pred.value, pred.ignoreCase, pred.ignoreAccent);
          } else {
            var predicateList = [];
            if (pred.field) {
              predicateList.push(new Predicate(pred.field, pred.operator, pred.value, pred.ignoreCase, pred.ignoreAccent));
            } else {
              predicateList = predicateList.concat(_this.getPredicate(pred.predicates));
            }
            if (pred.condition === "or") {
              query.where(Predicate.or(predicateList));
            } else if (pred.condition === "and") {
              query.where(Predicate.and(predicateList));
            }
          }
        });
      }
      if (dm.search) {
        var search = DataUtil2.parse.parseJson(dm.search);
        search.filter(function(e) {
          return query.search(
            e.key,
            e.fields,
            e["operator"],
            // tslint:disable-next-line:no-string-literal
            e["ignoreCase"],
            e["ignoreAccent"]
          );
        });
      }
      if (dm.aggregates) {
        dm.aggregates.filter(function(e) {
          return query.aggregate(e.type, e.field);
        });
      }
      if (dm.sorted) {
        dm.sorted.filter(function(e) {
          return query.sortBy(e.name, e.direction);
        });
      }
      if (dm.skip) {
        query.skip(dm.skip);
      }
      if (dm.take) {
        query.take(dm.take);
      }
      if (dm.group) {
        dm.group.filter(function(grp) {
          return query.group(grp);
        });
      }
      return query;
    };
    DataUtil2.getPredicate = function(pred) {
      var mainPred = [];
      for (var i = 0; i < pred.length; i++) {
        var e = pred[i];
        if (e.field) {
          mainPred.push(new Predicate(e.field, e.operator, e.value, e.ignoreCase, e.ignoreAccent));
        } else {
          var childPred = [];
          var cpre = this.getPredicate(e.predicates);
          for (var _i = 0, _a = Object.keys(cpre); _i < _a.length; _i++) {
            var prop = _a[_i];
            childPred.push(cpre[prop]);
          }
          mainPred.push(e.condition === "or" ? Predicate.or(childPred) : Predicate.and(childPred));
        }
      }
      return mainPred;
    };
    DataUtil2.serverTimezoneOffset = null;
    DataUtil2.timeZoneHandling = true;
    DataUtil2.throwError = function(error) {
      try {
        throw new Error(error);
      } catch (e) {
        throw e.message + "\n" + e.stack;
      }
    };
    DataUtil2.aggregates = {
      /**
       * Calculate sum of the given field in the data.
       *
       * @param  {Object[]} ds
       * @param  {string} field
       */
      sum: function(ds, field) {
        var result = 0;
        var val;
        var castRequired = typeof DataUtil2.getVal(ds, 0, field) !== "number";
        for (var i = 0; i < ds.length; i++) {
          val = DataUtil2.getVal(ds, i, field);
          if (!isNaN(val) && val !== null) {
            if (castRequired) {
              val = +val;
            }
            result += val;
          }
        }
        return result;
      },
      /**
       * Calculate average value of the given field in the data.
       *
       * @param  {Object[]} ds
       * @param  {string} field
       */
      average: function(ds, field) {
        return DataUtil2.aggregates.sum(ds, field) / ds.length;
      },
      /**
       * Returns the min value of the data based on the field.
       *
       * @param  {Object[]} ds
       * @param  {string|Function} field
       */
      min: function(ds, field) {
        var comparer;
        if (typeof field === "function") {
          comparer = field;
          field = null;
        }
        return DataUtil2.getObject(field, DataUtil2.getItemFromComparer(ds, field, comparer || DataUtil2.fnAscending));
      },
      /**
       * Returns the max value of the data based on the field.
       *
       * @param  {Object[]} ds
       * @param  {string} field
       * @returns number
       */
      max: function(ds, field) {
        var comparer;
        if (typeof field === "function") {
          comparer = field;
          field = null;
        }
        return DataUtil2.getObject(field, DataUtil2.getItemFromComparer(ds, field, comparer || DataUtil2.fnDescending));
      },
      /**
       * Returns the total number of true value present in the data based on the given boolean field name.
       *
       * @param  {Object[]} ds
       * @param  {string} field
       */
      truecount: function(ds, field) {
        return new DataManager(ds).executeLocal(new Query().where(field, "equal", true, true)).length;
      },
      /**
       * Returns the total number of false value present in the data based on the given boolean field name.
       *
       * @param  {Object[]} ds
       * @param  {string} field
       */
      falsecount: function(ds, field) {
        return new DataManager(ds).executeLocal(new Query().where(field, "equal", false, true)).length;
      },
      /**
       * Returns the length of the given data.
       *
       * @param {Object[]} ds
       * @param {string} field?
       * @param field
       * @returns number
       */
      count: function(ds, field) {
        return ds.length;
      }
    };
    DataUtil2.operatorSymbols = {
      "<": "lessthan",
      ">": "greaterthan",
      "<=": "lessthanorequal",
      ">=": "greaterthanorequal",
      "==": "equal",
      "!=": "notequal",
      "*=": "contains",
      "$=": "endswith",
      "^=": "startswith"
    };
    DataUtil2.odBiOperator = {
      "<": " lt ",
      ">": " gt ",
      "<=": " le ",
      ">=": " ge ",
      "==": " eq ",
      "!=": " ne ",
      "lessthan": " lt ",
      "lessthanorequal": " le ",
      "greaterthan": " gt ",
      "greaterthanorequal": " ge ",
      "equal": " eq ",
      "notequal": " ne "
    };
    DataUtil2.odUniOperator = {
      "$=": "endswith",
      "^=": "startswith",
      "*=": "substringof",
      "endswith": "endswith",
      "startswith": "startswith",
      "contains": "substringof",
      "doesnotendwith": "not endswith",
      "doesnotstartwith": "not startswith",
      "doesnotcontain": "not substringof",
      "wildcard": "wildcard",
      "like": "like"
    };
    DataUtil2.odv4UniOperator = {
      "$=": "endswith",
      "^=": "startswith",
      "*=": "contains",
      "endswith": "endswith",
      "startswith": "startswith",
      "contains": "contains",
      "doesnotendwith": "not endswith",
      "doesnotstartwith": "not startswith",
      "doesnotcontain": "not contains",
      "wildcard": "wildcard",
      "like": "like"
    };
    DataUtil2.diacritics = {
      "Ⓐ": "A",
      "Ａ": "A",
      "À": "A",
      "Á": "A",
      "Â": "A",
      "Ầ": "A",
      "Ấ": "A",
      "Ẫ": "A",
      "Ẩ": "A",
      "Ã": "A",
      "Ā": "A",
      "Ă": "A",
      "Ằ": "A",
      "Ắ": "A",
      "Ẵ": "A",
      "Ẳ": "A",
      "Ȧ": "A",
      "Ǡ": "A",
      "Ä": "A",
      "Ǟ": "A",
      "Ả": "A",
      "Å": "A",
      "Ǻ": "A",
      "Ǎ": "A",
      "Ȁ": "A",
      "Ȃ": "A",
      "Ạ": "A",
      "Ậ": "A",
      "Ặ": "A",
      "Ḁ": "A",
      "Ą": "A",
      "Ⱥ": "A",
      "Ɐ": "A",
      "Ꜳ": "AA",
      "Æ": "AE",
      "Ǽ": "AE",
      "Ǣ": "AE",
      "Ꜵ": "AO",
      "Ꜷ": "AU",
      "Ꜹ": "AV",
      "Ꜻ": "AV",
      "Ꜽ": "AY",
      "Ⓑ": "B",
      "Ｂ": "B",
      "Ḃ": "B",
      "Ḅ": "B",
      "Ḇ": "B",
      "Ƀ": "B",
      "Ƃ": "B",
      "Ɓ": "B",
      "Ⓒ": "C",
      "Ｃ": "C",
      "Ć": "C",
      "Ĉ": "C",
      "Ċ": "C",
      "Č": "C",
      "Ç": "C",
      "Ḉ": "C",
      "Ƈ": "C",
      "Ȼ": "C",
      "Ꜿ": "C",
      "Ⓓ": "D",
      "Ｄ": "D",
      "Ḋ": "D",
      "Ď": "D",
      "Ḍ": "D",
      "Ḑ": "D",
      "Ḓ": "D",
      "Ḏ": "D",
      "Đ": "D",
      "Ƌ": "D",
      "Ɗ": "D",
      "Ɖ": "D",
      "Ꝺ": "D",
      "Ǳ": "DZ",
      "Ǆ": "DZ",
      "ǲ": "Dz",
      "ǅ": "Dz",
      "Ⓔ": "E",
      "Ｅ": "E",
      "È": "E",
      "É": "E",
      "Ê": "E",
      "Ề": "E",
      "Ế": "E",
      "Ễ": "E",
      "Ể": "E",
      "Ẽ": "E",
      "Ē": "E",
      "Ḕ": "E",
      "Ḗ": "E",
      "Ĕ": "E",
      "Ė": "E",
      "Ë": "E",
      "Ẻ": "E",
      "Ě": "E",
      "Ȅ": "E",
      "Ȇ": "E",
      "Ẹ": "E",
      "Ệ": "E",
      "Ȩ": "E",
      "Ḝ": "E",
      "Ę": "E",
      "Ḙ": "E",
      "Ḛ": "E",
      "Ɛ": "E",
      "Ǝ": "E",
      "Ⓕ": "F",
      "Ｆ": "F",
      "Ḟ": "F",
      "Ƒ": "F",
      "Ꝼ": "F",
      "Ⓖ": "G",
      "Ｇ": "G",
      "Ǵ": "G",
      "Ĝ": "G",
      "Ḡ": "G",
      "Ğ": "G",
      "Ġ": "G",
      "Ǧ": "G",
      "Ģ": "G",
      "Ǥ": "G",
      "Ɠ": "G",
      "Ꞡ": "G",
      "Ᵹ": "G",
      "Ꝿ": "G",
      "Ⓗ": "H",
      "Ｈ": "H",
      "Ĥ": "H",
      "Ḣ": "H",
      "Ḧ": "H",
      "Ȟ": "H",
      "Ḥ": "H",
      "Ḩ": "H",
      "Ḫ": "H",
      "Ħ": "H",
      "Ⱨ": "H",
      "Ⱶ": "H",
      "Ɥ": "H",
      "Ⓘ": "I",
      "Ｉ": "I",
      "Ì": "I",
      "Í": "I",
      "Î": "I",
      "Ĩ": "I",
      "Ī": "I",
      "Ĭ": "I",
      "İ": "I",
      "Ï": "I",
      "Ḯ": "I",
      "Ỉ": "I",
      "Ǐ": "I",
      "Ȉ": "I",
      "Ȋ": "I",
      "Ị": "I",
      "Į": "I",
      "Ḭ": "I",
      "Ɨ": "I",
      "Ⓙ": "J",
      "Ｊ": "J",
      "Ĵ": "J",
      "Ɉ": "J",
      "Ⓚ": "K",
      "Ｋ": "K",
      "Ḱ": "K",
      "Ǩ": "K",
      "Ḳ": "K",
      "Ķ": "K",
      "Ḵ": "K",
      "Ƙ": "K",
      "Ⱪ": "K",
      "Ꝁ": "K",
      "Ꝃ": "K",
      "Ꝅ": "K",
      "Ꞣ": "K",
      "Ⓛ": "L",
      "Ｌ": "L",
      "Ŀ": "L",
      "Ĺ": "L",
      "Ľ": "L",
      "Ḷ": "L",
      "Ḹ": "L",
      "Ļ": "L",
      "Ḽ": "L",
      "Ḻ": "L",
      "Ł": "L",
      "Ƚ": "L",
      "Ɫ": "L",
      "Ⱡ": "L",
      "Ꝉ": "L",
      "Ꝇ": "L",
      "Ꞁ": "L",
      "Ǉ": "LJ",
      "ǈ": "Lj",
      "Ⓜ": "M",
      "Ｍ": "M",
      "Ḿ": "M",
      "Ṁ": "M",
      "Ṃ": "M",
      "Ɱ": "M",
      "Ɯ": "M",
      "Ⓝ": "N",
      "Ｎ": "N",
      "Ǹ": "N",
      "Ń": "N",
      "Ñ": "N",
      "Ṅ": "N",
      "Ň": "N",
      "Ṇ": "N",
      "Ņ": "N",
      "Ṋ": "N",
      "Ṉ": "N",
      "Ƞ": "N",
      "Ɲ": "N",
      "Ꞑ": "N",
      "Ꞥ": "N",
      "Ǌ": "NJ",
      "ǋ": "Nj",
      "Ⓞ": "O",
      "Ｏ": "O",
      "Ò": "O",
      "Ó": "O",
      "Ô": "O",
      "Ồ": "O",
      "Ố": "O",
      "Ỗ": "O",
      "Ổ": "O",
      "Õ": "O",
      "Ṍ": "O",
      "Ȭ": "O",
      "Ṏ": "O",
      "Ō": "O",
      "Ṑ": "O",
      "Ṓ": "O",
      "Ŏ": "O",
      "Ȯ": "O",
      "Ȱ": "O",
      "Ö": "O",
      "Ȫ": "O",
      "Ỏ": "O",
      "Ő": "O",
      "Ǒ": "O",
      "Ȍ": "O",
      "Ȏ": "O",
      "Ơ": "O",
      "Ờ": "O",
      "Ớ": "O",
      "Ỡ": "O",
      "Ở": "O",
      "Ợ": "O",
      "Ọ": "O",
      "Ộ": "O",
      "Ǫ": "O",
      "Ǭ": "O",
      "Ø": "O",
      "Ǿ": "O",
      "Ɔ": "O",
      "Ɵ": "O",
      "Ꝋ": "O",
      "Ꝍ": "O",
      "Ƣ": "OI",
      "Ꝏ": "OO",
      "Ȣ": "OU",
      "Ⓟ": "P",
      "Ｐ": "P",
      "Ṕ": "P",
      "Ṗ": "P",
      "Ƥ": "P",
      "Ᵽ": "P",
      "Ꝑ": "P",
      "Ꝓ": "P",
      "Ꝕ": "P",
      "Ⓠ": "Q",
      "Ｑ": "Q",
      "Ꝗ": "Q",
      "Ꝙ": "Q",
      "Ɋ": "Q",
      "Ⓡ": "R",
      "Ｒ": "R",
      "Ŕ": "R",
      "Ṙ": "R",
      "Ř": "R",
      "Ȑ": "R",
      "Ȓ": "R",
      "Ṛ": "R",
      "Ṝ": "R",
      "Ŗ": "R",
      "Ṟ": "R",
      "Ɍ": "R",
      "Ɽ": "R",
      "Ꝛ": "R",
      "Ꞧ": "R",
      "Ꞃ": "R",
      "Ⓢ": "S",
      "Ｓ": "S",
      "ẞ": "S",
      "Ś": "S",
      "Ṥ": "S",
      "Ŝ": "S",
      "Ṡ": "S",
      "Š": "S",
      "Ṧ": "S",
      "Ṣ": "S",
      "Ṩ": "S",
      "Ș": "S",
      "Ş": "S",
      "Ȿ": "S",
      "Ꞩ": "S",
      "Ꞅ": "S",
      "Ⓣ": "T",
      "Ｔ": "T",
      "Ṫ": "T",
      "Ť": "T",
      "Ṭ": "T",
      "Ț": "T",
      "Ţ": "T",
      "Ṱ": "T",
      "Ṯ": "T",
      "Ŧ": "T",
      "Ƭ": "T",
      "Ʈ": "T",
      "Ⱦ": "T",
      "Ꞇ": "T",
      "Ꜩ": "TZ",
      "Ⓤ": "U",
      "Ｕ": "U",
      "Ù": "U",
      "Ú": "U",
      "Û": "U",
      "Ũ": "U",
      "Ṹ": "U",
      "Ū": "U",
      "Ṻ": "U",
      "Ŭ": "U",
      "Ü": "U",
      "Ǜ": "U",
      "Ǘ": "U",
      "Ǖ": "U",
      "Ǚ": "U",
      "Ủ": "U",
      "Ů": "U",
      "Ű": "U",
      "Ǔ": "U",
      "Ȕ": "U",
      "Ȗ": "U",
      "Ư": "U",
      "Ừ": "U",
      "Ứ": "U",
      "Ữ": "U",
      "Ử": "U",
      "Ự": "U",
      "Ụ": "U",
      "Ṳ": "U",
      "Ų": "U",
      "Ṷ": "U",
      "Ṵ": "U",
      "Ʉ": "U",
      "Ⓥ": "V",
      "Ｖ": "V",
      "Ṽ": "V",
      "Ṿ": "V",
      "Ʋ": "V",
      "Ꝟ": "V",
      "Ʌ": "V",
      "Ꝡ": "VY",
      "Ⓦ": "W",
      "Ｗ": "W",
      "Ẁ": "W",
      "Ẃ": "W",
      "Ŵ": "W",
      "Ẇ": "W",
      "Ẅ": "W",
      "Ẉ": "W",
      "Ⱳ": "W",
      "Ⓧ": "X",
      "Ｘ": "X",
      "Ẋ": "X",
      "Ẍ": "X",
      "Ⓨ": "Y",
      "Ｙ": "Y",
      "Ỳ": "Y",
      "Ý": "Y",
      "Ŷ": "Y",
      "Ỹ": "Y",
      "Ȳ": "Y",
      "Ẏ": "Y",
      "Ÿ": "Y",
      "Ỷ": "Y",
      "Ỵ": "Y",
      "Ƴ": "Y",
      "Ɏ": "Y",
      "Ỿ": "Y",
      "Ⓩ": "Z",
      "Ｚ": "Z",
      "Ź": "Z",
      "Ẑ": "Z",
      "Ż": "Z",
      "Ž": "Z",
      "Ẓ": "Z",
      "Ẕ": "Z",
      "Ƶ": "Z",
      "Ȥ": "Z",
      "Ɀ": "Z",
      "Ⱬ": "Z",
      "Ꝣ": "Z",
      "ⓐ": "a",
      "ａ": "a",
      "ẚ": "a",
      "à": "a",
      "á": "a",
      "â": "a",
      "ầ": "a",
      "ấ": "a",
      "ẫ": "a",
      "ẩ": "a",
      "ã": "a",
      "ā": "a",
      "ă": "a",
      "ằ": "a",
      "ắ": "a",
      "ẵ": "a",
      "ẳ": "a",
      "ȧ": "a",
      "ǡ": "a",
      "ä": "a",
      "ǟ": "a",
      "ả": "a",
      "å": "a",
      "ǻ": "a",
      "ǎ": "a",
      "ȁ": "a",
      "ȃ": "a",
      "ạ": "a",
      "ậ": "a",
      "ặ": "a",
      "ḁ": "a",
      "ą": "a",
      "ⱥ": "a",
      "ɐ": "a",
      "ꜳ": "aa",
      "æ": "ae",
      "ǽ": "ae",
      "ǣ": "ae",
      "ꜵ": "ao",
      "ꜷ": "au",
      "ꜹ": "av",
      "ꜻ": "av",
      "ꜽ": "ay",
      "ⓑ": "b",
      "ｂ": "b",
      "ḃ": "b",
      "ḅ": "b",
      "ḇ": "b",
      "ƀ": "b",
      "ƃ": "b",
      "ɓ": "b",
      "ⓒ": "c",
      "ｃ": "c",
      "ć": "c",
      "ĉ": "c",
      "ċ": "c",
      "č": "c",
      "ç": "c",
      "ḉ": "c",
      "ƈ": "c",
      "ȼ": "c",
      "ꜿ": "c",
      "ↄ": "c",
      "ⓓ": "d",
      "ｄ": "d",
      "ḋ": "d",
      "ď": "d",
      "ḍ": "d",
      "ḑ": "d",
      "ḓ": "d",
      "ḏ": "d",
      "đ": "d",
      "ƌ": "d",
      "ɖ": "d",
      "ɗ": "d",
      "ꝺ": "d",
      "ǳ": "dz",
      "ǆ": "dz",
      "ⓔ": "e",
      "ｅ": "e",
      "è": "e",
      "é": "e",
      "ê": "e",
      "ề": "e",
      "ế": "e",
      "ễ": "e",
      "ể": "e",
      "ẽ": "e",
      "ē": "e",
      "ḕ": "e",
      "ḗ": "e",
      "ĕ": "e",
      "ė": "e",
      "ë": "e",
      "ẻ": "e",
      "ě": "e",
      "ȅ": "e",
      "ȇ": "e",
      "ẹ": "e",
      "ệ": "e",
      "ȩ": "e",
      "ḝ": "e",
      "ę": "e",
      "ḙ": "e",
      "ḛ": "e",
      "ɇ": "e",
      "ɛ": "e",
      "ǝ": "e",
      "ⓕ": "f",
      "ｆ": "f",
      "ḟ": "f",
      "ƒ": "f",
      "ꝼ": "f",
      "ⓖ": "g",
      "ｇ": "g",
      "ǵ": "g",
      "ĝ": "g",
      "ḡ": "g",
      "ğ": "g",
      "ġ": "g",
      "ǧ": "g",
      "ģ": "g",
      "ǥ": "g",
      "ɠ": "g",
      "ꞡ": "g",
      "ᵹ": "g",
      "ꝿ": "g",
      "ⓗ": "h",
      "ｈ": "h",
      "ĥ": "h",
      "ḣ": "h",
      "ḧ": "h",
      "ȟ": "h",
      "ḥ": "h",
      "ḩ": "h",
      "ḫ": "h",
      "ẖ": "h",
      "ħ": "h",
      "ⱨ": "h",
      "ⱶ": "h",
      "ɥ": "h",
      "ƕ": "hv",
      "ⓘ": "i",
      "ｉ": "i",
      "ì": "i",
      "í": "i",
      "î": "i",
      "ĩ": "i",
      "ī": "i",
      "ĭ": "i",
      "ï": "i",
      "ḯ": "i",
      "ỉ": "i",
      "ǐ": "i",
      "ȉ": "i",
      "ȋ": "i",
      "ị": "i",
      "į": "i",
      "ḭ": "i",
      "ɨ": "i",
      "ı": "i",
      "ⓙ": "j",
      "ｊ": "j",
      "ĵ": "j",
      "ǰ": "j",
      "ɉ": "j",
      "ⓚ": "k",
      "ｋ": "k",
      "ḱ": "k",
      "ǩ": "k",
      "ḳ": "k",
      "ķ": "k",
      "ḵ": "k",
      "ƙ": "k",
      "ⱪ": "k",
      "ꝁ": "k",
      "ꝃ": "k",
      "ꝅ": "k",
      "ꞣ": "k",
      "ⓛ": "l",
      "ｌ": "l",
      "ŀ": "l",
      "ĺ": "l",
      "ľ": "l",
      "ḷ": "l",
      "ḹ": "l",
      "ļ": "l",
      "ḽ": "l",
      "ḻ": "l",
      "ſ": "l",
      "ł": "l",
      "ƚ": "l",
      "ɫ": "l",
      "ⱡ": "l",
      "ꝉ": "l",
      "ꞁ": "l",
      "ꝇ": "l",
      "ǉ": "lj",
      "ⓜ": "m",
      "ｍ": "m",
      "ḿ": "m",
      "ṁ": "m",
      "ṃ": "m",
      "ɱ": "m",
      "ɯ": "m",
      "ⓝ": "n",
      "ｎ": "n",
      "ǹ": "n",
      "ń": "n",
      "ñ": "n",
      "ṅ": "n",
      "ň": "n",
      "ṇ": "n",
      "ņ": "n",
      "ṋ": "n",
      "ṉ": "n",
      "ƞ": "n",
      "ɲ": "n",
      "ŉ": "n",
      "ꞑ": "n",
      "ꞥ": "n",
      "ǌ": "nj",
      "ⓞ": "o",
      "ｏ": "o",
      "ò": "o",
      "ó": "o",
      "ô": "o",
      "ồ": "o",
      "ố": "o",
      "ỗ": "o",
      "ổ": "o",
      "õ": "o",
      "ṍ": "o",
      "ȭ": "o",
      "ṏ": "o",
      "ō": "o",
      "ṑ": "o",
      "ṓ": "o",
      "ŏ": "o",
      "ȯ": "o",
      "ȱ": "o",
      "ö": "o",
      "ȫ": "o",
      "ỏ": "o",
      "ő": "o",
      "ǒ": "o",
      "ȍ": "o",
      "ȏ": "o",
      "ơ": "o",
      "ờ": "o",
      "ớ": "o",
      "ỡ": "o",
      "ở": "o",
      "ợ": "o",
      "ọ": "o",
      "ộ": "o",
      "ǫ": "o",
      "ǭ": "o",
      "ø": "o",
      "ǿ": "o",
      "ɔ": "o",
      "ꝋ": "o",
      "ꝍ": "o",
      "ɵ": "o",
      "ƣ": "oi",
      "ȣ": "ou",
      "ꝏ": "oo",
      "ⓟ": "p",
      "ｐ": "p",
      "ṕ": "p",
      "ṗ": "p",
      "ƥ": "p",
      "ᵽ": "p",
      "ꝑ": "p",
      "ꝓ": "p",
      "ꝕ": "p",
      "ⓠ": "q",
      "ｑ": "q",
      "ɋ": "q",
      "ꝗ": "q",
      "ꝙ": "q",
      "ⓡ": "r",
      "ｒ": "r",
      "ŕ": "r",
      "ṙ": "r",
      "ř": "r",
      "ȑ": "r",
      "ȓ": "r",
      "ṛ": "r",
      "ṝ": "r",
      "ŗ": "r",
      "ṟ": "r",
      "ɍ": "r",
      "ɽ": "r",
      "ꝛ": "r",
      "ꞧ": "r",
      "ꞃ": "r",
      "ⓢ": "s",
      "ｓ": "s",
      "ß": "s",
      "ś": "s",
      "ṥ": "s",
      "ŝ": "s",
      "ṡ": "s",
      "š": "s",
      "ṧ": "s",
      "ṣ": "s",
      "ṩ": "s",
      "ș": "s",
      "ş": "s",
      "ȿ": "s",
      "ꞩ": "s",
      "ꞅ": "s",
      "ẛ": "s",
      "ⓣ": "t",
      "ｔ": "t",
      "ṫ": "t",
      "ẗ": "t",
      "ť": "t",
      "ṭ": "t",
      "ț": "t",
      "ţ": "t",
      "ṱ": "t",
      "ṯ": "t",
      "ŧ": "t",
      "ƭ": "t",
      "ʈ": "t",
      "ⱦ": "t",
      "ꞇ": "t",
      "ꜩ": "tz",
      "ⓤ": "u",
      "ｕ": "u",
      "ù": "u",
      "ú": "u",
      "û": "u",
      "ũ": "u",
      "ṹ": "u",
      "ū": "u",
      "ṻ": "u",
      "ŭ": "u",
      "ü": "u",
      "ǜ": "u",
      "ǘ": "u",
      "ǖ": "u",
      "ǚ": "u",
      "ủ": "u",
      "ů": "u",
      "ű": "u",
      "ǔ": "u",
      "ȕ": "u",
      "ȗ": "u",
      "ư": "u",
      "ừ": "u",
      "ứ": "u",
      "ữ": "u",
      "ử": "u",
      "ự": "u",
      "ụ": "u",
      "ṳ": "u",
      "ų": "u",
      "ṷ": "u",
      "ṵ": "u",
      "ʉ": "u",
      "ⓥ": "v",
      "ｖ": "v",
      "ṽ": "v",
      "ṿ": "v",
      "ʋ": "v",
      "ꝟ": "v",
      "ʌ": "v",
      "ꝡ": "vy",
      "ⓦ": "w",
      "ｗ": "w",
      "ẁ": "w",
      "ẃ": "w",
      "ŵ": "w",
      "ẇ": "w",
      "ẅ": "w",
      "ẘ": "w",
      "ẉ": "w",
      "ⱳ": "w",
      "ⓧ": "x",
      "ｘ": "x",
      "ẋ": "x",
      "ẍ": "x",
      "ⓨ": "y",
      "ｙ": "y",
      "ỳ": "y",
      "ý": "y",
      "ŷ": "y",
      "ỹ": "y",
      "ȳ": "y",
      "ẏ": "y",
      "ÿ": "y",
      "ỷ": "y",
      "ẙ": "y",
      "ỵ": "y",
      "ƴ": "y",
      "ɏ": "y",
      "ỿ": "y",
      "ⓩ": "z",
      "ｚ": "z",
      "ź": "z",
      "ẑ": "z",
      "ż": "z",
      "ž": "z",
      "ẓ": "z",
      "ẕ": "z",
      "ƶ": "z",
      "ȥ": "z",
      "ɀ": "z",
      "ⱬ": "z",
      "ꝣ": "z",
      "Ά": "Α",
      "Έ": "Ε",
      "Ή": "Η",
      "Ί": "Ι",
      "Ϊ": "Ι",
      "Ό": "Ο",
      "Ύ": "Υ",
      "Ϋ": "Υ",
      "Ώ": "Ω",
      "ά": "α",
      "έ": "ε",
      "ή": "η",
      "ί": "ι",
      "ϊ": "ι",
      "ΐ": "ι",
      "ό": "ο",
      "ύ": "υ",
      "ϋ": "υ",
      "ΰ": "υ",
      "ω": "ω",
      "ς": "σ"
    };
    DataUtil2.fnOperators = {
      /**
       * Returns true when the actual input is equal to the given input.
       *
       * @param {string|number|boolean} actual
       * @param {string|number|boolean} expected
       * @param {boolean} ignoreCase?
       * @param {boolean} ignoreAccent?
       * @param ignoreCase
       * @param ignoreAccent
       */
      equal: function(actual, expected, ignoreCase, ignoreAccent) {
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expected = DataUtil2.ignoreDiacritics(expected);
        }
        if (ignoreCase) {
          return DataUtil2.toLowerCase(actual) === DataUtil2.toLowerCase(expected);
        }
        return actual === expected;
      },
      /**
       * Returns true when the actual input is not equal to the given input.
       *
       * @param {string|number|boolean} actual
       * @param {string|number|boolean} expected
       * @param {boolean} ignoreCase?
       * @param ignoreCase
       * @param ignoreAccent
       */
      notequal: function(actual, expected, ignoreCase, ignoreAccent) {
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expected = DataUtil2.ignoreDiacritics(expected);
        }
        return !DataUtil2.fnOperators.equal(actual, expected, ignoreCase);
      },
      /**
       * Returns true when the actual input is less than to the given input.
       *
       * @param {string|number|boolean} actual
       * @param {string|number|boolean} expected
       * @param {boolean} ignoreCase?
       * @param ignoreCase
       */
      lessthan: function(actual, expected, ignoreCase) {
        if (ignoreCase) {
          return DataUtil2.toLowerCase(actual) < DataUtil2.toLowerCase(expected);
        }
        if (isNullOrUndefined(actual)) {
          actual = void 0;
        }
        return actual < expected;
      },
      /**
       * Returns true when the actual input is greater than to the given input.
       *
       * @param {string|number|boolean} actual
       * @param {string|number|boolean} expected
       * @param {boolean} ignoreCase?
       * @param ignoreCase
       */
      greaterthan: function(actual, expected, ignoreCase) {
        if (ignoreCase) {
          return DataUtil2.toLowerCase(actual) > DataUtil2.toLowerCase(expected);
        }
        if (isNullOrUndefined(actual)) {
          actual = void 0;
        }
        return actual > expected;
      },
      /**
       * Returns true when the actual input is less than or equal to the given input.
       *
       * @param {string|number|boolean} actual
       * @param {string|number|boolean} expected
       * @param {boolean} ignoreCase?
       * @param ignoreCase
       */
      lessthanorequal: function(actual, expected, ignoreCase) {
        if (ignoreCase) {
          return DataUtil2.toLowerCase(actual) <= DataUtil2.toLowerCase(expected);
        }
        if (isNullOrUndefined(actual)) {
          actual = void 0;
        }
        return actual <= expected;
      },
      /**
       * Returns true when the actual input is greater than or equal to the given input.
       *
       * @param {string|number|boolean} actual
       * @param {string|number|boolean} expected
       * @param {boolean} ignoreCase?
       * @param ignoreCase
       */
      greaterthanorequal: function(actual, expected, ignoreCase) {
        if (ignoreCase) {
          return DataUtil2.toLowerCase(actual) >= DataUtil2.toLowerCase(expected);
        }
        return actual >= expected;
      },
      /**
       * Returns true when the actual input contains the given string.
       *
       * @param {string|number} actual
       * @param {string|number} expected
       * @param {boolean} ignoreCase?
       * @param ignoreCase
       * @param ignoreAccent
       */
      contains: function(actual, expected, ignoreCase, ignoreAccent) {
        if (expected === "") {
          return true;
        }
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expected = DataUtil2.ignoreDiacritics(expected);
        }
        if (ignoreCase) {
          return !isNullOrUndefined(actual) && !isNullOrUndefined(expected) && DataUtil2.toLowerCase(actual).indexOf(DataUtil2.toLowerCase(expected)) !== -1;
        }
        return !isNullOrUndefined(actual) && !isNullOrUndefined(expected) && actual.toString().indexOf(expected) !== -1;
      },
      /**
       * Returns true when the actual input not contains the given string.
       *
       * @param  {string|number} actual
       * @param  {string|number} expected
       * @param  {boolean} ignoreCase?
       */
      doesnotcontain: function(actual, expected, ignoreCase, ignoreAccent) {
        if (expected === "") {
          return false;
        }
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expected = DataUtil2.ignoreDiacritics(expected);
        }
        if (ignoreCase) {
          return !isNullOrUndefined(actual) && !isNullOrUndefined(expected) && DataUtil2.toLowerCase(actual).indexOf(DataUtil2.toLowerCase(expected)) === -1;
        }
        return !isNullOrUndefined(actual) && !isNullOrUndefined(expected) && actual.toString().indexOf(expected) === -1;
      },
      /**
       * Returns true when the given input value is not null.
       *
       * @param  {string|number} actual
       * @returns boolean
       */
      isnotnull: function(actual) {
        return actual !== null && actual !== void 0;
      },
      /**
       * Returns true when the given input value is null.
       *
       * @param  {string|number} actual
       * @returns boolean
       */
      isnull: function(actual) {
        return actual === null || actual === void 0;
      },
      /**
       * Returns true when the actual input starts with the given string
       *
       * @param {string} actual
       * @param {string} expected
       * @param {boolean} ignoreCase?
       * @param ignoreCase
       * @param ignoreAccent
       */
      startswith: function(actual, expected, ignoreCase, ignoreAccent) {
        if (expected === "") {
          return true;
        }
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expected = DataUtil2.ignoreDiacritics(expected);
        }
        if (ignoreCase) {
          return actual && expected && DataUtil2.startsWith(DataUtil2.toLowerCase(actual), DataUtil2.toLowerCase(expected));
        }
        return actual && expected && DataUtil2.startsWith(actual, expected);
      },
      /**
       * Returns true when the actual input not starts with the given string
       *
       * @param  {string} actual
       * @param  {string} expected
       * @param  {boolean} ignoreCase?
       */
      doesnotstartwith: function(actual, expected, ignoreCase, ignoreAccent) {
        if (expected === "") {
          return false;
        }
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expected = DataUtil2.ignoreDiacritics(expected);
        }
        if (ignoreCase) {
          return actual && expected && DataUtil2.notStartsWith(DataUtil2.toLowerCase(actual), DataUtil2.toLowerCase(expected));
        }
        return actual && expected && DataUtil2.notStartsWith(actual, expected);
      },
      /**
       * Returns true when the actual input like with the given string.
       *
       * @param  {string} actual
       * @param  {string} expected
       * @param  {boolean} ignoreCase?
       */
      like: function(actual, expected, ignoreCase, ignoreAccent) {
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expected = DataUtil2.ignoreDiacritics(expected);
        }
        if (ignoreCase) {
          return actual && expected && DataUtil2.like(DataUtil2.toLowerCase(actual), DataUtil2.toLowerCase(expected));
        }
        return actual && expected && DataUtil2.like(actual, expected);
      },
      /**
       * Returns true when the given input value is empty.
       *
       * @param  {string|number} actual
       * @returns boolean
       */
      isempty: function(actual) {
        return actual === void 0 || actual === "";
      },
      /**
       * Returns true when the given input value is not empty.
       *
       * @param  {string|number} actual
       * @returns boolean
       */
      isnotempty: function(actual) {
        return actual !== void 0 && actual !== "";
      },
      /**
       * Returns true when the actual input pattern(wildcard) matches with the given string.
       *
       * @param  {string|Date} actual
       * @param  {string} expected
       * @param  {boolean} ignoreCase?
       */
      wildcard: function(actual, expected, ignoreCase, ignoreAccent) {
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expected = DataUtil2.ignoreDiacritics(expected);
        }
        if (ignoreCase) {
          return (actual || typeof actual === "boolean") && expected && typeof actual !== "object" && DataUtil2.wildCard(DataUtil2.toLowerCase(actual), DataUtil2.toLowerCase(expected));
        }
        return (actual || typeof actual === "boolean") && expected && DataUtil2.wildCard(actual, expected);
      },
      /**
       * Returns true when the actual input ends with the given string.
       *
       * @param {string} actual
       * @param {string} expected
       * @param {boolean} ignoreCase?
       * @param ignoreCase
       * @param ignoreAccent
       */
      endswith: function(actual, expected, ignoreCase, ignoreAccent) {
        if (expected === "") {
          return true;
        }
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expected = DataUtil2.ignoreDiacritics(expected);
        }
        if (ignoreCase) {
          return actual && expected && DataUtil2.endsWith(DataUtil2.toLowerCase(actual), DataUtil2.toLowerCase(expected));
        }
        return actual && expected && DataUtil2.endsWith(actual, expected);
      },
      /**
       * Returns true when the actual input not ends with the given string.
       *
       * @param  {string} actual
       * @param  {string} expected
       * @param  {boolean} ignoreCase?
       */
      doesnotendwith: function(actual, expected, ignoreCase, ignoreAccent) {
        if (expected === "") {
          return false;
        }
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expected = DataUtil2.ignoreDiacritics(expected);
        }
        if (ignoreCase) {
          return actual && expected && DataUtil2.notEndsWith(DataUtil2.toLowerCase(actual), DataUtil2.toLowerCase(expected));
        }
        return actual && expected && DataUtil2.notEndsWith(actual, expected);
      },
      /**
       * It will return the filter operator based on the filter symbol.
       *
       * @param  {string} operator
       * @hidden
       */
      processSymbols: function(operator) {
        var fnName = DataUtil2.operatorSymbols[operator];
        if (fnName) {
          var fn = DataUtil2.fnOperators[fnName];
          return fn;
        }
        return DataUtil2.throwError("Query - Process Operator : Invalid operator");
      },
      /**
       * It will return the valid filter operator based on the specified operators.
       *
       * @param  {string} operator
       * @hidden
       */
      processOperator: function(operator) {
        var fn = DataUtil2.fnOperators[operator];
        if (fn) {
          return fn;
        }
        return DataUtil2.fnOperators.processSymbols(operator);
      },
      /**
       * Checks if the specified value exists in the given array, with optional case and accent insensitivity.
       *
       * @param {string | number} actual - The value to check.
       * @param {Array<string | number>} expectedArray - The array to search within.
       * @param {boolean} [ignoreCase] - Whether to perform a case-insensitive comparison.
       * @param {boolean} [ignoreAccent] - Whether to ignore accents/diacritics.
       * @returns {boolean} `true` if the value is found, otherwise `false`.
       */
      in: function(actual, expectedArray, ignoreCase, ignoreAccent) {
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expectedArray = DataUtil2.ignoreDiacriticsForArrays(expectedArray);
        }
        if (ignoreCase) {
          return !isNullOrUndefined(actual) && expectedArray && expectedArray.length > 0 && expectedArray.map(function(item) {
            return DataUtil2.toLowerCase(item);
          }).indexOf(DataUtil2.toLowerCase(actual)) > -1;
        }
        if (actual instanceof Date) {
          return !isNullOrUndefined(actual) && expectedArray && expectedArray.length > 0 && Array.isArray(expectedArray) && expectedArray.some(function(item) {
            return item instanceof Date && item.getTime() === actual.getTime();
          });
        }
        return !isNullOrUndefined(actual) && expectedArray && expectedArray.length > 0 && expectedArray.indexOf(actual) > -1;
      },
      /**
       * Checks if the specified value is not present in the given array, with optional case and accent insensitivity.
       *
       * @param {string | number} actual - The value to check.
       * @param {Array<string | number>} expectedArray - The array to search within.
       * @param {boolean} [ignoreCase] - Whether to perform a case-insensitive comparison.
       * @param {boolean} [ignoreAccent] - Whether to ignore accents/diacritics.
       * @returns {boolean} `true` if the value is not found, otherwise `false`.
       */
      notin: function(actual, expectedArray, ignoreCase, ignoreAccent) {
        if (ignoreAccent) {
          actual = DataUtil2.ignoreDiacritics(actual);
          expectedArray = DataUtil2.ignoreDiacriticsForArrays(expectedArray);
        }
        if (ignoreCase) {
          return !isNullOrUndefined(actual) && expectedArray && expectedArray.length > 0 && expectedArray.map(function(item) {
            return DataUtil2.toLowerCase(item);
          }).indexOf(DataUtil2.toLowerCase(actual)) === -1;
        }
        if (actual instanceof Date) {
          return !isNullOrUndefined(actual) && expectedArray && expectedArray.length > 0 && Array.isArray(expectedArray) && expectedArray.every(function(item) {
            return !(item instanceof Date) || item.getTime() !== actual.getTime();
          });
        }
        return !isNullOrUndefined(actual) && expectedArray && expectedArray.length > 0 && expectedArray.indexOf(actual) === -1;
      }
    };
    DataUtil2.parse = {
      /**
       * Parse the given string to the plain JavaScript object.
       *
       * @param  {string|Object|Object[]} jsonText
       */
      parseJson: function(jsonText) {
        if (typeof jsonText === "string" && (/^[\s]*\[|^[\s]*\{(.)+:/g.test(jsonText) || jsonText.indexOf('"') === -1)) {
          jsonText = JSON.parse(jsonText, DataUtil2.parse.jsonReviver);
        } else if (jsonText instanceof Array) {
          DataUtil2.parse.iterateAndReviveArray(jsonText);
        } else if (typeof jsonText === "object" && jsonText !== null) {
          DataUtil2.parse.iterateAndReviveJson(jsonText);
        }
        return jsonText;
      },
      /**
       * It will perform on array of values.
       *
       * @param  {string[]|Object[]} array
       * @hidden
       */
      iterateAndReviveArray: function(array) {
        for (var i = 0; i < array.length; i++) {
          if (typeof array[i] === "object" && array[i] !== null) {
            DataUtil2.parse.iterateAndReviveJson(array[i]);
          } else if (typeof array[i] === "string" && (!/^[\s]*\[|^[\s]*\{(.)+:|\"/g.test(array[i]) || array[i].toString().indexOf('"') === -1)) {
            array[i] = DataUtil2.parse.jsonReviver("", array[i]);
          } else {
            array[i] = DataUtil2.parse.parseJson(array[i]);
          }
        }
      },
      /**
       * It will perform on JSON values
       *
       * @param  {JSON} json
       * @hidden
       */
      iterateAndReviveJson: function(json) {
        var value;
        var keys = Object.keys(json);
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
          var prop = keys_2[_i];
          if (DataUtil2.startsWith(prop, "__")) {
            continue;
          }
          value = json[prop];
          if (typeof value === "object") {
            if (value instanceof Array) {
              DataUtil2.parse.iterateAndReviveArray(value);
            } else if (value) {
              DataUtil2.parse.iterateAndReviveJson(value);
            }
          } else {
            json[prop] = DataUtil2.parse.jsonReviver(json[prop], value);
          }
        }
      },
      /**
       * It will perform on JSON values
       *
       * @param  {string} field
       * @param  {string|Date} value
       * @hidden
       */
      jsonReviver: function(field, value) {
        if (typeof value === "string") {
          var ms = /^\/Date\(([+-]?[0-9]+)([+-][0-9]{4})?\)\/$/.exec(value);
          var offSet = DataUtil2.timeZoneHandling ? DataUtil2.serverTimezoneOffset : null;
          if (ms) {
            return DataUtil2.dateParse.toTimeZone(new Date(parseInt(ms[1], 10)), offSet, true);
          } else if (/^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*){1})([zZ]|([+\-])(\d\d):?(\d\d))?$/.test(value)) {
            var isUTC = value.indexOf("Z") > -1 || value.indexOf("z") > -1;
            var arr = value.split(/[^0-9.]/);
            if (isUTC) {
              if (arr[5].indexOf(".") > -1) {
                var secondsMs = arr[5].split(".");
                arr[5] = secondsMs[0];
                arr[6] = new Date(value).getUTCMilliseconds().toString();
              } else {
                arr[6] = "00";
              }
              value = DataUtil2.dateParse.toTimeZone(new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, parseInt(arr[2], 10), parseInt(arr[3], 10), parseInt(arr[4], 10), parseInt(arr[5] ? arr[5] : "00", 10), parseInt(arr[6], 10)), DataUtil2.serverTimezoneOffset, false);
            } else {
              var utcFormat = new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, parseInt(arr[2], 10), parseInt(arr[3], 10), parseInt(arr[4], 10), parseInt(arr[5] ? arr[5] : "00", 10));
              var hrs = parseInt(arr[6], 10);
              var mins = parseInt(arr[7], 10);
              if (isNaN(hrs) && isNaN(mins)) {
                return utcFormat;
              }
              if (value.indexOf("+") > -1) {
                utcFormat.setHours(utcFormat.getHours() - hrs, utcFormat.getMinutes() - mins);
              } else {
                utcFormat.setHours(utcFormat.getHours() + hrs, utcFormat.getMinutes() + mins);
              }
              value = DataUtil2.dateParse.toTimeZone(utcFormat, DataUtil2.serverTimezoneOffset, false);
            }
            if (DataUtil2.serverTimezoneOffset == null) {
              value = DataUtil2.dateParse.addSelfOffset(value);
            }
          }
        }
        return value;
      },
      /**
       * Check wheather the given value is JSON or not.
       *
       * @param  {Object[]} jsonData
       */
      isJson: function(jsonData) {
        if (typeof jsonData[0] === "string") {
          return jsonData;
        }
        return DataUtil2.parse.parseJson(jsonData);
      },
      /**
       * Checks wheather the given value is GUID or not.
       *
       * @param  {string} value
       */
      isGuid: function(value) {
        var regex = /[A-Fa-f0-9]{8}(?:-[A-Fa-f0-9]{4}){3}-[A-Fa-f0-9]{12}/i;
        var match = regex.exec(value);
        return match != null;
      },
      /**
       * The method used to replace the value based on the type.
       *
       * @param  {Object} value
       * @param  {boolean} stringify
       * @hidden
       */
      replacer: function(value, stringify) {
        if (DataUtil2.isPlainObject(value)) {
          return DataUtil2.parse.jsonReplacer(value, stringify);
        }
        if (value instanceof Array) {
          return DataUtil2.parse.arrayReplacer(value);
        }
        if (value instanceof Date) {
          return DataUtil2.parse.jsonReplacer({ val: value }, stringify).val;
        }
        return value;
      },
      /**
       * It will replace the JSON value.
       *
       * @param {string} key
       * @param {Object} val
       * @param stringify
       * @hidden
       */
      jsonReplacer: function(val, stringify) {
        var value;
        var keys = Object.keys(val);
        for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
          var prop = keys_3[_i];
          value = val[prop];
          if (!(value instanceof Date)) {
            continue;
          }
          var d = value;
          if (DataUtil2.serverTimezoneOffset == null) {
            val[prop] = DataUtil2.dateParse.toTimeZone(d, null).toJSON();
          } else {
            d = new Date(+d + DataUtil2.serverTimezoneOffset * 36e5);
            val[prop] = DataUtil2.dateParse.toTimeZone(DataUtil2.dateParse.addSelfOffset(d), null).toJSON();
          }
        }
        return val;
      },
      /**
       * It will replace the Array of value.
       *
       * @param  {string} key
       * @param  {Object[]} val
       * @hidden
       */
      arrayReplacer: function(val) {
        for (var i = 0; i < val.length; i++) {
          if (DataUtil2.isPlainObject(val[i])) {
            val[i] = DataUtil2.parse.jsonReplacer(val[i]);
          } else if (val[i] instanceof Date) {
            val[i] = DataUtil2.parse.jsonReplacer({ date: val[i] }).date;
          }
        }
        return val;
      },
      /**
       * It will replace the Date object with respective to UTC format value.
       *
       * @param  {string} key
       * @param  {any} value
       * @hidden
       */
      /* eslint-disable @typescript-eslint/no-explicit-any */
      /* tslint:disable-next-line:no-any */
      jsonDateReplacer: function(key, value) {
        if (key === "value" && value) {
          if (typeof value === "string") {
            var ms = /^\/Date\(([+-]?[0-9]+)([+-][0-9]{4})?\)\/$/.exec(value);
            if (ms) {
              value = DataUtil2.dateParse.toTimeZone(new Date(parseInt(ms[1], 10)), null, true);
            } else if (/^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*){1})([zZ]|([+\-])(\d\d):?(\d\d))?$/.test(value)) {
              var arr = value.split(/[^0-9]/);
              value = DataUtil2.dateParse.toTimeZone(new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, parseInt(arr[2], 10), parseInt(arr[3], 10), parseInt(arr[4], 10), parseInt(arr[5], 10)), null, true);
            }
          }
          if (value instanceof Date) {
            value = DataUtil2.dateParse.addSelfOffset(value);
            if (DataUtil2.serverTimezoneOffset === null) {
              return DataUtil2.dateParse.toTimeZone(DataUtil2.dateParse.addSelfOffset(value), null).toJSON();
            } else {
              value = DataUtil2.dateParse.toTimeZone(value, value.getTimezoneOffset() / 60 - DataUtil2.serverTimezoneOffset, false);
              return value.toJSON();
            }
          }
        }
        return value;
      }
    };
    DataUtil2.dateParse = {
      addSelfOffset: function(input) {
        return new Date(+input - input.getTimezoneOffset() * 6e4);
      },
      toUTC: function(input) {
        return new Date(+input + input.getTimezoneOffset() * 6e4);
      },
      toTimeZone: function(input, offset, utc) {
        if (offset === null) {
          return input;
        }
        var unix = utc ? DataUtil2.dateParse.toUTC(input) : input;
        return new Date(+unix - offset * 36e5);
      },
      toLocalTime: function(input) {
        var datefn = input;
        var timeZone = -datefn.getTimezoneOffset();
        var differenceString = timeZone >= 0 ? "+" : "-";
        var localtimefn = function(num) {
          var norm = Math.floor(Math.abs(num));
          return (norm < 10 ? "0" : "") + norm;
        };
        var val = datefn.getFullYear() + "-" + localtimefn(datefn.getMonth() + 1) + "-" + localtimefn(datefn.getDate()) + "T" + localtimefn(datefn.getHours()) + ":" + localtimefn(datefn.getMinutes()) + ":" + localtimefn(datefn.getSeconds()) + differenceString + localtimefn(timeZone / 60) + ":" + localtimefn(timeZone % 60);
        return val;
      }
    };
    return DataUtil2;
  })()
);

// node_modules/@syncfusion/ej2-data/src/query.js
var Query = (
  /** @class */
  (function() {
    function Query2(from) {
      this.subQuery = null;
      this.isChild = false;
      this.distincts = [];
      this.queries = [];
      this.key = "";
      this.fKey = "";
      if (typeof from === "string") {
        this.fromTable = from;
      } else if (from && from instanceof Array) {
        this.lookups = from;
      }
      this.expands = [];
      this.sortedColumns = [];
      this.groupedColumns = [];
      this.subQuery = null;
      this.isChild = false;
      this.params = [];
      this.lazyLoad = [];
      return this;
    }
    Object.defineProperty(Query2.prototype, "moduleName", {
      /** @hidden */
      get: function() {
        return "query";
      },
      enumerable: true,
      configurable: true
    });
    ;
    Query2.prototype.setKey = function(field) {
      this.key = field;
      return this;
    };
    Query2.prototype.using = function(dataManager) {
      this.dataManager = dataManager;
      return this;
    };
    Query2.prototype.execute = function(dataManager, done, fail, always) {
      dataManager = dataManager || this.dataManager;
      if (dataManager) {
        return dataManager.executeQuery(this, done, fail, always);
      }
      return DataUtil.throwError('Query - execute() : dataManager needs to be is set using "using" function or should be passed as argument');
    };
    Query2.prototype.executeLocal = function(dataManager) {
      dataManager = dataManager || this.dataManager;
      if (dataManager) {
        return dataManager.executeLocal(this);
      }
      return DataUtil.throwError('Query - executeLocal() : dataManager needs to be is set using "using" function or should be passed as argument');
    };
    Query2.prototype.clone = function() {
      var cloned = new Query2();
      cloned.queries = this.queries.slice(0);
      cloned.key = this.key;
      cloned.isChild = this.isChild;
      cloned.dataManager = this.dataManager;
      cloned.fromTable = this.fromTable;
      cloned.params = this.params.slice(0);
      cloned.expands = this.expands.slice(0);
      cloned.sortedColumns = this.sortedColumns.slice(0);
      cloned.groupedColumns = this.groupedColumns.slice(0);
      cloned.subQuerySelector = this.subQuerySelector;
      cloned.subQuery = this.subQuery;
      cloned.fKey = this.fKey;
      cloned.isCountRequired = this.isCountRequired;
      cloned.distincts = this.distincts.slice(0);
      cloned.lazyLoad = this.lazyLoad.slice(0);
      return cloned;
    };
    Query2.prototype.from = function(tableName) {
      this.fromTable = tableName;
      return this;
    };
    Query2.prototype.addParams = function(key, value) {
      if (typeof value === "function") {
        this.params.push({ key, fn: value });
      } else {
        this.params.push({ key, value });
      }
      return this;
    };
    Query2.prototype.distinct = function(fields) {
      if (typeof fields === "string") {
        this.distincts = [].slice.call([fields], 0);
      } else {
        this.distincts = fields.slice(0);
      }
      return this;
    };
    Query2.prototype.expand = function(tables) {
      if (typeof tables === "string") {
        this.expands = [].slice.call([tables], 0);
      } else {
        this.expands = tables.slice(0);
      }
      return this;
    };
    Query2.prototype.where = function(fieldName, operator, value, ignoreCase, ignoreAccent, matchCase) {
      operator = operator ? operator.toLowerCase() : null;
      var predicate = null;
      if (typeof fieldName === "string") {
        predicate = new Predicate(fieldName, operator, value, ignoreCase, ignoreAccent, matchCase);
      } else if (fieldName instanceof Predicate) {
        predicate = fieldName;
      }
      this.queries.push({
        fn: "onWhere",
        e: predicate
      });
      return this;
    };
    Query2.prototype.search = function(searchKey, fieldNames, operator, ignoreCase, ignoreAccent) {
      if (typeof fieldNames === "string") {
        fieldNames = [fieldNames];
      }
      if (!operator || operator === "none") {
        operator = "contains";
      }
      var comparer = DataUtil.fnOperators[operator];
      this.queries.push({
        fn: "onSearch",
        e: {
          fieldNames,
          operator,
          searchKey,
          ignoreCase,
          ignoreAccent,
          comparer
        }
      });
      return this;
    };
    Query2.prototype.sortBy = function(fieldName, comparer, isFromGroup) {
      return this.sortByForeignKey(fieldName, comparer, isFromGroup);
    };
    Query2.prototype.sortByForeignKey = function(fieldName, comparer, isFromGroup, direction) {
      var order = !isNullOrUndefined(direction) ? direction : "ascending";
      var sorts;
      var temp;
      if (typeof fieldName === "string" && DataUtil.endsWith(fieldName.toLowerCase(), " desc")) {
        fieldName = fieldName.replace(/ desc$/i, "");
        comparer = "descending";
      }
      if (!comparer || typeof comparer === "string") {
        order = comparer ? comparer.toLowerCase() : "ascending";
        comparer = DataUtil.fnSort(comparer);
      }
      if (isFromGroup) {
        sorts = Query2.filterQueries(this.queries, "onSortBy");
        for (var i = 0; i < sorts.length; i++) {
          temp = sorts[i].e.fieldName;
          if (typeof temp === "string") {
            if (temp === fieldName) {
              return this;
            }
          } else if (temp instanceof Array) {
            for (var j = 0; j < temp.length; j++) {
              if (temp[j] === fieldName || fieldName.toLowerCase() === temp[j] + " desc") {
                return this;
              }
            }
          }
        }
      }
      this.queries.push({
        fn: "onSortBy",
        e: {
          fieldName,
          comparer,
          direction: order
        }
      });
      return this;
    };
    Query2.prototype.sortByDesc = function(fieldName) {
      return this.sortBy(fieldName, "descending");
    };
    Query2.prototype.group = function(fieldName, fn, format) {
      this.sortBy(fieldName, null, true);
      this.queries.push({
        fn: "onGroup",
        e: {
          fieldName,
          comparer: fn ? fn : null,
          format: format ? format : null
        }
      });
      return this;
    };
    Query2.prototype.page = function(pageIndex, pageSize) {
      this.queries.push({
        fn: "onPage",
        e: {
          pageIndex,
          pageSize
        }
      });
      return this;
    };
    Query2.prototype.range = function(start, end) {
      this.queries.push({
        fn: "onRange",
        e: {
          start,
          end
        }
      });
      return this;
    };
    Query2.prototype.take = function(nos) {
      this.queries.push({
        fn: "onTake",
        e: {
          nos
        }
      });
      return this;
    };
    Query2.prototype.skip = function(nos) {
      this.queries.push({
        fn: "onSkip",
        e: { nos }
      });
      return this;
    };
    Query2.prototype.select = function(fieldNames) {
      if (typeof fieldNames === "string") {
        fieldNames = [].slice.call([fieldNames], 0);
      }
      this.queries.push({
        fn: "onSelect",
        e: { fieldNames }
      });
      return this;
    };
    Query2.prototype.hierarchy = function(query, selectorFn) {
      this.subQuerySelector = selectorFn;
      this.subQuery = query;
      return this;
    };
    Query2.prototype.foreignKey = function(key) {
      this.fKey = key;
      return this;
    };
    Query2.prototype.requiresCount = function() {
      this.isCountRequired = true;
      return this;
    };
    Query2.prototype.aggregate = function(type, field) {
      this.queries.push({
        fn: "onAggregates",
        e: { field, type }
      });
      return this;
    };
    Query2.filterQueries = function(queries, name) {
      return queries.filter(function(q) {
        return q.fn === name;
      });
    };
    Query2.filterQueryLists = function(queries, singles) {
      var filtered = queries.filter(function(q) {
        return singles.indexOf(q.fn) !== -1;
      });
      var res = {};
      for (var i = 0; i < filtered.length; i++) {
        if (!res[filtered[i].fn]) {
          res[filtered[i].fn] = filtered[i].e;
        }
      }
      return res;
    };
    return Query2;
  })()
);
var Predicate = (
  /** @class */
  (function() {
    function Predicate2(field, operator, value, ignoreCase, ignoreAccent, matchCase) {
      if (ignoreCase === void 0) {
        ignoreCase = false;
      }
      this.ignoreAccent = false;
      this.isComplex = false;
      if (typeof field === "string") {
        this.field = field;
        this.operator = operator.toLowerCase();
        this.value = value;
        this.matchCase = matchCase;
        this.ignoreCase = ignoreCase;
        this.ignoreAccent = ignoreAccent;
        this.isComplex = false;
        this.comparer = DataUtil.fnOperators.processOperator(this.operator);
      } else if (field instanceof Predicate2 && value instanceof Predicate2 || value instanceof Array) {
        this.isComplex = true;
        this.condition = operator.toLowerCase();
        this.predicates = [field];
        this.matchCase = field.matchCase;
        this.ignoreCase = field.ignoreCase;
        this.ignoreAccent = field.ignoreAccent;
        if (value instanceof Array) {
          [].push.apply(this.predicates, value);
        } else {
          this.predicates.push(value);
        }
      }
      return this;
    }
    Predicate2.and = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return Predicate2.combinePredicates([].slice.call(args, 0), "and");
    };
    Predicate2.prototype.and = function(field, operator, value, ignoreCase, ignoreAccent) {
      return Predicate2.combine(this, field, operator, value, "and", ignoreCase, ignoreAccent);
    };
    Predicate2.or = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return Predicate2.combinePredicates([].slice.call(args, 0), "or");
    };
    Predicate2.prototype.or = function(field, operator, value, ignoreCase, ignoreAccent) {
      return Predicate2.combine(this, field, operator, value, "or", ignoreCase, ignoreAccent);
    };
    Predicate2.ornot = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return Predicate2.combinePredicates([].slice.call(args, 0), "or not");
    };
    Predicate2.prototype.ornot = function(field, operator, value, ignoreCase, ignoreAccent) {
      return Predicate2.combine(this, field, operator, value, "ornot", ignoreCase, ignoreAccent);
    };
    Predicate2.andnot = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return Predicate2.combinePredicates([].slice.call(args, 0), "and not");
    };
    Predicate2.prototype.andnot = function(field, operator, value, ignoreCase, ignoreAccent) {
      return Predicate2.combine(this, field, operator, value, "andnot", ignoreCase, ignoreAccent);
    };
    Predicate2.fromJson = function(json) {
      if (json instanceof Array) {
        var res = [];
        for (var i = 0, len = json.length; i < len; i++) {
          res.push(this.fromJSONData(json[i]));
        }
        return res;
      }
      var pred = json;
      return this.fromJSONData(pred);
    };
    Predicate2.prototype.validate = function(record) {
      var predicate = this.predicates ? this.predicates : [];
      var ret;
      var isAnd;
      if (!this.isComplex && this.comparer) {
        if (this.condition && this.condition.indexOf("not") !== -1) {
          this.condition = this.condition.split("not")[0] === "" ? void 0 : this.condition.split("not")[0];
          return !this.comparer.call(this, DataUtil.getObject(this.field, record), this.value, this.ignoreCase, this.ignoreAccent);
        } else {
          return this.comparer.call(this, DataUtil.getObject(this.field, record), this.value, this.ignoreCase, this.ignoreAccent);
        }
      }
      if (this.condition && this.condition.indexOf("not") !== -1) {
        isAnd = this.condition.indexOf("and") !== -1;
      } else {
        isAnd = this.condition === "and";
      }
      for (var i = 0; i < predicate.length; i++) {
        if (i > 0 && this.condition && this.condition.indexOf("not") !== -1) {
          predicate[i].condition = predicate[i].condition ? predicate[i].condition + "not" : "not";
        }
        ret = predicate[i].validate(record);
        if (isAnd) {
          if (!ret) {
            return false;
          }
        } else {
          if (ret) {
            return true;
          }
        }
      }
      return isAnd;
    };
    Predicate2.prototype.toJson = function() {
      var predicates;
      var p;
      if (this.isComplex) {
        predicates = [];
        p = this.predicates;
        for (var i = 0; i < p.length; i++) {
          predicates.push(p[i].toJson());
        }
      }
      return {
        isComplex: this.isComplex,
        field: this.field,
        operator: this.operator,
        value: this.value,
        ignoreCase: this.ignoreCase,
        ignoreAccent: this.ignoreAccent,
        condition: this.condition,
        predicates,
        matchCase: this.matchCase
      };
    };
    Predicate2.combinePredicates = function(predicates, operator) {
      if (predicates.length === 1) {
        if (!(predicates[0] instanceof Array)) {
          return predicates[0];
        }
        predicates = predicates[0];
      }
      return new Predicate2(predicates[0], operator, predicates.slice(1));
    };
    Predicate2.combine = function(pred, field, operator, value, condition, ignoreCase, ignoreAccent) {
      if (field instanceof Predicate2) {
        return Predicate2[condition](pred, field);
      }
      if (typeof field === "string") {
        return Predicate2[condition](pred, new Predicate2(field, operator, value, ignoreCase, ignoreAccent));
      }
      return DataUtil.throwError("Predicate - " + condition + " : invalid arguments");
    };
    Predicate2.fromJSONData = function(json) {
      var preds = json.predicates || [];
      var len = preds.length;
      var predicates = [];
      var result;
      for (var i = 0; i < len; i++) {
        predicates.push(this.fromJSONData(preds[i]));
      }
      if (!json.isComplex) {
        result = new Predicate2(json.field, json.operator, json.value, json.ignoreCase, json.ignoreAccent);
      } else {
        result = new Predicate2(predicates[0], json.condition, predicates.slice(1));
      }
      return result;
    };
    return Predicate2;
  })()
);

// node_modules/@syncfusion/ej2-lists/src/common/list-base.js
var cssClass = {
  li: "e-list-item",
  ul: "e-list-parent e-ul",
  group: "e-list-group-item",
  icon: "e-list-icon",
  text: "e-list-text",
  check: "e-list-check",
  checked: "e-checked",
  selected: "e-selected",
  expanded: "e-expanded",
  textContent: "e-text-content",
  hasChild: "e-has-child",
  level: "e-level",
  url: "e-list-url",
  collapsible: "e-icon-collapsible",
  disabled: "e-disabled",
  image: "e-list-img",
  iconWrapper: "e-icon-wrapper",
  anchorWrap: "e-anchor-wrap",
  navigable: "e-navigable"
};
var ListBase;
(function(ListBase2) {
  ListBase2.defaultMappedFields = {
    id: "id",
    text: "text",
    url: "url",
    value: "value",
    isChecked: "isChecked",
    enabled: "enabled",
    expanded: "expanded",
    selected: "selected",
    iconCss: "iconCss",
    child: "child",
    isVisible: "isVisible",
    hasChildren: "hasChildren",
    tooltip: "tooltip",
    htmlAttributes: "htmlAttributes",
    urlAttributes: "urlAttributes",
    imageAttributes: "imageAttributes",
    imageUrl: "imageUrl",
    groupBy: null,
    sortBy: null
  };
  var defaultAriaAttributes = {
    level: 1,
    listRole: "presentation",
    itemRole: "presentation",
    groupItemRole: "group",
    itemText: "list-item",
    wrapperRole: "presentation"
  };
  var defaultListBaseOptions = {
    showCheckBox: false,
    showIcon: false,
    enableHtmlSanitizer: false,
    expandCollapse: false,
    fields: ListBase2.defaultMappedFields,
    ariaAttributes: defaultAriaAttributes,
    listClass: "",
    itemClass: "",
    processSubChild: false,
    sortOrder: "None",
    template: null,
    groupTemplate: null,
    headerTemplate: null,
    expandIconClass: "e-icon-collapsible",
    moduleName: "list",
    expandIconPosition: "Right",
    itemNavigable: false
  };
  function createList(createElement, dataSource, options, isSingleLevel, componentInstance) {
    var curOpt = extend({}, defaultListBaseOptions, options);
    var ariaAttributes = extend({}, defaultAriaAttributes, curOpt.ariaAttributes);
    var type = typeofData(dataSource).typeof;
    if (type === "string" || type === "number") {
      return createListFromArray(createElement, dataSource, isSingleLevel, options, componentInstance);
    } else {
      return createListFromJson(createElement, dataSource, options, ariaAttributes.level, isSingleLevel, componentInstance);
    }
  }
  ListBase2.createList = createList;
  function createListFromArray(createElement, dataSource, isSingleLevel, options, componentInstance) {
    var subChild = createListItemFromArray(createElement, dataSource, isSingleLevel, options, componentInstance);
    return generateUL(createElement, subChild, null, options);
  }
  ListBase2.createListFromArray = createListFromArray;
  function createListItemFromArray(createElement, dataSource, isSingleLevel, options, componentInstance) {
    var subChild = [];
    var curOpt = extend({}, defaultListBaseOptions, options);
    cssClass = getModuleClass(curOpt.moduleName);
    var id = generateId();
    for (var i = 0; i < dataSource.length; i++) {
      if (isNullOrUndefined(dataSource[i])) {
        continue;
      }
      var li = void 0;
      if (curOpt.itemCreating && typeof curOpt.itemCreating === "function") {
        var curData = {
          dataSource,
          curData: dataSource[i],
          text: dataSource[i],
          options: curOpt
        };
        curOpt.itemCreating(curData);
      }
      if (isSingleLevel) {
        li = generateSingleLevelLI(createElement, dataSource[i], void 0, null, null, [], null, id, i, options);
      } else {
        li = generateLI(createElement, dataSource[i], void 0, null, null, options, componentInstance);
      }
      if (curOpt.itemCreated && typeof curOpt.itemCreated === "function") {
        var curData = {
          dataSource,
          curData: dataSource[i],
          text: dataSource[i],
          item: li,
          options: curOpt
        };
        curOpt.itemCreated(curData);
      }
      subChild.push(li);
    }
    return subChild;
  }
  ListBase2.createListItemFromArray = createListItemFromArray;
  function createListItemFromJson(createElement, dataSource, options, level, isSingleLevel, componentInstance) {
    var curOpt = extend({}, defaultListBaseOptions, options);
    cssClass = getModuleClass(curOpt.moduleName);
    var fields = componentInstance && (componentInstance.getModuleName() === "listview" || componentInstance.getModuleName() === "multiselect") ? curOpt.fields : extend({}, ListBase2.defaultMappedFields, curOpt.fields);
    var ariaAttributes = extend({}, defaultAriaAttributes, curOpt.ariaAttributes);
    var id;
    var checkboxElement = [];
    if (level) {
      ariaAttributes.level = level;
    }
    var child = [];
    var li;
    var anchorElement;
    if (dataSource && dataSource.length && !isNullOrUndefined(typeofData(dataSource).item) && !Object.prototype.hasOwnProperty.call(typeofData(dataSource).item, fields.id)) {
      id = generateId();
    }
    for (var i = 0; i < dataSource.length; i++) {
      var fieldData = getFieldValues(dataSource[i], fields);
      if (isNullOrUndefined(dataSource[i])) {
        continue;
      }
      if (curOpt.itemCreating && typeof curOpt.itemCreating === "function") {
        var curData = {
          dataSource,
          curData: dataSource[i],
          text: fieldData[fields.text],
          options: curOpt,
          fields
        };
        curOpt.itemCreating(curData);
      }
      var curItem = dataSource[i];
      if (curOpt.itemCreating && typeof curOpt.itemCreating === "function") {
        fieldData = getFieldValues(dataSource[i], fields);
      }
      if (Object.prototype.hasOwnProperty.call(fieldData, fields.id) && !isNullOrUndefined(fieldData[fields.id])) {
        id = fieldData[fields.id];
      }
      var innerEle = [];
      if (curOpt.showCheckBox) {
        if (curOpt.itemNavigable && (fieldData[fields.url] || fieldData[fields.urlAttributes])) {
          checkboxElement.push(createElement("input", { className: cssClass.check, attrs: { type: "checkbox" } }));
        } else {
          innerEle.push(createElement("input", { className: cssClass.check, attrs: { type: "checkbox" } }));
        }
      }
      if (isSingleLevel === true) {
        if (curOpt.showIcon && Object.prototype.hasOwnProperty.call(fieldData, fields.iconCss) && !isNullOrUndefined(fieldData[fields.iconCss])) {
          innerEle.push(createElement("span", { className: cssClass.icon + " " + fieldData[fields.iconCss] }));
        }
        li = generateSingleLevelLI(createElement, curItem, fieldData, fields, curOpt.itemClass, innerEle, Object.prototype.hasOwnProperty.call(curItem, "isHeader") && curItem.isHeader ? true : false, id, i, options);
        anchorElement = li.querySelector("." + cssClass.anchorWrap);
        if (Object.prototype.hasOwnProperty.call(fieldData, fields.tooltip)) {
          var tooltipText = fieldData[fields.tooltip];
          if (options && options.enableHtmlSanitizer) {
            tooltipText = SanitizeHtmlHelper.sanitize(tooltipText);
          } else {
            var tooltipTextElement = createElement("span", { innerHTML: tooltipText });
            tooltipText = tooltipTextElement.innerText;
            tooltipTextElement = null;
          }
          li.setAttribute("title", tooltipText);
        }
        if (curOpt.itemNavigable && checkboxElement.length) {
          prepend(checkboxElement, li.firstElementChild);
        }
      } else {
        li = generateLI(createElement, curItem, fieldData, fields, curOpt.itemClass, options, componentInstance);
        li.classList.add(cssClass.level + "-" + ariaAttributes.level);
        li.setAttribute("aria-level", ariaAttributes.level.toString());
        if (ariaAttributes.groupItemRole === "presentation" || ariaAttributes.itemRole === "presentation") {
          li.removeAttribute("aria-level");
        }
        anchorElement = li.querySelector("." + cssClass.anchorWrap);
        if (Object.prototype.hasOwnProperty.call(fieldData, fields.tooltip)) {
          var tooltipText = fieldData[fields.tooltip];
          if (options && options.enableHtmlSanitizer) {
            tooltipText = SanitizeHtmlHelper.sanitize(tooltipText);
          } else {
            var tooltipTextElement = createElement("span", { innerHTML: tooltipText });
            tooltipText = tooltipTextElement.innerText;
            tooltipTextElement = null;
          }
          li.setAttribute("title", tooltipText);
        }
        if (Object.prototype.hasOwnProperty.call(fieldData, fields.htmlAttributes) && fieldData[fields.htmlAttributes]) {
          var htmlAttributes = fieldData[fields.htmlAttributes];
          if ("class" in htmlAttributes && typeof htmlAttributes["class"] === "string" && htmlAttributes["class"].trim() === "") {
            delete htmlAttributes["class"];
          }
          setAttribute(li, htmlAttributes);
        }
        if (Object.prototype.hasOwnProperty.call(fieldData, fields.enabled) && fieldData[fields.enabled] === false) {
          li.classList.add(cssClass.disabled);
        }
        if (Object.prototype.hasOwnProperty.call(fieldData, fields.isVisible) && fieldData[fields.isVisible] === false) {
          li.style.display = "none";
        }
        if (Object.prototype.hasOwnProperty.call(fieldData, fields.imageUrl) && !isNullOrUndefined(fieldData[fields.imageUrl]) && !curOpt.template) {
          var attr = { src: fieldData[fields.imageUrl], alt: !isNullOrUndefined(fieldData.name) ? "Displaying " + fieldData.name + " Image" : "Displaying Image" };
          merge(attr, fieldData[fields.imageAttributes]);
          var imageElemnt = createElement("img", { className: cssClass.image, attrs: attr });
          if (anchorElement) {
            anchorElement.insertAdjacentElement("afterbegin", imageElemnt);
          } else {
            prepend([imageElemnt], li.firstElementChild);
          }
        }
        if (curOpt.showIcon && Object.prototype.hasOwnProperty.call(fieldData, fields.iconCss) && !isNullOrUndefined(fieldData[fields.iconCss]) && !curOpt.template) {
          var iconElement = createElement("div", { className: cssClass.icon + " " + fieldData[fields.iconCss] });
          if (anchorElement) {
            anchorElement.insertAdjacentElement("afterbegin", iconElement);
          } else {
            prepend([iconElement], li.firstElementChild);
          }
        }
        if (innerEle.length) {
          prepend(innerEle, li.firstElementChild);
        }
        if (curOpt.itemNavigable && checkboxElement.length) {
          prepend(checkboxElement, li.firstElementChild);
        }
        processSubChild(createElement, fieldData, fields, dataSource, curOpt, li, ariaAttributes.level);
      }
      if (anchorElement) {
        addClass([li], [cssClass.navigable]);
      }
      if (curOpt.itemCreated && typeof curOpt.itemCreated === "function") {
        var curData = {
          dataSource,
          curData: dataSource[i],
          text: fieldData[fields.text],
          item: li,
          options: curOpt,
          fields
        };
        curOpt.itemCreated(curData);
      }
      checkboxElement = [];
      child.push(li);
    }
    return child;
  }
  ListBase2.createListItemFromJson = createListItemFromJson;
  function createListFromJson(createElement, dataSource, options, level, isSingleLevel, componentInstance) {
    var curOpt = extend({}, defaultListBaseOptions, options);
    var li = createListItemFromJson(createElement, dataSource, options, level, isSingleLevel, componentInstance);
    return generateUL(createElement, li, curOpt.listClass, options);
  }
  ListBase2.createListFromJson = createListFromJson;
  function getSiblingLI(elementArray, element, isPrevious) {
    cssClass = getModuleClass(defaultListBaseOptions.moduleName);
    if (!elementArray || !elementArray.length) {
      return void 0;
    }
    var siblingLI;
    var liIndex;
    var liCollections = Array.prototype.slice.call(elementArray);
    if (element) {
      liIndex = indexOf(element, liCollections);
    } else {
      liIndex = isPrevious === true ? liCollections.length : -1;
    }
    siblingLI = liCollections[liIndex + (isPrevious === true ? -1 : 1)];
    while (siblingLI && (!isVisible(siblingLI) || siblingLI.classList.contains(cssClass.disabled))) {
      liIndex = liIndex + (isPrevious === true ? -1 : 1);
      siblingLI = liCollections[liIndex];
    }
    return siblingLI;
  }
  ListBase2.getSiblingLI = getSiblingLI;
  function indexOf(item, elementArray) {
    if (!elementArray || !item) {
      return void 0;
    } else {
      var liCollections = elementArray;
      liCollections = Array.prototype.slice.call(elementArray);
      return liCollections.indexOf(item);
    }
  }
  ListBase2.indexOf = indexOf;
  function groupDataSource(dataSource, fields, sortOrder) {
    if (sortOrder === void 0) {
      sortOrder = "None";
    }
    var curFields = extend({}, ListBase2.defaultMappedFields, fields);
    var cusQuery = new Query().group(curFields.groupBy);
    cusQuery = addSorting(sortOrder, "key", cusQuery);
    var ds = getDataSource(dataSource, cusQuery);
    dataSource = [];
    for (var j = 0; j < ds.length; j++) {
      var itemObj = ds[j].items;
      var grpItem = {};
      var hdr = "isHeader";
      grpItem[curFields.text] = ds[j].key;
      grpItem["" + hdr] = true;
      var newtext = curFields.text;
      if (newtext === "id") {
        newtext = "text";
        grpItem["" + newtext] = ds[j].key;
      }
      grpItem._id = "group-list-item-" + (ds[j].key ? ds[j].key.toString().trim() : "undefined");
      grpItem.items = itemObj;
      dataSource.push(grpItem);
      for (var k = 0; k < itemObj.length; k++) {
        dataSource.push(itemObj[k]);
      }
    }
    return dataSource;
  }
  ListBase2.groupDataSource = groupDataSource;
  function addSorting(sortOrder, sortBy, query) {
    if (query === void 0) {
      query = new Query();
    }
    if (sortOrder === "Ascending") {
      query.sortBy(sortBy, "ascending", true);
    } else if (sortOrder === "Descending") {
      query.sortBy(sortBy, "descending", true);
    } else {
      for (var i = 0; i < query.queries.length; i++) {
        if (query.queries[i].fn === "onSortBy") {
          query.queries.splice(i, 1);
        }
      }
    }
    return query;
  }
  ListBase2.addSorting = addSorting;
  function getDataSource(dataSource, query) {
    return new DataManager(dataSource).executeLocal(query);
  }
  ListBase2.getDataSource = getDataSource;
  function createJsonFromElement(element, options) {
    var curOpt = extend({}, defaultListBaseOptions, options);
    var fields = extend({}, ListBase2.defaultMappedFields, curOpt.fields);
    var curEle = element.cloneNode(true);
    var jsonAr = [];
    curEle.classList.add("json-parent");
    var childs = curEle.querySelectorAll(".json-parent>li");
    curEle.classList.remove("json-parent");
    for (var i = 0; i < childs.length; i++) {
      var li = childs[i];
      var anchor = li.querySelector("a");
      var ul = li.querySelector("ul");
      var json = {};
      var childNodes = anchor ? anchor.childNodes : li.childNodes;
      var keys = Object.keys(childNodes);
      for (var i_1 = 0; i_1 < childNodes.length; i_1++) {
        if (!childNodes[Number(keys[i_1])].hasChildNodes()) {
          json[fields.text] = childNodes[Number(keys[i_1])].textContent;
        }
      }
      var attributes_1 = getAllAttributes(li);
      if (attributes_1.id) {
        json[fields.id] = attributes_1.id;
        delete attributes_1.id;
      } else {
        json[fields.id] = generateId();
      }
      if (Object.keys(attributes_1).length) {
        json[fields.htmlAttributes] = attributes_1;
      }
      if (anchor) {
        attributes_1 = getAllAttributes(anchor);
        if (Object.keys(attributes_1).length) {
          json[fields.urlAttributes] = attributes_1;
        }
      }
      if (ul) {
        json[fields.child] = createJsonFromElement(ul, options);
      }
      jsonAr.push(json);
    }
    return jsonAr;
  }
  ListBase2.createJsonFromElement = createJsonFromElement;
  function typeofData(data) {
    var match = { typeof: null, item: null };
    for (var i = 0; i < data.length; i++) {
      if (!isNullOrUndefined(data[i])) {
        return match = { typeof: typeof data[i], item: data[i] };
      }
    }
    return match;
  }
  function setAttribute(element, elementAttributes) {
    var attr = {};
    merge(attr, elementAttributes);
    if (attr.class) {
      addClass([element], attr.class.split(" "));
      delete attr.class;
    }
    attributes(element, attr);
  }
  function getAllAttributes(element) {
    var attributes2 = {};
    var attr = element.attributes;
    for (var index = 0; index < attr.length; index++) {
      attributes2[attr[index].nodeName] = attr[index].nodeValue;
    }
    return attributes2;
  }
  function renderContentTemplate(createElement, template, dataSource, fields, options, componentInstance) {
    cssClass = getModuleClass(defaultListBaseOptions.moduleName);
    var ulElement = createElement("ul", { className: cssClass.ul, attrs: { role: "presentation" } });
    var curOpt = extend({}, defaultListBaseOptions, options);
    var curFields = extend({}, ListBase2.defaultMappedFields, fields);
    var compiledString = compileTemplate(template);
    var liCollection = [];
    var value;
    var id = generateId();
    for (var i = 0; i < dataSource.length; i++) {
      var fieldData = getFieldValues(dataSource[i], curFields);
      var curItem = dataSource[i];
      var isHeader = curItem.isHeader;
      if (typeof dataSource[i] === "string" || typeof dataSource[i] === "number") {
        value = curItem;
      } else {
        value = fieldData[curFields.value];
      }
      if (curOpt.itemCreating && typeof curOpt.itemCreating === "function") {
        var curData = {
          dataSource,
          curData: curItem,
          text: value,
          options: curOpt,
          fields: curFields
        };
        curOpt.itemCreating(curData);
      }
      if (curOpt.itemCreating && typeof curOpt.itemCreating === "function") {
        fieldData = getFieldValues(dataSource[i], curFields);
        if (typeof dataSource[i] === "string" || typeof dataSource[i] === "number") {
          value = curItem;
        } else {
          value = fieldData[curFields.value];
        }
      }
      var li = createElement("li", {
        id: id + "-" + i,
        className: isHeader ? cssClass.group : cssClass.li,
        attrs: { role: "presentation" }
      });
      if (isHeader) {
        if (typeof dataSource[i] === "string" || typeof dataSource[i] === "number") {
          li.innerText = curItem;
        } else {
          li.innerText = fieldData[curFields.text];
        }
      } else {
        var currentID = isHeader ? curOpt.groupTemplateID : curOpt.templateID;
        if (isHeader) {
          if (componentInstance && componentInstance.getModuleName() !== "listview") {
            var compiledElement = compiledString(curItem, componentInstance, "headerTemplate", currentID, !!curOpt.isStringTemplate, null, li);
            if (compiledElement) {
              append(compiledElement, li);
            }
          } else {
            append(compiledString(curItem, componentInstance, "headerTemplate", currentID, !!curOpt.isStringTemplate), li);
          }
        } else {
          if (componentInstance && componentInstance.getModuleName() !== "listview") {
            var compiledElement = compiledString(curItem, componentInstance, "template", currentID, !!curOpt.isStringTemplate, null, li);
            if (compiledElement) {
              append(compiledElement, li);
            }
          } else {
            append(compiledString(curItem, componentInstance, "template", currentID, !!curOpt.isStringTemplate), li);
          }
        }
        li.setAttribute("data-value", isNullOrUndefined(value) ? "null" : value);
        li.setAttribute("role", "option");
      }
      if (curOpt.itemCreated && typeof curOpt.itemCreated === "function") {
        var curData = {
          dataSource,
          curData: curItem,
          text: value,
          item: li,
          options: curOpt,
          fields: curFields
        };
        curOpt.itemCreated(curData);
      }
      liCollection.push(li);
    }
    append(liCollection, ulElement);
    return ulElement;
  }
  ListBase2.renderContentTemplate = renderContentTemplate;
  function renderGroupTemplate(groupTemplate, groupDataSource2, fields, headerItems, options, componentInstance) {
    var compiledString = compileTemplate(groupTemplate);
    var curFields = extend({}, ListBase2.defaultMappedFields, fields);
    var curOpt = extend({}, defaultListBaseOptions, options);
    var category = curFields.groupBy;
    for (var _i = 0, headerItems_1 = headerItems; _i < headerItems_1.length; _i++) {
      var header = headerItems_1[_i];
      var headerData = {};
      headerData["" + category] = header.textContent;
      header.innerHTML = "";
      if (componentInstance && componentInstance.getModuleName() !== "listview") {
        var compiledElement = compiledString(headerData, componentInstance, "groupTemplate", curOpt.groupTemplateID, !!curOpt.isStringTemplate, null, header);
        if (compiledElement) {
          append(compiledElement, header);
        }
      } else {
        append(compiledString(headerData, componentInstance, "groupTemplate", curOpt.groupTemplateID, !!curOpt.isStringTemplate), header);
      }
    }
    return headerItems;
  }
  ListBase2.renderGroupTemplate = renderGroupTemplate;
  function generateId() {
    return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
  }
  ListBase2.generateId = generateId;
  function processSubChild(createElement, fieldData, fields, ds, options, element, level) {
    var subDS = fieldData[fields.child] || [];
    var hasChildren = fieldData[fields.hasChildren];
    if (subDS.length) {
      hasChildren = true;
      element.classList.add(cssClass.hasChild);
      if (options.processSubChild) {
        var subLi = createListFromJson(createElement, subDS, options, ++level);
        element.appendChild(subLi);
      }
    }
    if (!!options.expandCollapse && hasChildren && !options.template) {
      element.firstElementChild.classList.add(cssClass.iconWrapper);
      var expandElement = options.expandIconPosition === "Left" ? prepend : append;
      expandElement([createElement("div", { className: "e-icons " + options.expandIconClass })], element.querySelector("." + cssClass.textContent));
    }
  }
  function generateSingleLevelLI(createElement, item, fieldData, fields, className, innerElements, grpLI, id, index, options) {
    var curOpt = extend({}, defaultListBaseOptions, options);
    var ariaAttributes = extend({}, defaultAriaAttributes, curOpt.ariaAttributes);
    var text = item;
    var value = item;
    var dataSource;
    if (typeof item !== "string" && typeof item !== "number" && typeof item !== "boolean") {
      dataSource = item;
      text = typeof fieldData[fields.text] === "boolean" || typeof fieldData[fields.text] === "number" ? fieldData[fields.text] : fieldData[fields.text] || "";
      value = fieldData[fields.value];
    }
    var elementID;
    if (!isNullOrUndefined(dataSource) && !isNullOrUndefined(fieldData[fields.id]) && fieldData[fields.id] !== "") {
      elementID = id;
    } else {
      elementID = id + "-" + index;
    }
    var li = createElement("li", {
      className: (grpLI === true ? cssClass.group : cssClass.li) + " " + (isNullOrUndefined(className) ? "" : className),
      id: elementID,
      attrs: ariaAttributes.groupItemRole !== "" && ariaAttributes.itemRole !== "" ? { role: grpLI === true ? ariaAttributes.groupItemRole : ariaAttributes.itemRole } : {}
    });
    if (dataSource && Object.prototype.hasOwnProperty.call(fieldData, fields.enabled) && fieldData[fields.enabled].toString() === "false") {
      li.classList.add(cssClass.disabled);
    }
    if (options && options.enableHtmlSanitizer) {
      text = SanitizeHtmlHelper.sanitize(text);
    }
    if (grpLI) {
      li.innerText = text;
    } else {
      li.setAttribute("data-value", isNullOrUndefined(value) ? "null" : value);
      li.setAttribute("role", "option");
      if (dataSource && Object.prototype.hasOwnProperty.call(fieldData, fields.htmlAttributes) && fieldData[fields.htmlAttributes]) {
        setAttribute(li, fieldData[fields.htmlAttributes]);
      }
      if (innerElements.length && !curOpt.itemNavigable) {
        append(innerElements, li);
      }
      if (dataSource && (fieldData[fields.url] || fieldData[fields.urlAttributes] && fieldData[fields.urlAttributes].href)) {
        li.appendChild(anchorTag(createElement, dataSource, fields, text, innerElements, curOpt.itemNavigable));
      } else {
        if (innerElements.length && curOpt.itemNavigable) {
          append(innerElements, li);
        }
        li.appendChild(document.createTextNode(text));
      }
    }
    return li;
  }
  function getModuleClass(moduleName) {
    var moduleClass;
    return moduleClass = {
      li: "e-" + moduleName + "-item",
      ul: "e-" + moduleName + "-parent e-ul",
      group: "e-" + moduleName + "-group-item",
      icon: "e-" + moduleName + "-icon",
      text: "e-" + moduleName + "-text",
      check: "e-" + moduleName + "-check",
      checked: "e-checked",
      selected: "e-selected",
      expanded: "e-expanded",
      textContent: "e-text-content",
      hasChild: "e-has-child",
      level: "e-level",
      url: "e-" + moduleName + "-url",
      collapsible: "e-icon-collapsible",
      disabled: "e-disabled",
      image: "e-" + moduleName + "-img",
      iconWrapper: "e-icon-wrapper",
      anchorWrap: "e-anchor-wrap",
      navigable: "e-navigable"
    };
  }
  function anchorTag(createElement, dataSource, fields, text, innerElements, isFullNavigation) {
    var fieldData = getFieldValues(dataSource, fields);
    var attr = { href: fieldData[fields.url] };
    if (Object.prototype.hasOwnProperty.call(fieldData, fields.urlAttributes) && fieldData[fields.urlAttributes]) {
      merge(attr, fieldData[fields.urlAttributes]);
      attr.href = fieldData[fields.url] ? fieldData[fields.url] : fieldData[fields.urlAttributes].href;
    }
    var anchorTag2;
    if (!isFullNavigation) {
      anchorTag2 = createElement("a", { className: cssClass.text + " " + cssClass.url, innerHTML: text });
    } else {
      anchorTag2 = createElement("a", { className: cssClass.text + " " + cssClass.url });
      var anchorWrapper = createElement("div", { className: cssClass.anchorWrap });
      if (innerElements && innerElements.length) {
        append(innerElements, anchorWrapper);
      }
      anchorWrapper.appendChild(document.createTextNode(text));
      append([anchorWrapper], anchorTag2);
    }
    setAttribute(anchorTag2, attr);
    return anchorTag2;
  }
  function generateLI(createElement, item, fieldData, fields, className, options, componentInstance) {
    var curOpt = extend({}, defaultListBaseOptions, options);
    var ariaAttributes = extend({}, defaultAriaAttributes, curOpt.ariaAttributes);
    var text = item;
    var uID;
    var grpLI;
    var dataSource;
    if (typeof item !== "string" && typeof item !== "number") {
      dataSource = item;
      text = fieldData[fields.text] || "";
      uID = isNullOrUndefined(fieldData["_id"]) ? fieldData[fields.id] : fieldData["_id"];
      grpLI = Object.prototype.hasOwnProperty.call(item, "isHeader") && item.isHeader ? true : false;
    }
    if (options && options.enableHtmlSanitizer) {
      text = SanitizeHtmlHelper.sanitize(text);
    }
    var li = createElement("li", {
      className: (grpLI === true ? cssClass.group : cssClass.li) + " " + (isNullOrUndefined(className) ? "" : className),
      attrs: ariaAttributes.groupItemRole !== "" && ariaAttributes.itemRole !== "" ? { role: grpLI === true ? ariaAttributes.groupItemRole : ariaAttributes.itemRole } : {}
    });
    if (!isNullOrUndefined(uID) === true) {
      li.setAttribute("data-uid", uID);
    } else {
      li.setAttribute("data-uid", generateId());
    }
    if (grpLI && options && options.groupTemplate) {
      var compiledString = compileTemplate(options.groupTemplate);
      if (componentInstance && componentInstance.getModuleName() !== "listview") {
        var compiledElement = compiledString(item, componentInstance, "groupTemplate", curOpt.groupTemplateID, !!curOpt.isStringTemplate, null, li);
        if (compiledElement) {
          append(compiledElement, li);
        }
      } else {
        append(compiledString(item, componentInstance, "groupTemplate", curOpt.groupTemplateID, !!curOpt.isStringTemplate), li);
      }
    } else if (!grpLI && options && options.template) {
      var compiledString = compileTemplate(options.template);
      if (componentInstance && componentInstance.getModuleName() !== "listview") {
        var compiledElement = compiledString(item, componentInstance, "template", curOpt.templateID, !!curOpt.isStringTemplate, null, li);
        if (compiledElement) {
          append(compiledElement, li);
        }
      } else {
        append(compiledString(item, componentInstance, "template", curOpt.templateID, !!curOpt.isStringTemplate), li);
      }
    } else {
      var innerDiv = createElement("div", {
        className: cssClass.textContent,
        attrs: ariaAttributes.wrapperRole !== "" ? { role: ariaAttributes.wrapperRole } : {}
      });
      if (dataSource && (fieldData[fields.url] || fieldData[fields.urlAttributes] && fieldData[fields.urlAttributes].href)) {
        innerDiv.appendChild(anchorTag(createElement, dataSource, fields, text, null, curOpt.itemNavigable));
      } else {
        var element = createElement("span", {
          className: cssClass.text,
          attrs: ariaAttributes.itemText !== "" ? { role: ariaAttributes.itemText } : {}
        });
        if (options && options.enableHtmlSanitizer) {
          element.innerText = text;
        } else {
          element.innerHTML = text;
        }
        innerDiv.appendChild(element);
      }
      li.appendChild(innerDiv);
    }
    return li;
  }
  function generateUL(createElement, liElement, className, options) {
    var curOpt = extend({}, defaultListBaseOptions, options);
    var ariaAttributes = extend({}, defaultAriaAttributes, curOpt.ariaAttributes);
    cssClass = getModuleClass(curOpt.moduleName);
    var ulElement = createElement("ul", {
      className: cssClass.ul + " " + (isNullOrUndefined(className) ? "" : className),
      attrs: ariaAttributes.listRole !== "" ? { role: ariaAttributes.listRole } : {}
    });
    append(liElement, ulElement);
    return ulElement;
  }
  ListBase2.generateUL = generateUL;
  function generateIcon(createElement, liElement, className, options) {
    var curOpt = extend({}, defaultListBaseOptions, options);
    cssClass = getModuleClass(curOpt.moduleName);
    var expandElement = curOpt.expandIconPosition === "Left" ? prepend : append;
    expandElement([createElement("div", {
      className: "e-icons " + curOpt.expandIconClass + " " + (isNullOrUndefined(className) ? "" : className)
    })], liElement.querySelector("." + cssClass.textContent));
    return liElement;
  }
  ListBase2.generateIcon = generateIcon;
})(ListBase || (ListBase = {}));
function getFieldValues(dataItem, fields) {
  var fieldData = {};
  if (isNullOrUndefined(dataItem) || typeof dataItem === "string" || typeof dataItem === "number" || !isNullOrUndefined(dataItem.isHeader)) {
    return dataItem;
  } else {
    for (var _i = 0, _a = Object.keys(fields); _i < _a.length; _i++) {
      var field = _a[_i];
      var dataField = fields["" + field];
      var value = !isNullOrUndefined(dataField) && typeof dataField === "string" ? getValue(dataField, dataItem) : void 0;
      if (!isNullOrUndefined(value)) {
        fieldData["" + dataField] = value;
      }
    }
  }
  return fieldData;
}
function compileTemplate(template) {
  if (template) {
    try {
      if (typeof template !== "function" && document.querySelector(template)) {
        return compile(document.querySelector(template).innerHTML.trim());
      } else {
        return compile(template);
      }
    } catch (e) {
      return compile(template);
    }
  }
  return void 0;
}

// node_modules/@syncfusion/ej2-lists/src/sortable/sortable.js
var __extends2 = /* @__PURE__ */ (function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Sortable = (
  /** @class */
  (function(_super) {
    __extends2(Sortable2, _super);
    function Sortable2(element, options) {
      var _this = _super.call(this, options, element) || this;
      _this.getHelper = function(e) {
        var target = _this.getSortableElement(e.sender.target);
        if (!_this.isValidTarget(target, _this)) {
          return false;
        }
        var element2;
        if (_this.helper) {
          element2 = _this.helper({ sender: target, element: e.element });
        } else {
          element2 = target.cloneNode(true);
          element2.style.width = target.offsetWidth + "px";
          element2.style.height = target.offsetHeight + "px";
        }
        addClass([element2], ["e-sortableclone"]);
        document.body.appendChild(element2);
        return element2;
      };
      _this.onDrag = function(e) {
        if (!e.target) {
          return;
        }
        _this.trigger("drag", { event: e.event, element: _this.element, target: e.target });
        var newInst = _this.getSortableInstance(e.target);
        var target = _this.getSortableElement(e.target, newInst);
        if ((_this.isValidTarget(target, newInst) || e.target && typeof e.target.className === "string" && e.target.className.indexOf("e-list-group-item") > -1) && (_this.curTarget !== target || !isNullOrUndefined(newInst.placeHolder)) && (newInst.placeHolderElement ? newInst.placeHolderElement !== e.target : true)) {
          if (e.target.classList.contains("e-list-group-item")) {
            target = e.target;
          }
          _this.curTarget = target;
          if (_this.target === target) {
            return;
          }
          var oldIdx = _this.getIndex(newInst.placeHolderElement, newInst);
          var placeHolder = _this.getPlaceHolder(target, newInst);
          var newIdx = void 0;
          if (placeHolder) {
            oldIdx = isNullOrUndefined(oldIdx) ? _this.getIndex(_this.target) : oldIdx;
            newIdx = _this.getIndex(target, newInst, e.event);
            var isPlaceHolderPresent = _this.isPlaceHolderPresent(newInst);
            if (isPlaceHolderPresent && oldIdx === newIdx) {
              return;
            }
            if (isPlaceHolderPresent) {
              _this.removePlaceHolder(newInst);
            }
            newInst.placeHolderElement = placeHolder;
            if (e.target && typeof e.target.className === "string" && e.target.className.indexOf("e-list-group-item") > -1) {
              newInst.element.insertBefore(newInst.placeHolderElement, newInst.element.children[newIdx]);
            } else if (newInst.element !== _this.element && newIdx === newInst.element.childElementCount) {
              newInst.element.appendChild(newInst.placeHolderElement);
            } else {
              newInst.element.insertBefore(newInst.placeHolderElement, newInst.element.children[newIdx]);
            }
          } else {
            oldIdx = isNullOrUndefined(oldIdx) ? _this.getIndex(_this.target) : _this.getIndex(target, newInst) < oldIdx || !oldIdx ? oldIdx : oldIdx - 1;
            newIdx = _this.getIndex(target, newInst);
            var idx = newInst.element !== _this.element ? newIdx : oldIdx < newIdx ? newIdx + 1 : newIdx;
            _this.updateItemClass(newInst);
            newInst.element.insertBefore(_this.target, newInst.element.children[idx]);
            _this.curTarget = _this.target;
            _this.trigger("drop", {
              droppedElement: _this.target,
              element: newInst.element,
              previousIndex: oldIdx,
              currentIndex: newIdx,
              target: e.target,
              helper: document.getElementsByClassName("e-sortableclone")[0],
              event: e.event,
              scope: _this.scope
            });
          }
        } else if (_this.curTarget !== _this.target && _this.scope && _this.curTarget !== target && !isNullOrUndefined(newInst.placeHolder)) {
          _this.removePlaceHolder(_this.getSortableInstance(_this.curTarget));
          _this.curTarget = _this.target;
        }
        newInst = _this.getSortableInstance(_this.curTarget);
        if (isNullOrUndefined(target) && e.target !== newInst.placeHolderElement) {
          if (_this.isPlaceHolderPresent(newInst)) {
            _this.removePlaceHolder(newInst);
          }
        } else {
          var placeHolders = [].slice.call(document.getElementsByClassName("e-sortable-placeholder"));
          var inst_1;
          placeHolders.forEach(function(placeHolder2) {
            inst_1 = _this.getSortableInstance(placeHolder2);
            if (inst_1.element && inst_1 !== newInst) {
              _this.removePlaceHolder(inst_1);
            }
          });
        }
      };
      _this.onDragStart = function(e) {
        _this.target = _this.getSortableElement(e.target);
        if (isNullOrUndefined(_this.target) && closest(_this.element, ".e-listbox-container") && Browser.isDevice) {
          detach(e.dragElement);
          getComponent(_this.element, "draggable").intDestroy(e.event);
          return;
        }
        var cancelDrag = false;
        _this.target.classList.add("e-grabbed");
        _this.curTarget = _this.target;
        e.helper = document.getElementsByClassName("e-sortableclone")[0];
        var args = { cancel: false, element: _this.element, target: _this.target };
        _this.trigger("beforeDragStart", args, function(observedArgs) {
          if (observedArgs.cancel) {
            cancelDrag = observedArgs.cancel;
            _this.onDragStop(e);
          }
        });
        if (cancelDrag) {
          return;
        }
        if (isBlazor) {
          _this.trigger("dragStart", {
            event: e.event,
            element: _this.element,
            target: _this.target,
            bindEvents: e.bindEvents,
            dragElement: e.dragElement
          });
        } else {
          _this.trigger("dragStart", { event: e.event, element: _this.element, target: _this.target });
        }
      };
      _this.onDragStop = function(e) {
        var dropInst = _this.getSortableInstance(_this.curTarget);
        var prevIdx;
        var curIdx;
        var handled;
        prevIdx = _this.getIndex(_this.target);
        var isPlaceHolderPresent = _this.isPlaceHolderPresent(dropInst);
        if (isPlaceHolderPresent) {
          var curIdx_1 = _this.getIndex(dropInst.placeHolderElement, dropInst);
          prevIdx = _this === dropInst && prevIdx - curIdx_1 >= 1 ? prevIdx - 1 : prevIdx;
          var args = {
            previousIndex: prevIdx,
            currentIndex: curIdx_1,
            target: e.target,
            droppedElement: _this.target,
            helper: e.helper,
            cancel: false,
            handled: false
          };
          _this.trigger("beforeDrop", args, function(observedArgs) {
            if (!observedArgs.cancel) {
              handled = observedArgs.handled;
              _this.updateItemClass(dropInst);
              if (observedArgs.handled) {
                var ele = _this.target.cloneNode(true);
                _this.target.classList.remove("e-grabbed");
                _this.target = ele;
              }
              dropInst.element.insertBefore(_this.target, dropInst.placeHolderElement);
              var curIdx_2 = _this.getIndex(_this.target, dropInst);
              if (observedArgs.currentIndex > observedArgs.previousIndex) {
                prevIdx = _this === dropInst && prevIdx - curIdx_2 >= 1 ? prevIdx - 1 : prevIdx;
              }
              _this.trigger("drop", {
                event: e.event,
                element: dropInst.element,
                previousIndex: prevIdx,
                currentIndex: curIdx_2,
                target: e.target,
                helper: e.helper,
                droppedElement: _this.target,
                scopeName: _this.scope,
                handled
              });
            }
            _this.removePlaceHolder(dropInst);
          });
        }
        dropInst = _this.getSortableInstance(e.target);
        curIdx = dropInst.element.childElementCount;
        prevIdx = _this.getIndex(_this.target);
        if (dropInst.element.querySelector(".e-list-nrt")) {
          curIdx = curIdx - 1;
        }
        if (_this.curTarget === _this.target && e.target === _this.curTarget) {
          curIdx = prevIdx;
        }
        if (dropInst.element === e.target || !isPlaceHolderPresent && _this.curTarget === _this.target) {
          var beforeDropArgs = {
            previousIndex: prevIdx,
            currentIndex: curIdx,
            target: e.target,
            droppedElement: _this.target,
            helper: e.helper,
            cancel: false
          };
          _this.trigger("beforeDrop", beforeDropArgs, function(observedArgs) {
            if ((dropInst.element === e.target || typeof e.target.className === "string" && e.target.className.indexOf("e-list-nrt") > -1 || typeof e.target.className === "string" && e.target.className.indexOf("e-list-nr-template") > -1 || e.target.closest(".e-list-nr-template")) && !observedArgs.cancel) {
              _this.updateItemClass(dropInst);
              dropInst.element.appendChild(_this.target);
              _this.trigger("drop", {
                event: e.event,
                element: dropInst.element,
                previousIndex: prevIdx,
                currentIndex: curIdx,
                target: e.target,
                helper: e.helper,
                droppedElement: _this.target,
                scopeName: _this.scope
              });
            }
          });
        }
        _this.target.classList.remove("e-grabbed");
        _this.target = null;
        _this.curTarget = null;
        remove(e.helper);
        getComponent(_this.element, "draggable").intDestroy(e.event);
      };
      _this.bind();
      return _this;
    }
    Sortable_1 = Sortable2;
    Sortable2.prototype.bind = function() {
      if (!this.element.id) {
        this.element.id = getUniqueID("sortable");
      }
      if (!this.itemClass) {
        this.itemClass = "e-sort-item";
        this.dataBind();
      }
      this.initializeDraggable();
    };
    Sortable2.prototype.initializeDraggable = function() {
      new Draggable(this.element, {
        helper: this.getHelper,
        dragStart: this.onDragStart,
        drag: this.onDrag,
        dragStop: this.onDragStop,
        dragTarget: "." + this.itemClass,
        enableTapHold: true,
        tapHoldThreshold: 200,
        queryPositionInfo: this.queryPositionInfo,
        distance: 1
      });
      this.wireEvents();
    };
    Sortable2.prototype.wireEvents = function() {
      var wrapper = this.element;
      EventHandler.add(wrapper, "keydown", this.keyDownHandler, this);
    };
    Sortable2.prototype.unwireEvents = function() {
      var wrapper = this.element;
      EventHandler.remove(wrapper, "keydown", this.keyDownHandler);
    };
    Sortable2.prototype.keyDownHandler = function(e) {
      if (e.keyCode === 27) {
        var dragStop = getComponent(this.element, "draggable");
        if (dragStop) {
          dragStop.intDestroy(null);
        }
        var dragWrapper = document.getElementsByClassName("e-sortableclone")[0];
        if (dragWrapper) {
          dragWrapper.remove();
        }
        var dragPlaceholder = document.getElementsByClassName("e-sortable-placeholder")[0];
        if (dragPlaceholder) {
          dragPlaceholder.remove();
        }
      }
    };
    Sortable2.prototype.getPlaceHolder = function(target, instance) {
      if (instance.placeHolder) {
        var placeHolderElement = instance.placeHolder({ element: instance.element, grabbedElement: this.target, target });
        placeHolderElement.classList.add("e-sortable-placeholder");
        return placeHolderElement;
      }
      return null;
    };
    Sortable2.prototype.isValidTarget = function(target, instance) {
      return target && compareElementParent(target, instance.element) && target.classList.contains(instance.itemClass) && !target.classList.contains("e-disabled");
    };
    Sortable2.prototype.removePlaceHolder = function(instance) {
      remove(instance.placeHolderElement);
      instance.placeHolderElement = null;
    };
    Sortable2.prototype.updateItemClass = function(instance) {
      if (this !== instance) {
        this.target.classList.remove(this.itemClass);
        this.target.classList.add(instance.itemClass);
      }
    };
    Sortable2.prototype.getSortableInstance = function(element) {
      element = closest(element, ".e-" + this.getModuleName());
      if (element) {
        var inst = getComponent(element, Sortable_1);
        return inst.scope && this.scope && inst.scope === this.scope ? inst : this;
      } else {
        return this;
      }
    };
    Sortable2.prototype.getIndex = function(target, instance, e) {
      if (instance === void 0) {
        instance = this;
      }
      var idx;
      var placeHolderPresent;
      [].slice.call(instance.element.children).forEach(function(element, index) {
        if (element.classList.contains("e-sortable-placeholder")) {
          placeHolderPresent = true;
        }
        if (element === target) {
          idx = index;
          if (!isNullOrUndefined(e)) {
            if (placeHolderPresent) {
              idx -= 1;
            }
            var offset = target.getBoundingClientRect();
            var clientY = offset.bottom - (offset.bottom - offset.top) / 2;
            var cltY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
            idx = cltY <= clientY ? idx : idx + 1;
          }
          return;
        }
      });
      return idx;
    };
    Sortable2.prototype.getSortableElement = function(element, instance) {
      if (instance === void 0) {
        instance = this;
      }
      return closest(element, "." + instance.itemClass);
    };
    Sortable2.prototype.queryPositionInfo = function(value) {
      value.left = scrollX ? parseFloat(value.left) - scrollX + "px" : value.left;
      value.top = scrollY ? parseFloat(value.top) - scrollY + "px" : value.top;
      return value;
    };
    Sortable2.prototype.isPlaceHolderPresent = function(instance) {
      return instance.placeHolderElement && !!closest(instance.placeHolderElement, "#" + instance.element.id);
    };
    Sortable2.prototype.moveTo = function(destination, targetIndexes, insertBefore) {
      moveTo(this.element, destination, targetIndexes, insertBefore);
    };
    Sortable2.prototype.destroy = function() {
      this.unwireEvents();
      if (this.itemClass === "e-sort-item") {
        this.itemClass = null;
        this.dataBind();
      }
      getComponent(this.element, Draggable).destroy();
      _super.prototype.destroy.call(this);
    };
    Sortable2.prototype.getModuleName = function() {
      return "sortable";
    };
    Sortable2.prototype.onPropertyChanged = function(newProp, oldProp) {
      for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
        var prop = _a[_i];
        switch (prop) {
          case "itemClass":
            [].slice.call(this.element.children).forEach(function(element) {
              if (element.classList.contains(oldProp.itemClass)) {
                element.classList.remove(oldProp.itemClass);
              }
              if (newProp.itemClass) {
                element.classList.add(newProp.itemClass);
              }
            });
            break;
        }
      }
    };
    var Sortable_1;
    __decorate([
      Property(false)
    ], Sortable2.prototype, "enableAnimation", void 0);
    __decorate([
      Property(null)
    ], Sortable2.prototype, "itemClass", void 0);
    __decorate([
      Property(null)
    ], Sortable2.prototype, "scope", void 0);
    __decorate([
      Property()
    ], Sortable2.prototype, "helper", void 0);
    __decorate([
      Property()
    ], Sortable2.prototype, "placeHolder", void 0);
    __decorate([
      Event()
    ], Sortable2.prototype, "drag", void 0);
    __decorate([
      Event()
    ], Sortable2.prototype, "beforeDragStart", void 0);
    __decorate([
      Event()
    ], Sortable2.prototype, "dragStart", void 0);
    __decorate([
      Event()
    ], Sortable2.prototype, "beforeDrop", void 0);
    __decorate([
      Event()
    ], Sortable2.prototype, "drop", void 0);
    Sortable2 = Sortable_1 = __decorate([
      NotifyPropertyChanges
    ], Sortable2);
    return Sortable2;
  })(Base)
);
function moveTo(from, to, targetIndexes, insertBefore) {
  var targetElements = [];
  if (!to) {
    to = from;
  }
  if (targetIndexes && targetIndexes.length) {
    targetIndexes.forEach(function(index) {
      targetElements.push(from.children[index]);
    });
  } else {
    targetElements = [].slice.call(from.children);
  }
  if (isNullOrUndefined(insertBefore)) {
    targetElements.forEach(function(target) {
      to.appendChild(target);
    });
  } else {
    var insertElement_1 = to.children[insertBefore];
    targetElements.forEach(function(target) {
      to.insertBefore(target, insertElement_1);
    });
  }
}

// node_modules/@syncfusion/ej2-lists/src/list-view/list-view.js
var __extends3 = /* @__PURE__ */ (function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __decorate2 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var effectsConfig = {
  "None": [],
  "SlideLeft": ["SlideRightOut", "SlideLeftOut", "SlideLeftIn", "SlideRightIn"],
  "SlideDown": ["SlideTopOut", "SlideBottomOut", "SlideBottomIn", "SlideTopIn"],
  "Zoom": ["FadeOut", "FadeZoomOut", "FadeZoomIn", "FadeIn"],
  "Fade": ["FadeOut", "FadeOut", "FadeIn", "FadeIn"]
};
var effectsRTLConfig = {
  "None": [],
  "SlideLeft": ["SlideLeftOut", "SlideRightOut", "SlideRightIn", "SlideLeftIn"],
  "SlideDown": ["SlideBottomOut", "SlideTopOut", "SlideTopIn", "SlideBottomIn"],
  "Zoom": ["FadeZoomOut", "FadeOut", "FadeIn", "FadeZoomIn"],
  "Fade": ["FadeOut", "FadeOut", "FadeIn", "FadeIn"]
};
var classNames = {
  root: "e-listview",
  hover: "e-hover",
  selected: "e-active",
  focused: "e-focused",
  parentItem: "e-list-parent",
  listItem: "e-list-item",
  listIcon: "e-list-icon",
  textContent: "e-text-content",
  listItemText: "e-list-text",
  groupListItem: "e-list-group-item",
  hasChild: "e-has-child",
  view: "e-view",
  header: "e-list-header",
  headerText: "e-headertext",
  headerTemplateText: "e-headertemplate-text",
  text: "e-text",
  disable: "e-disabled",
  container: "e-list-container",
  icon: "e-icons",
  backIcon: "e-icon-back",
  backButton: "e-back-button",
  checkboxWrapper: "e-checkbox-wrapper",
  checkbox: "e-checkbox",
  checked: "e-check",
  checklist: "e-checklist",
  checkboxIcon: "e-frame",
  checkboxRight: "e-checkbox-right",
  checkboxLeft: "e-checkbox-left",
  listviewCheckbox: "e-listview-checkbox",
  itemCheckList: "e-checklist",
  virtualElementContainer: "e-list-virtualcontainer",
  listTemplate: "e-listview-template"
};
var LISTVIEW_TEMPLATE_PROPERTY = "Template";
var LISTVIEW_GROUPTEMPLATE_PROPERTY = "GroupTemplate";
var LISTVIEW_HEADERTEMPLATE_PROPERTY = "HeaderTemplate";
var swipeVelocity = 0.5;
var FieldSettings = (
  /** @class */
  (function(_super) {
    __extends3(FieldSettings2, _super);
    function FieldSettings2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate2([
      Property("id")
    ], FieldSettings2.prototype, "id", void 0);
    __decorate2([
      Property("text")
    ], FieldSettings2.prototype, "text", void 0);
    __decorate2([
      Property("isChecked")
    ], FieldSettings2.prototype, "isChecked", void 0);
    __decorate2([
      Property("isVisible")
    ], FieldSettings2.prototype, "isVisible", void 0);
    __decorate2([
      Property("enabled")
    ], FieldSettings2.prototype, "enabled", void 0);
    __decorate2([
      Property("iconCss")
    ], FieldSettings2.prototype, "iconCss", void 0);
    __decorate2([
      Property("child")
    ], FieldSettings2.prototype, "child", void 0);
    __decorate2([
      Property("tooltip")
    ], FieldSettings2.prototype, "tooltip", void 0);
    __decorate2([
      Property("groupBy")
    ], FieldSettings2.prototype, "groupBy", void 0);
    __decorate2([
      Property("text")
    ], FieldSettings2.prototype, "sortBy", void 0);
    __decorate2([
      Property("htmlAttributes")
    ], FieldSettings2.prototype, "htmlAttributes", void 0);
    __decorate2([
      Property("tableName")
    ], FieldSettings2.prototype, "tableName", void 0);
    return FieldSettings2;
  })(ChildProperty)
);
var ListView = (
  /** @class */
  (function(_super) {
    __extends3(ListView2, _super);
    function ListView2(options, element) {
      var _this = _super.call(this, options, element) || this;
      _this.previousSelectedItems = [];
      _this.hiddenItems = [];
      _this.enabledItems = [];
      _this.disabledItems = [];
      return _this;
    }
    ListView2.prototype.onPropertyChanged = function(newProp, oldProp) {
      for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
        var prop = _a[_i];
        switch (prop) {
          case "htmlAttributes":
            this.setHTMLAttribute();
            break;
          case "cssClass":
            this.setCSSClass(oldProp.cssClass);
            break;
          case "enable":
            this.setEnable();
            break;
          case "width":
          case "height":
            this.setSize();
            break;
          case "enableRtl":
            this.setEnableRTL();
            break;
          case "fields":
            this.listBaseOption.fields = this.fields.properties;
            if (this.enableVirtualization) {
              this.virtualizationModule.reRenderUiVirtualization();
            } else {
              this.reRender();
            }
            break;
          case "headerTitle":
            if (!this.curDSLevel.length) {
              this.header(this.headerTitle, false, "header");
            }
            break;
          case "query":
            if (this.enableVirtualization) {
              this.virtualizationModule.reRenderUiVirtualization();
            } else {
              this.reRender();
            }
            break;
          case "showHeader":
            this.header(this.headerTitle, false, "header");
            break;
          case "enableVirtualization":
            if (!isNullOrUndefined(this.contentContainer)) {
              detach(this.contentContainer);
            }
            this.refresh();
            break;
          case "showCheckBox":
          case "checkBoxPosition":
            if (this.enableVirtualization) {
              this.virtualizationModule.reRenderUiVirtualization();
            } else {
              this.setCheckbox();
            }
            break;
          case "dataSource":
            this.previousScrollTop = this.element.scrollTop;
            if (this.enableVirtualization) {
              this.virtualizationModule.reRenderUiVirtualization();
            } else {
              this.reRender();
            }
            break;
          case "sortOrder":
          case "template":
            if (!this.enableVirtualization) {
              this.refresh();
            }
            break;
          case "showIcon":
            if (this.enableVirtualization) {
              this.virtualizationModule.reRenderUiVirtualization();
            } else {
              this.listBaseOption.showIcon = this.showIcon;
              this.curViewDS = this.getSubDS();
              this.resetCurrentList();
            }
            break;
          default:
            break;
        }
      }
    };
    ListView2.prototype.setHTMLAttribute = function() {
      if (!isNullOrUndefined(this.htmlAttributes) && Object.keys(this.htmlAttributes).length) {
        attributes(this.element, this.htmlAttributes);
      }
    };
    ListView2.prototype.setCSSClass = function(oldCSSClass) {
      if (this.cssClass) {
        addClass([this.element], this.cssClass.split(" ").filter(function(css) {
          return css;
        }));
      }
      if (oldCSSClass) {
        removeClass([this.element], oldCSSClass.split(" ").filter(function(css) {
          return css;
        }));
      }
    };
    ListView2.prototype.setSize = function() {
      this.element.style.height = formatUnit(this.height);
      this.element.style.width = formatUnit(this.width);
      this.isWindow = this.element.clientHeight ? false : true;
    };
    ListView2.prototype.setEnable = function() {
      this.enableElement(this.element, this.enable);
    };
    ListView2.prototype.setEnableRTL = function() {
      if (this.enableRtl) {
        this.element.classList.add("e-rtl");
      } else {
        this.element.classList.remove("e-rtl");
      }
    };
    ListView2.prototype.enableElement = function(element, isEnabled) {
      if (isEnabled) {
        element.classList.remove(classNames.disable);
      } else {
        element.classList.add(classNames.disable);
      }
    };
    ListView2.prototype.header = function(text, showBack, prop) {
      if (this.headerEle === void 0 && this.showHeader) {
        this.headerEle = this.createElement("div", { className: classNames.header });
        var innerHeaderEle = this.createElement("span", { className: classNames.headerText });
        if (this.enableHtmlSanitizer) {
          this.setProperties({ headerTitle: SanitizeHtmlHelper.sanitize(this.headerTitle) }, true);
          innerHeaderEle.innerText = this.headerTitle;
        } else {
          innerHeaderEle.innerHTML = this.headerTitle;
        }
        var textEle = this.createElement("div", { className: classNames.text, innerHTML: innerHeaderEle.outerHTML });
        var hedBackButton = this.createElement("div", {
          className: classNames.icon + " " + classNames.backIcon + " " + classNames.backButton,
          attrs: { style: "display:none;" }
        });
        this.headerEle.appendChild(hedBackButton);
        this.headerEle.appendChild(textEle);
        if (this.headerTemplate) {
          var compiledString = compile(this.headerTemplate);
          var headerTemplateEle = this.createElement("div", { className: classNames.headerTemplateText });
          var compiledElement = compiledString({}, this, prop, this.LISTVIEW_HEADERTEMPLATE_ID, null, null, this.headerEle);
          if (compiledElement) {
            append(compiledElement, headerTemplateEle);
          }
          append([headerTemplateEle], this.headerEle);
          if (this.isReact) {
            this.renderReactTemplates();
          }
        }
        if (this.headerTemplate && this.headerTitle) {
          textEle.classList.add("header");
        }
        this.element.classList.add("e-has-header");
        prepend([this.headerEle], this.element);
      } else if (this.headerEle) {
        if (this.showHeader) {
          this.headerEle.style.display = "";
          var textEle = this.headerEle.querySelector("." + classNames.headerText);
          var hedBackButton = this.headerEle.querySelector("." + classNames.backIcon);
          if (this.enableHtmlSanitizer) {
            text = SanitizeHtmlHelper.sanitize(text);
          }
          textEle.innerHTML = text;
          if (this.headerTemplate && showBack) {
            textEle.parentElement.classList.remove("header");
            this.headerEle.querySelector("." + classNames.headerTemplateText).classList.add("nested-header");
          }
          if (this.headerTemplate && !showBack) {
            textEle.parentElement.classList.add("header");
            this.headerEle.querySelector("." + classNames.headerTemplateText).classList.remove("nested-header");
            this.headerEle.querySelector("." + classNames.headerTemplateText).classList.add("header");
          }
          if (showBack === true) {
            hedBackButton.style.display = "";
          } else {
            hedBackButton.style.display = "none";
          }
        } else {
          this.headerEle.style.display = "none";
        }
      }
    };
    ListView2.prototype.switchView = function(fromView, toView, reverse) {
      var _this = this;
      if (fromView && toView) {
        var fPos_1 = fromView.style.position;
        var overflow_1 = this.element.style.overflow !== "hidden" ? this.element.style.overflow : "";
        fromView.style.position = "absolute";
        fromView.classList.add("e-view");
        var anim = void 0;
        var duration = this.animation.duration;
        if (this.animation.effect) {
          anim = this.enableRtl ? effectsRTLConfig[this.animation.effect] : effectsConfig[this.animation.effect];
        } else {
          var slideLeft = "SlideLeft";
          anim = effectsConfig["" + slideLeft];
          reverse = this.enableRtl;
          duration = 0;
        }
        this.element.style.overflow = "hidden";
        this.aniObj.animate(fromView, {
          name: reverse === true ? anim[0] : anim[1],
          duration: duration === 0 && animationMode === "Enable" ? 400 : duration,
          timingFunction: this.animation.easing,
          end: function() {
            fromView.style.display = "none";
            _this.element.style.overflow = overflow_1;
            fromView.style.position = fPos_1;
            fromView.classList.remove("e-view");
          }
        });
        toView.style.display = "";
        this.aniObj.animate(toView, {
          name: reverse === true ? anim[2] : anim[3],
          duration: duration === 0 && animationMode === "Enable" ? 400 : duration,
          timingFunction: this.animation.easing,
          end: function() {
            _this.trigger("actionComplete");
          }
        });
        this.curUL = toView;
      }
    };
    ListView2.prototype.preRender = function() {
      if (this.template) {
        try {
          if (typeof this.template !== "function" && document.querySelectorAll(this.template).length) {
            this.setProperties({ template: document.querySelector(this.template).innerHTML.trim() }, true);
          }
        } catch (e) {
          compile(this.template);
        }
      }
      this.listBaseOption = {
        template: this.template,
        headerTemplate: this.headerTemplate,
        groupTemplate: this.groupTemplate,
        expandCollapse: true,
        listClass: "",
        ariaAttributes: {
          itemRole: "listitem",
          listRole: "list",
          itemText: "",
          groupItemRole: "presentation",
          wrapperRole: "presentation"
        },
        fields: this.fields.properties,
        sortOrder: this.sortOrder,
        showIcon: this.showIcon,
        itemCreated: this.renderCheckbox.bind(this),
        templateID: "" + this.element.id + LISTVIEW_TEMPLATE_PROPERTY,
        groupTemplateID: "" + this.element.id + LISTVIEW_GROUPTEMPLATE_PROPERTY,
        enableHtmlSanitizer: this.enableHtmlSanitizer
      };
      this.initialization();
    };
    ListView2.prototype.initialization = function() {
      this.curDSLevel = [];
      this.animateOptions = {};
      this.curViewDS = [];
      this.currentLiElements = [];
      this.isNestedList = false;
      this.selectedData = [];
      this.selectedId = this.enablePersistence ? this.selectedId : [];
      this.LISTVIEW_TEMPLATE_ID = "" + this.element.id + LISTVIEW_TEMPLATE_PROPERTY;
      this.LISTVIEW_GROUPTEMPLATE_ID = "" + this.element.id + LISTVIEW_GROUPTEMPLATE_PROPERTY;
      this.LISTVIEW_HEADERTEMPLATE_ID = "" + this.element.id + LISTVIEW_HEADERTEMPLATE_PROPERTY;
      this.aniObj = new Animation(this.animateOptions);
      this.removeElement(this.curUL);
      this.removeElement(this.ulElement);
      this.removeElement(this.headerEle);
      this.removeElement(this.contentContainer);
      this.curUL = this.ulElement = this.liCollection = this.headerEle = this.contentContainer = void 0;
    };
    ListView2.prototype.renderCheckbox = function(args) {
      var _this = this;
      if (args.item.classList.contains(classNames.hasChild)) {
        this.isNestedList = true;
      }
      if (this.showCheckBox && args.item.classList.contains(classNames.listItem)) {
        var fieldData_1;
        var checkboxElement = createCheckBox(this.createElement, false, {
          checked: false,
          enableRtl: this.enableRtl,
          cssClass: classNames.listviewCheckbox
        });
        checkboxElement.setAttribute("role", "checkbox");
        var frameElement_1 = checkboxElement.querySelector("." + classNames.checkboxIcon);
        args.item.classList.add(classNames.itemCheckList);
        args.item.firstElementChild.classList.add(classNames.checkbox);
        if (this.template && this.element) {
          addClass([this.element], classNames.listTemplate);
        } else if (this.template === null && this.element && this.element.classList && this.element.classList.contains("e-listview-template")) {
          removeClass([this.element], classNames.listTemplate);
        }
        if (typeof this.dataSource[0] !== "string" && typeof this.dataSource[0] !== "number") {
          fieldData_1 = getFieldValues(args.curData, this.listBaseOption.fields);
          if (this.enablePersistence && !isNullOrUndefined(this.selectedId)) {
            var index = this.selectedId.findIndex(function(e) {
              return e === fieldData_1[_this.listBaseOption.fields.id].toString();
            });
            if (index !== -1) {
              this.checkInternally(args, checkboxElement);
            }
          } else if (fieldData_1[this.listBaseOption.fields.isChecked]) {
            this.checkInternally(args, checkboxElement);
          }
        } else if ((typeof this.dataSource[0] === "string" || typeof this.dataSource[0] === "number") && this.selectedData.indexOf(args.text) !== -1) {
          this.checkInternally(args, checkboxElement);
        }
        checkboxElement.setAttribute("aria-checked", frameElement_1.classList.contains(classNames.checked) ? "true" : "false");
        checkboxElement.setAttribute("aria-label", args.text);
        if (this.checkBoxPosition === "Left") {
          checkboxElement.classList.add(classNames.checkboxLeft);
          args.item.firstElementChild.classList.add(classNames.checkboxLeft);
          args.item.firstElementChild.insertBefore(checkboxElement, args.item.firstElementChild.childNodes[0]);
        } else {
          checkboxElement.classList.add(classNames.checkboxRight);
          args.item.firstElementChild.classList.add(classNames.checkboxRight);
          args.item.firstElementChild.appendChild(checkboxElement);
        }
        this.currentLiElements.push(args.item);
        if (this.checkBoxPosition === "Left") {
          this.virtualCheckBox = args.item.firstElementChild.children[0];
        } else {
          this.virtualCheckBox = args.item.firstElementChild.lastElementChild;
        }
      }
    };
    ListView2.prototype.checkInternally = function(args, checkboxElement) {
      args.item.classList.add(classNames.selected);
      checkboxElement.querySelector("." + classNames.checkboxIcon).classList.add(classNames.checked);
      checkboxElement.setAttribute("aria-checked", "true");
    };
    ListView2.prototype.checkItem = function(item) {
      this.toggleCheckBase(item, true);
    };
    ListView2.prototype.toggleCheckBase = function(item, checked) {
      if (this.showCheckBox) {
        var liElement = item;
        if (item instanceof Object && item.constructor !== HTMLLIElement) {
          liElement = this.getLiFromObjOrElement(item);
        }
        if (!isNullOrUndefined(liElement)) {
          var checkboxIcon = liElement.querySelector("." + classNames.checkboxIcon);
          if (checked === true) {
            liElement.classList.add(classNames.selected);
          } else {
            liElement.classList.remove(classNames.selected);
          }
          if (checked === true) {
            checkboxIcon.classList.add(classNames.checked);
          } else {
            checkboxIcon.classList.remove(classNames.checked);
          }
          checkboxIcon.parentElement.setAttribute("aria-checked", checked ? "true" : "false");
        }
        this.setSelectedItemData(liElement);
        this.updateSelectedId();
      }
    };
    ListView2.prototype.uncheckItem = function(item) {
      this.toggleCheckBase(item, false);
    };
    ListView2.prototype.checkAllItems = function() {
      this.toggleAllCheckBase(true);
    };
    ListView2.prototype.uncheckAllItems = function() {
      this.toggleAllCheckBase(false);
    };
    ListView2.prototype.toggleAllCheckBase = function(checked) {
      if (this.showCheckBox) {
        for (var i = 0; i < this.liCollection.length; i++) {
          var checkIcon = this.liCollection[i].querySelector("." + classNames.checkboxIcon);
          if (checkIcon) {
            if (checked) {
              if (!checkIcon.classList.contains(classNames.checked)) {
                this.checkItem(this.liCollection[i]);
              }
            } else {
              if (checkIcon.classList.contains(classNames.checked)) {
                this.uncheckItem(this.liCollection[i]);
              }
            }
          }
        }
        if (this.enableVirtualization) {
          this.virtualizationModule.checkedItem(checked);
        }
        this.updateSelectedId();
      }
    };
    ListView2.prototype.setCheckbox = function() {
      if (this.showCheckBox) {
        var liCollection = Array.prototype.slice.call(this.element.querySelectorAll("." + classNames.listItem));
        var args = {
          item: void 0,
          curData: void 0,
          dataSource: void 0,
          fields: void 0,
          options: void 0,
          text: ""
        };
        for (var i = 0; i < liCollection.length; i++) {
          var element = liCollection[i];
          args.item = element;
          args.curData = this.getItemData(element);
          if (element.querySelector("." + classNames.checkboxWrapper)) {
            this.removeElement(element.querySelector("." + classNames.checkboxWrapper));
          }
          this.renderCheckbox(args);
          if (args.item.classList.contains(classNames.selected)) {
            this.checkInternally(args, args.item.querySelector("." + classNames.checkboxWrapper));
          }
        }
      } else {
        var liCollection = Array.prototype.slice.call(this.element.querySelectorAll("." + classNames.itemCheckList));
        for (var i = 0; i < liCollection.length; i++) {
          var element = liCollection[i];
          element.classList.remove(classNames.selected);
          element.firstElementChild.classList.remove(classNames.checkbox);
          this.removeElement(element.querySelector("." + classNames.checkboxWrapper));
        }
        if (this.selectedItems) {
          this.selectedItems.item.classList.add(classNames.selected);
        }
      }
    };
    ListView2.prototype.refreshItemHeight = function() {
      if (this.virtualizationModule) {
        this.virtualizationModule.refreshItemHeight();
      }
    };
    ListView2.prototype.handleCheckboxState = function(li, checkIcon, checkboxElement, isCheckedBefore, isFocusedBefore, eventArgs, isSetCheckboxLI, textAreaFocus) {
      this.trigger("select", eventArgs, function(observedArgs) {
        if (observedArgs.cancel) {
          if (isSetCheckboxLI ? isCheckedBefore : !isCheckedBefore) {
            checkIcon.classList.add(classNames.checked);
            li.classList.add(classNames.selected);
          } else {
            checkIcon.classList.remove(classNames.checked);
            li.classList.remove(classNames.selected);
          }
          checkboxElement.setAttribute("aria-checked", isSetCheckboxLI ? isCheckedBefore ? "true" : "false" : isCheckedBefore ? "false" : "true");
          merge(eventArgs, { isChecked: checkIcon.classList.contains(classNames.checked) });
          if (isFocusedBefore) {
            li.classList.remove(classNames.focused);
            if (textAreaFocus) {
              textAreaFocus.classList.remove("e-focused");
            }
          }
        }
      });
    };
    ListView2.prototype.clickHandler = function(e) {
      if (Array.isArray(this.dataSource) && this.dataSource.length === 0) {
        return;
      }
      var target = e.target;
      this.targetElement = target;
      var classList = target.classList;
      var closestElement;
      if (classList.contains(classNames.backIcon) || classList.contains(classNames.headerText)) {
        if (this.showCheckBox && this.curDSLevel[this.curDSLevel.length - 1]) {
          this.uncheckAllItems();
        }
        this.back();
      } else {
        var li = closest(target.parentNode, "." + classNames.listItem);
        if (li === null) {
          li = target;
        }
        this.removeFocus();
        if (this.enable && this.showCheckBox && this.isValidLI(li)) {
          if (e.target.classList.contains(classNames.checkboxIcon)) {
            li.classList.add(classNames.focused);
            if (isNullOrUndefined(li.querySelector("." + classNames.checked))) {
              var args = {
                curData: void 0,
                dataSource: void 0,
                fields: void 0,
                options: void 0,
                text: void 0,
                item: li
              };
              this.checkInternally(args, args.item.querySelector("." + classNames.checkboxWrapper));
            } else {
              this.uncheckItem(li);
              li.classList.add(classNames.focused);
            }
            if (this.enableVirtualization) {
              this.virtualizationModule.setCheckboxLI(li, e);
            }
            if (e) {
              var eventArgs = this.selectEventData(li, e);
              var checkIcon = li.querySelector("." + classNames.checkboxIcon);
              merge(eventArgs, { isChecked: checkIcon.classList.contains(classNames.checked) });
              var checkboxElement = li.querySelector("." + classNames.checkboxWrapper);
              var isCheckedBefore = checkIcon.classList.contains(classNames.checked);
              var isFocusedBefore = li.classList.contains(classNames.focused);
              this.handleCheckboxState(li, checkIcon, checkboxElement, isCheckedBefore, isFocusedBefore, eventArgs, false);
            }
          } else if (li.classList.contains(classNames.hasChild)) {
            this.removeHover();
            this.removeSelect();
            this.removeSelect(li);
            this.setSelectLI(li, e);
            li.classList.remove(classNames.selected);
          } else {
            this.setCheckboxLI(li, e);
            if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA") {
              target.classList.add("e-focused");
              this.targetElement = target;
            }
          }
        } else {
          this.setSelectLI(li, e);
          if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA") {
            target.classList.add("e-focused");
            this.targetElement = target;
          }
        }
        closestElement = closest(e.target, "li");
        if (!isNullOrUndefined(closestElement)) {
          if (closestElement.classList.contains("e-has-child") && !e.target.parentElement.classList.contains("e-listview-checkbox")) {
            closestElement.classList.add(classNames.disable);
          }
        }
      }
      this.updateSelectedId();
    };
    ListView2.prototype.removeElement = function(element) {
      return element && element.parentNode && element.parentNode.removeChild(element);
    };
    ListView2.prototype.hoverHandler = function(e) {
      var curLi = closest(e.target.parentNode, "." + classNames.listItem);
      this.setHoverLI(curLi);
    };
    ListView2.prototype.leaveHandler = function() {
      this.removeHover();
    };
    ListView2.prototype.homeKeyHandler = function(e, end) {
      e.preventDefault();
      if (Object.keys(this.dataSource).length && this.curUL) {
        var li = this.curUL.querySelectorAll("." + classNames.listItem);
        var focusedElement = this.curUL.querySelector("." + classNames.focused) || this.curUL.querySelector("." + classNames.selected);
        if (focusedElement) {
          focusedElement.classList.remove(classNames.focused);
          if (!this.showCheckBox) {
            focusedElement.classList.remove(classNames.selected);
          }
        }
        var index = !end ? 0 : li.length - 1;
        if (li[index].classList.contains(classNames.hasChild) || this.showCheckBox) {
          li[index].classList.add(classNames.focused);
        } else {
          this.setSelectLI(li[index], e);
        }
        if (li[index]) {
          this.element.setAttribute("aria-activedescendant", li[index].id.toString());
        } else {
          this.element.removeAttribute("aria-activedescendant");
        }
      }
    };
    ListView2.prototype.onArrowKeyDown = function(e, prev) {
      var siblingLI;
      var li;
      var hasChild = !isNullOrUndefined(this.curUL.querySelector("." + classNames.hasChild)) ? true : false;
      if (hasChild || this.showCheckBox) {
        li = this.curUL.querySelector("." + classNames.focused) || this.curUL.querySelector("." + classNames.selected);
        siblingLI = ListBase.getSiblingLI(this.curUL.querySelectorAll("." + classNames.listItem), li, prev);
        if (!isNullOrUndefined(siblingLI)) {
          if (li) {
            li.classList.remove(classNames.focused);
            if (!this.showCheckBox) {
              li.classList.remove(classNames.selected);
            }
          }
          if (siblingLI.classList.contains(classNames.hasChild) || this.showCheckBox) {
            siblingLI.classList.add(classNames.focused);
          } else {
            this.setSelectLI(siblingLI, e);
          }
        }
      } else {
        li = this.curUL.querySelector("." + classNames.selected);
        siblingLI = ListBase.getSiblingLI(this.curUL.querySelectorAll("." + classNames.listItem), li, prev);
        this.setSelectLI(siblingLI, e);
      }
      if (siblingLI) {
        this.element.setAttribute("aria-activedescendant", siblingLI.id.toString());
      } else {
        this.element.removeAttribute("aria-activedescendant");
      }
      return siblingLI;
    };
    ListView2.prototype.arrowKeyHandler = function(e, prev) {
      var _this = this;
      e.preventDefault();
      if (Object.keys(this.dataSource).length && this.curUL) {
        var siblingLI = this.onArrowKeyDown(e, prev);
        var elementTop = this.element.getBoundingClientRect().top;
        var elementHeight = this.element.getBoundingClientRect().height;
        var firstItemBounds = this.curUL.querySelector("." + classNames.listItem).getBoundingClientRect();
        var heightDiff = void 0;
        var groupItemBounds = void 0;
        if (this.fields.groupBy) {
          groupItemBounds = this.curUL.querySelector("." + classNames.groupListItem).getBoundingClientRect();
        }
        if (siblingLI) {
          var siblingTop = siblingLI.getBoundingClientRect().top;
          var siblingHeight = siblingLI.getBoundingClientRect().height;
          if (!prev) {
            var height = this.isWindow ? window.innerHeight : elementHeight;
            heightDiff = this.isWindow ? siblingTop + siblingHeight : siblingTop - elementTop + siblingHeight;
            if (heightDiff > height) {
              if (this.isWindow === true) {
                window.scroll(0, pageYOffset + (heightDiff - height));
              } else {
                this.element.scrollTop = this.element.scrollTop + (heightDiff - height);
              }
            }
          } else {
            heightDiff = this.isWindow ? siblingTop : siblingTop - elementTop;
            if (heightDiff < 0) {
              if (this.isWindow === true) {
                window.scroll(0, pageYOffset + heightDiff);
              } else {
                this.element.scrollTop = this.element.scrollTop + heightDiff;
              }
            }
          }
        } else if (this.enableVirtualization && prev && this.virtualizationModule.uiFirstIndex) {
          this.onUIScrolled = function() {
            _this.onArrowKeyDown(e, prev);
            _this.onUIScrolled = void 0;
          };
          heightDiff = this.virtualizationModule.listItemHeight;
          if (this.isWindow === true) {
            window.scroll(0, pageYOffset - heightDiff);
          } else {
            this.element.scrollTop = this.element.scrollTop - heightDiff;
          }
        } else if (prev) {
          if (this.showHeader && this.headerEle) {
            var topHeight = groupItemBounds ? groupItemBounds.top : firstItemBounds.top;
            var headerBounds = this.headerEle.getBoundingClientRect();
            heightDiff = headerBounds.top < 0 ? headerBounds.height - topHeight : 0;
            if (this.isWindow === true) {
              window.scroll(0, pageYOffset - heightDiff);
            } else {
              this.element.scrollTop = 0;
            }
          } else if (this.fields.groupBy) {
            heightDiff = this.isWindow ? groupItemBounds.top < 0 ? groupItemBounds.top : 0 : elementTop - firstItemBounds.top + groupItemBounds.height;
            if (this.isWindow === true) {
              window.scroll(0, pageYOffset + heightDiff);
            } else {
              this.element.scrollTop = this.element.scrollTop - heightDiff;
            }
          }
        }
      }
    };
    ListView2.prototype.enterKeyHandler = function(e) {
      if (Object.keys(this.dataSource).length && this.curUL) {
        var hasChild = !isNullOrUndefined(this.curUL.querySelector("." + classNames.hasChild)) ? true : false;
        var li = this.curUL.querySelector("." + classNames.focused);
        if (hasChild && li) {
          li.classList.remove(classNames.focused);
          if (this.showCheckBox) {
            this.removeSelect();
            this.removeSelect(li);
            this.removeHover();
          }
          this.setSelectLI(li, e);
        }
      }
    };
    ListView2.prototype.spaceKeyHandler = function(e) {
      if (this.enable && this.showCheckBox && Object.keys(this.dataSource).length && this.curUL) {
        e.preventDefault();
        var li = this.curUL.querySelector("." + classNames.focused);
        var checkboxElement = void 0;
        var checkIcon = void 0;
        if (!isNullOrUndefined(li) && isNullOrUndefined(li.querySelector("." + classNames.checked))) {
          var args = {
            curData: void 0,
            dataSource: void 0,
            fields: void 0,
            options: void 0,
            text: void 0,
            item: li
          };
          checkboxElement = args.item.querySelector("." + classNames.checkboxWrapper);
          this.checkInternally(args, checkboxElement);
          checkIcon = checkboxElement.querySelector("." + classNames.checkboxIcon + "." + classNames.icon);
        } else {
          this.uncheckItem(li);
        }
        var eventArgs = this.selectEventData(li, e);
        merge(eventArgs, { isChecked: checkIcon ? checkIcon.classList.contains(classNames.checked) : false });
        if (!isNullOrUndefined(li)) {
          var cbElement = li.querySelector("." + classNames.checkboxWrapper);
          var checkboxIcon = li.querySelector("." + classNames.checkboxIcon);
          var isCheckedBefore = checkboxIcon.classList.contains(classNames.checked);
          var isFocusedBefore = li.classList.contains(classNames.focused);
          this.handleCheckboxState(li, checkboxIcon, cbElement, isCheckedBefore, isFocusedBefore, eventArgs, false);
        }
        this.updateSelectedId();
      }
    };
    ListView2.prototype.keyActionHandler = function(e) {
      switch (e.keyCode) {
        case 36:
          this.homeKeyHandler(e);
          break;
        case 35:
          this.homeKeyHandler(e, true);
          break;
        case 40:
          this.arrowKeyHandler(e);
          break;
        case 38:
          this.arrowKeyHandler(e, true);
          break;
        case 13:
          this.enterKeyHandler(e);
          break;
        case 8:
          if (this.showCheckBox && this.curDSLevel[this.curDSLevel.length - 1]) {
            this.uncheckAllItems();
          }
          this.back();
          break;
        case 32:
          if (isNullOrUndefined(this.targetElement) || !this.targetElement.classList.contains("e-focused")) {
            this.spaceKeyHandler(e);
          }
          break;
      }
    };
    ListView2.prototype.swipeActionHandler = function(e) {
      if (e.swipeDirection === "Right" && e.velocity > swipeVelocity && e.originalEvent.type === "touchend") {
        if (this.showCheckBox && this.curDSLevel[this.curDSLevel.length - 1]) {
          this.uncheckAllItems();
        }
        this.back();
      }
    };
    ListView2.prototype.focusout = function() {
      if (Object.keys(this.dataSource).length && this.curUL) {
        var focusedElement = this.curUL.querySelector("." + classNames.focused);
        if (focusedElement) {
          focusedElement.classList.remove(classNames.focused);
          if (!this.showCheckBox && !isNullOrUndefined(this.selectedLI)) {
            this.selectedLI.classList.add(classNames.selected);
          }
        }
      }
    };
    ListView2.prototype.wireEvents = function() {
      EventHandler.add(this.element, "keydown", this.keyActionHandler, this);
      EventHandler.add(this.element, "click", this.clickHandler, this);
      EventHandler.add(this.element, "mouseover", this.hoverHandler, this);
      EventHandler.add(this.element, "mouseout", this.leaveHandler, this);
      EventHandler.add(this.element, "focusout", this.focusout, this);
      this.touchModule = new Touch(this.element, { swipe: this.swipeActionHandler.bind(this) });
      if (!isNullOrUndefined(this.scroll)) {
        EventHandler.add(this.element, "scroll", this.onListScroll, this);
      }
    };
    ListView2.prototype.unWireEvents = function() {
      EventHandler.remove(this.element, "keydown", this.keyActionHandler);
      EventHandler.remove(this.element, "click", this.clickHandler);
      EventHandler.remove(this.element, "mouseover", this.hoverHandler);
      EventHandler.remove(this.element, "mouseout", this.leaveHandler);
      EventHandler.remove(this.element, "mouseover", this.hoverHandler);
      EventHandler.remove(this.element, "mouseout", this.leaveHandler);
      EventHandler.remove(this.element, "focusout", this.focusout);
      if (!isNullOrUndefined(this.scroll)) {
        EventHandler.remove(this.element, "scroll", this.onListScroll);
      }
      if (this.touchModule) {
        this.touchModule.destroy();
      }
      this.touchModule = null;
    };
    ListView2.prototype.removeFocus = function() {
      var focusedLI = this.element.querySelectorAll("." + classNames.focused);
      for (var _i = 0, focusedLI_1 = focusedLI; _i < focusedLI_1.length; _i++) {
        var ele = focusedLI_1[_i];
        ele.classList.remove(classNames.focused);
      }
    };
    ListView2.prototype.removeHover = function() {
      var hoverLI = this.element.querySelector("." + classNames.hover);
      if (hoverLI) {
        hoverLI.classList.remove(classNames.hover);
      }
    };
    ListView2.prototype.removeSelect = function(li) {
      if (isNullOrUndefined(li)) {
        var selectedLI = this.element.querySelectorAll("." + classNames.selected);
        for (var _i = 0, selectedLI_1 = selectedLI; _i < selectedLI_1.length; _i++) {
          var ele = selectedLI_1[_i];
          if (this.showCheckBox && ele.querySelector("." + classNames.checked)) {
            continue;
          } else {
            ele.classList.remove(classNames.selected);
          }
        }
      } else {
        li.classList.remove(classNames.selected);
      }
    };
    ListView2.prototype.isValidLI = function(li) {
      return li && li.classList.contains(classNames.listItem) && !li.classList.contains(classNames.groupListItem) && !li.classList.contains(classNames.disable);
    };
    ListView2.prototype.setCheckboxLI = function(li, e) {
      if (this.isValidLI(li) && this.enable && this.showCheckBox) {
        if (this.curUL.querySelector("." + classNames.focused)) {
          this.curUL.querySelector("." + classNames.focused).classList.remove(classNames.focused);
        }
        var textAreaFocus = li.querySelector("textarea") || li.querySelector("input");
        li.classList.add(classNames.focused);
        if (!isNullOrUndefined(e)) {
          if (e.target === textAreaFocus) {
            textAreaFocus.classList.add("e-focused");
          }
        }
        var checkboxElement = li.querySelector("." + classNames.checkboxWrapper);
        var checkIcon = checkboxElement.querySelector("." + classNames.checkboxIcon + "." + classNames.icon);
        this.removeHover();
        var isCheckedBefore = checkIcon.classList.contains(classNames.checked);
        var isFocusedBefore = li.classList.contains(classNames.focused);
        if (!isCheckedBefore) {
          checkIcon.classList.add(classNames.checked);
          li.classList.add(classNames.selected);
        } else {
          checkIcon.classList.remove(classNames.checked);
          li.classList.remove(classNames.selected);
        }
        checkboxElement.setAttribute("aria-checked", checkIcon.classList.contains(classNames.checked) ? "true" : "false");
        var eventArgs = this.selectEventData(li, e);
        merge(eventArgs, { isChecked: checkIcon.classList.contains(classNames.checked) });
        if (this.enableVirtualization) {
          this.virtualizationModule.setCheckboxLI(li, e);
        }
        this.handleCheckboxState(li, checkIcon, checkboxElement, isCheckedBefore, isFocusedBefore, eventArgs, true, textAreaFocus);
        this.setSelectedItemData(li);
        this.renderSubList(li);
      }
    };
    ListView2.prototype.selectEventData = function(li, e) {
      var data = this.getItemData(li);
      var fieldData = getFieldValues(data, this.listBaseOption.fields);
      var selectedItem;
      if (!isNullOrUndefined(data) && typeof this.dataSource[0] === "string" || typeof this.dataSource[0] === "number") {
        selectedItem = { item: li, text: li && li.innerText.trim(), data: this.dataSource };
      } else {
        selectedItem = {
          item: li,
          text: fieldData && fieldData[this.listBaseOption.fields.text],
          data
        };
      }
      var eventArgs = {};
      merge(eventArgs, selectedItem);
      if (e) {
        merge(eventArgs, {
          isInteracted: true,
          event: e,
          cancel: false,
          index: this.curUL && Array.prototype.indexOf.call(this.curUL.children, li)
        });
      }
      return eventArgs;
    };
    ListView2.prototype.setSelectedItemData = function(li) {
      var data = this.getItemData(li);
      var fieldData = getFieldValues(data, this.listBaseOption.fields);
      if (!isNullOrUndefined(data) && (typeof this.dataSource[0] === "string" || typeof this.dataSource[0] === "number")) {
        this.selectedItems = {
          item: li,
          text: li && li.innerText.trim(),
          data: this.dataSource
        };
      } else {
        this.selectedItems = {
          item: li,
          text: fieldData && fieldData[this.listBaseOption.fields.text],
          data
        };
      }
    };
    ListView2.prototype.setSelectLI = function(li, e) {
      var _this = this;
      if (this.isValidLI(li) && !li.classList.contains(classNames.selected) && this.enable) {
        if (!this.showCheckBox) {
          this.removeSelect();
        }
        li.classList.add(classNames.selected);
        this.removeHover();
        this.setSelectedItemData(li);
        if (this.enableVirtualization) {
          this.virtualizationModule.setSelectLI(li, e);
        }
        var eventArgs = this.selectEventData(li, e);
        this.trigger("select", eventArgs, function(observedArgs) {
          if (!observedArgs.cancel) {
            _this.selectedLI = li;
            _this.renderSubList(li);
          } else {
            li.classList.remove(classNames.selected);
            _this.selectedLI = li;
          }
        });
      }
    };
    ListView2.prototype.setHoverLI = function(li) {
      if (this.isValidLI(li) && !li.classList.contains(classNames.hover) && this.enable) {
        var lastLi = this.element.querySelectorAll("." + classNames.hover);
        if (lastLi && lastLi.length) {
          removeClass(lastLi, classNames.hover);
        }
        if (!li.classList.contains(classNames.selected) || this.showCheckBox) {
          li.classList.add(classNames.hover);
        }
      }
    };
    ListView2.prototype.getSubDS = function() {
      var levelKeys = this.curDSLevel;
      if (levelKeys.length) {
        var ds = this.localData;
        for (var _i = 0, levelKeys_1 = levelKeys; _i < levelKeys_1.length; _i++) {
          var key = levelKeys_1[_i];
          var field = {};
          field[this.fields.id] = key;
          this.curDSJSON = this.findItemFromDS(ds, field);
          var fieldData = getFieldValues(this.curDSJSON, this.listBaseOption.fields);
          ds = this.curDSJSON ? fieldData[this.fields.child] : ds;
        }
        return ds;
      }
      return this.localData;
    };
    ListView2.prototype.getItemData = function(li) {
      var dataSource = this.dataSource instanceof DataManager ? this.localData : this.dataSource;
      var fields = this.getElementUID(li);
      var curDS;
      if (isNullOrUndefined(this.element.querySelector("." + classNames.hasChild)) && this.fields.groupBy) {
        curDS = this.curViewDS;
      } else {
        curDS = dataSource;
      }
      return this.findItemFromDS(curDS, fields);
    };
    ListView2.prototype.findItemFromDS = function(dataSource, fields, parent) {
      var _this = this;
      var resultJSON;
      if (dataSource && dataSource.length && fields) {
        dataSource.some(function(data) {
          var fieldData = getFieldValues(data, _this.listBaseOption.fields);
          if ((fields[_this.fields.id] || fields[_this.fields.text]) && (!fields[_this.fields.id] || (!isNullOrUndefined(fieldData[_this.fields.id]) && fieldData[_this.fields.id].toString()) === fields[_this.fields.id].toString()) && (!fields[_this.fields.text] || fieldData[_this.fields.text] === fields[_this.fields.text])) {
            resultJSON = parent ? dataSource : data;
          } else if (typeof data !== "object" && dataSource.indexOf(data) !== -1) {
            resultJSON = parent ? dataSource : data;
          } else if (!isNullOrUndefined(fields[_this.fields.id]) && isNullOrUndefined(fieldData[_this.fields.id])) {
            var li = _this.element.querySelector('[data-uid="' + fields[_this.fields.id] + '"]');
            if (li && li.innerText.trim() === fieldData[_this.fields.text]) {
              resultJSON = data;
            }
          } else if (Object.prototype.hasOwnProperty.call(fieldData, _this.fields.child) && fieldData[_this.fields.child].length) {
            resultJSON = _this.findItemFromDS(fieldData[_this.fields.child], fields, parent);
          }
          return !!resultJSON;
        });
      } else {
        resultJSON = dataSource;
      }
      return resultJSON;
    };
    ListView2.prototype.getQuery = function() {
      var columns = [];
      var query = this.query ? this.query : new Query();
      if (!this.query) {
        for (var _i = 0, _a = Object.keys(this.fields.properties); _i < _a.length; _i++) {
          var column = _a[_i];
          if (column !== "tableName" && !!this.fields["" + column] && this.fields["" + column] !== ListBase.defaultMappedFields["" + column] && columns.indexOf(this.fields["" + column]) === -1) {
            columns.push(this.fields["" + column]);
          }
        }
        query.select(columns);
        if (Object.prototype.hasOwnProperty.call(this.fields.properties, "tableName")) {
          query.from(this.fields.tableName);
        }
      }
      return query;
    };
    ListView2.prototype.setViewDataSource = function(dataSource) {
      if (dataSource === void 0) {
        dataSource = this.localData;
      }
      var fieldValue = isNullOrUndefined(this.fields.sortBy) ? this.fields.text : this.fields.sortBy;
      var query = ListBase.addSorting(this.sortOrder, fieldValue);
      if (dataSource && this.fields.groupBy) {
        if (this.sortOrder !== "None") {
          this.curViewDS = ListBase.groupDataSource(ListBase.getDataSource(dataSource, query), this.listBaseOption.fields, this.sortOrder);
        } else {
          this.curViewDS = ListBase.groupDataSource(dataSource, this.listBaseOption.fields, this.sortOrder);
        }
      } else if (dataSource && this.sortOrder !== "None") {
        this.curViewDS = ListBase.getDataSource(dataSource, query);
      } else {
        this.curViewDS = dataSource;
      }
    };
    ListView2.prototype.isInAnimation = function() {
      return this.curUL.classList.contains(".e-animate");
    };
    ListView2.prototype.renderRemoteLists = function(e, listViewComponent) {
      if (this.isDestroyed) {
        return;
      }
      this.localData = e.result;
      listViewComponent.removeElement(listViewComponent.contentContainer);
      this.renderList();
      this.trigger("actionComplete", e);
    };
    ListView2.prototype.triggerActionFailure = function(e) {
      if (this.isDestroyed) {
        return;
      }
      this.trigger("actionFailure", e);
    };
    ListView2.prototype.setLocalData = function() {
      var _this = this;
      this.trigger("actionBegin");
      if (this.dataSource instanceof DataManager) {
        if (this.dataSource.ready) {
          this.dataSource.ready.then(function(e) {
            _this.isOffline = _this.dataSource.dataSource.offline;
            if (_this.dataSource instanceof DataManager && _this.isOffline) {
              _this.renderRemoteLists(e, _this);
            }
          }).catch(function(e) {
            _this.triggerActionFailure(e);
          });
        } else {
          this.dataSource.executeQuery(this.getQuery()).then(function(e) {
            _this.renderRemoteLists(e, _this);
          }).catch(function(e) {
            _this.triggerActionFailure(e);
          });
        }
      } else if (!this.dataSource || !this.dataSource.length) {
        var ul = this.element.querySelector("ul");
        if (ul) {
          remove(ul);
          this.setProperties({ dataSource: ListBase.createJsonFromElement(ul) }, true);
          this.localData = this.dataSource;
          this.renderList();
          this.trigger("actionComplete", { data: this.localData });
        }
      } else {
        this.localData = this.dataSource;
        this.renderList();
        this.trigger("actionComplete", { data: this.localData });
      }
    };
    ListView2.prototype.reRender = function() {
      this.removeElement(this.headerEle);
      this.removeElement(this.ulElement);
      this.removeElement(this.contentContainer);
      if (this.isReact) {
        this.clearTemplate();
      }
      if (Object.keys(window).indexOf("ejsInterop") === -1) {
        this.element.innerHTML = "";
      }
      this.headerEle = this.ulElement = this.liCollection = void 0;
      this.header();
      this.setLocalData();
    };
    ListView2.prototype.resetCurrentList = function() {
      this.setViewDataSource(this.curViewDS);
      this.contentContainer.innerHTML = "";
      this.createList();
      this.renderIntoDom(this.curUL);
    };
    ListView2.prototype.setAttributes = function(liElements) {
      for (var i = 0; i < liElements.length; i++) {
        var element = liElements[parseInt(i.toString(), 10)];
        if (element.classList.contains("e-list-item")) {
          element.setAttribute("id", this.element.id + "_" + element.getAttribute("data-uid"));
          element.setAttribute("tabindex", "-1");
        }
      }
    };
    ListView2.prototype.createList = function() {
      this.currentLiElements = [];
      this.isNestedList = false;
      this.ulElement = this.curUL = ListBase.createList(this.createElement, this.curViewDS, this.listBaseOption, null, this);
      this.liCollection = this.curUL.querySelectorAll("." + classNames.listItem);
      this.setAttributes(this.liCollection);
    };
    ListView2.prototype.renderSubList = function(li) {
      this.liElement = li;
      var uID = li.getAttribute("data-uid");
      if (li.classList.contains(classNames.hasChild) && uID) {
        var ul = closest(li.parentNode, "." + classNames.parentItem);
        var ele = this.element.querySelector("[pid='" + uID + "']");
        this.curDSLevel.push(uID);
        this.setViewDataSource(this.getSubDS());
        if (this.enableVirtualization) {
          this.virtualizationModule.updateDOMItemCount();
        }
        if (!ele) {
          var data = this.curViewDS;
          ele = ListBase.createListFromJson(this.createElement, data, this.listBaseOption, this.curDSLevel.length, null, this);
          if (this.isReact) {
            this.renderReactTemplates();
          }
          var lists = ele.querySelectorAll("." + classNames.listItem);
          this.setAttributes(lists);
          ele.setAttribute("pID", uID);
          ele.style.display = "none";
          this.renderIntoDom(ele);
        }
        this.switchView(ul, ele);
        this.liCollection = this.curUL.querySelectorAll("." + classNames.listItem);
        if (this.selectedItems) {
          var fieldData = getFieldValues(this.selectedItems.data, this.listBaseOption.fields);
          this.header(fieldData[this.listBaseOption.fields.text], true, "header");
        }
        this.selectedLI = void 0;
      }
    };
    ListView2.prototype.renderIntoDom = function(ele) {
      this.contentContainer.appendChild(ele);
    };
    ListView2.prototype.renderList = function(data) {
      this.setViewDataSource(data);
      if (this.enableVirtualization) {
        if (Object.keys(this.dataSource).length) {
          if ((this.template || this.groupTemplate) && !this.virtualizationModule.isNgTemplate()) {
            this.listBaseOption.itemCreated = this.virtualizationModule.createUIItem.bind(this.virtualizationModule);
          }
        }
        this.virtualizationModule.uiVirtualization();
      } else {
        this.createList();
        this.contentContainer = this.createElement("div", { className: classNames.container });
        this.element.appendChild(this.contentContainer);
        this.renderIntoDom(this.ulElement);
        if (this.isReact) {
          this.renderReactTemplates();
        }
      }
    };
    ListView2.prototype.getElementUID = function(obj) {
      var fields = {};
      if (obj instanceof Element) {
        fields[this.fields.id] = obj.getAttribute("data-uid");
      } else {
        fields = obj;
      }
      return fields;
    };
    ListView2.prototype.render = function() {
      this.element.classList.add(classNames.root);
      attributes(this.element, { tabindex: "0" });
      this.setCSSClass();
      this.setEnableRTL();
      this.setEnable();
      this.setSize();
      this.wireEvents();
      this.header();
      this.setLocalData();
      this.setHTMLAttribute();
      this.rippleFn = rippleEffect(this.element, {
        selector: "." + classNames.listItem
      });
      this.renderComplete();
      this.previousScrollTop = this.element.scrollTop;
    };
    ListView2.prototype.destroy = function() {
      if (this.isReact) {
        this.clearTemplate();
      }
      this.unWireEvents();
      var classAr = [
        classNames.root,
        classNames.disable,
        "e-rtl",
        "e-has-header",
        "e-lib"
      ].concat(this.cssClass ? this.cssClass.split(" ").filter(function(css) {
        return css;
      }) : []);
      removeClass([this.element], classAr);
      this.element.removeAttribute("role");
      this.element.removeAttribute("tabindex");
      this.curUL = this.ulElement = this.liCollection = this.headerEle = void 0;
      this.element.innerHTML = "";
      this.contentContainer = null;
      this.selectedItems = null;
      this.selectedLI = null;
      this.liElement = null;
      this.targetElement = null;
      this.currentLiElements = null;
      this.virtualCheckBox = null;
      _super.prototype.destroy.call(this);
    };
    ListView2.prototype.back = function() {
      var pID = this.curDSLevel[this.curDSLevel.length - 1];
      if (pID === void 0 || this.isInAnimation()) {
        return;
      }
      this.curDSLevel.pop();
      this.setViewDataSource(this.getSubDS());
      if (this.enableVirtualization) {
        this.virtualizationModule.updateDOMItemCount();
      }
      var toUL = this.element.querySelector("[data-uid='" + pID + "']");
      var fromUL = this.curUL;
      if (!toUL) {
        this.createList();
        this.renderIntoDom(this.ulElement);
        toUL = this.curUL;
      } else {
        toUL = toUL.parentElement;
      }
      var fieldData = getFieldValues(this.curDSJSON, this.listBaseOption.fields);
      var text = fieldData[this.fields.text];
      this.switchView(fromUL, toUL, true);
      this.removeFocus();
      var li = this.element.querySelector("[data-uid='" + pID + "']");
      li.classList.remove(classNames.disable);
      li.classList.add(classNames.focused);
      if (!(this.showCheckBox && li.querySelector("." + classNames.checkboxIcon).classList.contains(classNames.checked))) {
        li.classList.remove(classNames.selected);
      }
      this.liCollection = this.curUL.querySelectorAll("." + classNames.listItem);
      if (this.enableHtmlSanitizer) {
        this.setProperties({ headerTitle: SanitizeHtmlHelper.sanitize(this.headerTitle) }, true);
      }
      this.header(this.curDSLevel.length ? text : this.headerTitle, this.curDSLevel.length ? true : false, "header");
    };
    ListView2.prototype.selectItem = function(item) {
      if (this.enableVirtualization) {
        this.virtualizationModule.selectItem(item);
      } else if (this.showCheckBox) {
        this.setCheckboxLI(this.getLiFromObjOrElement(item));
      } else {
        if (isNullOrUndefined(item) === true) {
          this.removeSelect();
        } else {
          this.setSelectLI(this.getLiFromObjOrElement(item));
        }
      }
    };
    ListView2.prototype.unselectItem = function(item) {
      if (isNullOrUndefined(item)) {
        this.removeSelect();
      } else {
        var li = this.getLiFromObjOrElement(item);
        if (!isNullOrUndefined(li)) {
          this.removeSelect(li);
        }
      }
    };
    ListView2.prototype.getLiFromObjOrElement = function(obj) {
      var li;
      var dataSource = this.dataSource instanceof DataManager ? this.localData : this.dataSource;
      if (!isNullOrUndefined(obj)) {
        if (typeof dataSource[0] === "string" || typeof dataSource[0] === "number") {
          if (obj instanceof Element) {
            var uid = obj.getAttribute("data-uid").toString();
            for (var i = 0; i < this.liCollection.length; i++) {
              if (this.liCollection[parseInt(i.toString(), 10)].getAttribute("data-uid").toString() === uid) {
                li = this.liCollection[parseInt(i.toString(), 10)];
                break;
              }
            }
          } else {
            Array.prototype.some.call(this.curUL.querySelectorAll("." + classNames.listItem), function(item) {
              if (item.innerText.trim() === obj.toString()) {
                li = item;
                return true;
              } else {
                return false;
              }
            });
          }
        } else {
          var resultJSON = this.getItemData(obj);
          var fieldData = getFieldValues(resultJSON, this.listBaseOption.fields);
          if (resultJSON) {
            li = this.element.querySelector('[data-uid="' + fieldData[this.fields.id] + '"]');
            if (!this.enableVirtualization && isNullOrUndefined(li)) {
              var curLi = this.element.querySelectorAll("." + classNames.listItem);
              for (var i = 0; i < curLi.length; i++) {
                if (curLi[parseInt(i.toString(), 10)].innerText.trim() === fieldData[this.fields.text]) {
                  li = curLi[parseInt(i.toString(), 10)];
                }
              }
            }
          }
        }
      }
      return li;
    };
    ListView2.prototype.selectMultipleItems = function(item) {
      if (!isNullOrUndefined(item)) {
        for (var i = 0; i < item.length; i++) {
          if (!isNullOrUndefined(item[parseInt(i.toString(), 10)])) {
            this.selectItem(item[parseInt(i.toString(), 10)]);
          }
        }
      }
    };
    ListView2.prototype.getParentId = function() {
      var parentId = [];
      if (this.isNestedList) {
        for (var i = this.curDSLevel.length - 1; i >= 0; i--) {
          parentId.push(this.curDSLevel[parseInt(i.toString(), 10)]);
        }
      }
      return parentId;
    };
    ListView2.prototype.updateSelectedId = function() {
      this.selectedId = [];
      var liCollection = this.curUL.getElementsByClassName(classNames.selected);
      for (var i = 0; i < liCollection.length; i++) {
        var tempData = this.getItemData(liCollection[parseInt(i.toString(), 10)]);
        if (!isNullOrUndefined(tempData) && tempData[this.listBaseOption.fields.id]) {
          this.selectedId.push(tempData[this.listBaseOption.fields.id]);
        }
      }
    };
    ListView2.prototype.getSelectedItems = function() {
      var finalValue;
      var isCompleted = false;
      this.selectedId = [];
      var dataSource = this.dataSource instanceof DataManager ? this.localData : this.dataSource;
      if (this.enableVirtualization && !isCompleted) {
        finalValue = this.virtualizationModule.getSelectedItems();
        isCompleted = true;
      } else if (this.showCheckBox && !isCompleted) {
        var liCollection = this.curUL.getElementsByClassName(classNames.selected);
        var liTextCollection = [];
        var liDataCollection = [];
        this.selectedId = [];
        var dataParent = [];
        for (var i = 0; i < liCollection.length; i++) {
          if (typeof dataSource[0] === "string" || typeof dataSource[0] === "number") {
            liTextCollection.push(liCollection[parseInt(i.toString(), 10)].innerText.trim());
          } else {
            var tempData = this.getItemData(liCollection[parseInt(i.toString(), 10)]);
            var fieldData = getFieldValues(tempData, this.listBaseOption.fields);
            if (this.isNestedList) {
              dataParent.push({ data: tempData, parentId: this.getParentId() });
            } else {
              liDataCollection.push(tempData);
            }
            if (fieldData) {
              liTextCollection.push(fieldData[this.listBaseOption.fields.text]);
              this.selectedId.push(fieldData[this.listBaseOption.fields.id]);
            } else {
              liTextCollection.push(void 0);
              this.selectedId.push(void 0);
            }
          }
        }
        if ((typeof dataSource[0] === "string" || typeof dataSource[0] === "number") && !isCompleted) {
          finalValue = { item: liCollection, data: dataSource, text: liTextCollection };
          isCompleted = true;
        }
        if (this.isNestedList && !isCompleted) {
          finalValue = { item: liCollection, data: dataParent, text: liTextCollection };
          isCompleted = true;
        } else if (!isCompleted) {
          finalValue = { item: liCollection, data: liDataCollection, text: liTextCollection };
          isCompleted = true;
        }
      } else if (!isCompleted) {
        var liElement = this.element.getElementsByClassName(classNames.selected)[0];
        var fieldData = getFieldValues(this.getItemData(liElement), this.listBaseOption.fields);
        if ((typeof dataSource[0] === "string" || typeof dataSource[0] === "number") && !isCompleted) {
          finalValue = !isNullOrUndefined(liElement) ? {
            item: liElement,
            data: dataSource,
            text: liElement.innerText.trim()
          } : void 0;
          isCompleted = true;
        } else if (!isCompleted) {
          if (isNullOrUndefined(fieldData) || isNullOrUndefined(liElement)) {
            finalValue = void 0;
            isCompleted = true;
          } else {
            this.selectedId.push(fieldData[this.listBaseOption.fields.id]);
            finalValue = {
              text: fieldData[this.listBaseOption.fields.text],
              item: liElement,
              data: this.getItemData(liElement)
            };
            isCompleted = true;
          }
        }
      }
      return finalValue;
    };
    ListView2.prototype.findItem = function(item) {
      return this.getItemData(item);
    };
    ListView2.prototype.enableItem = function(item) {
      this.setItemState(item, true);
      if (this.enableVirtualization) {
        this.virtualizationModule.enableItem(item);
      }
    };
    ListView2.prototype.disableItem = function(item) {
      this.setItemState(item, false);
      if (this.enableVirtualization) {
        this.virtualizationModule.disableItem(item);
      }
    };
    ListView2.prototype.setItemState = function(item, isEnable) {
      var resultJSON = this.getItemData(item);
      var fieldData = getFieldValues(resultJSON, this.listBaseOption.fields);
      if (resultJSON) {
        var li = this.element.querySelector('[data-uid="' + fieldData[this.fields.id] + '"]');
        if (isEnable) {
          if (li) {
            li.classList.remove(classNames.disable);
          }
          delete resultJSON[this.fields.enabled];
        } else if (!isEnable) {
          if (li) {
            li.classList.add(classNames.disable);
          }
          resultJSON[this.fields.enabled] = false;
        }
      }
    };
    ListView2.prototype.showItem = function(item) {
      this.showHideItem(item, false, "");
      if (this.enableVirtualization) {
        this.virtualizationModule.showItem(item);
      }
    };
    ListView2.prototype.hideItem = function(item) {
      this.showHideItem(item, true, "none");
      if (this.enableVirtualization) {
        this.virtualizationModule.hideItem(item);
      }
    };
    ListView2.prototype.showHideItem = function(obj, isHide, display) {
      var resultJSON = this.getItemData(obj);
      var fieldData = getFieldValues(resultJSON, this.listBaseOption.fields);
      if (resultJSON) {
        var li = this.element.querySelector('[data-uid="' + fieldData[this.fields.id] + '"]');
        if (li) {
          li.style.display = display;
        }
        if (isHide) {
          resultJSON[this.fields.isVisible] = false;
        } else {
          delete resultJSON[this.fields.isVisible];
        }
      }
    };
    ListView2.prototype.addItem = function(data, fields, index) {
      if (fields === void 0) {
        fields = void 0;
      }
      var dataSource = this.dataSource instanceof DataManager ? this.localData : this.dataSource;
      this.addItemInternally(data, fields, dataSource, index);
    };
    ListView2.prototype.addItemInternally = function(data, fields, dataSource, index) {
      if (data instanceof Array) {
        if (this.enableVirtualization) {
          this.virtualizationModule.addItem(data, fields, dataSource, index);
        } else {
          var ds = this.findItemFromDS(dataSource, fields);
          var child = void 0;
          if (ds) {
            var fieldData = getFieldValues(ds, this.listBaseOption.fields);
            child = fieldData[this.fields.child];
            if (!child) {
              child = [];
            }
            child = child.concat(data);
          }
          if (ds instanceof Array) {
            for (var i = 0; i < data.length; i++) {
              dataSource = this.addItemAtIndex(index, dataSource, data[parseInt(i.toString(), 10)]);
              this.setViewDataSource(dataSource);
              var targetUL = this.contentContainer ? this.contentContainer.children[0] : null;
              if (this.contentContainer && targetUL) {
                this.addItemIntoDom(data[parseInt(i.toString(), 10)], targetUL, this.curViewDS);
              } else {
                this.reRender();
              }
            }
            this.liCollection = this.curUL.querySelectorAll("." + classNames.listItem);
          } else {
            if (ds) {
              ds[this.fields.child] = child;
              this.addItemInNestedList(ds, data);
            }
          }
        }
      }
    };
    ListView2.prototype.addItemAtIndex = function(index, newDataSource, itemData) {
      var isIndexValid = !isNullOrUndefined(index) && index >= 0 && index < newDataSource.length && isNullOrUndefined(this.listBaseOption.fields.groupBy);
      if (isIndexValid) {
        newDataSource.splice(index, 0, itemData);
      } else {
        newDataSource.push(itemData);
      }
      return newDataSource;
    };
    ListView2.prototype.addItemInNestedList = function(targetItemData, itemQueue) {
      var targetItemId = targetItemData[this.fields.id];
      var targetChildDS = targetItemData[this.fields.child];
      var isAlreadyRenderedUL = this.element.querySelector("[pid='" + targetItemId + "']");
      var targetLi = this.element.querySelector("[data-uid='" + targetItemId + "']");
      var targetUL = isAlreadyRenderedUL ? isAlreadyRenderedUL : targetLi ? closest(targetLi, "ul") : null;
      var targetDS = isAlreadyRenderedUL ? targetChildDS : [targetItemData];
      var isTargetEmptyChild = targetLi ? !targetLi.classList.contains(classNames.hasChild) : false;
      if (isTargetEmptyChild) {
        var targetRefreshedElement = ListBase.createListItemFromJson(this.createElement, targetDS, this.listBaseOption, null, null, this);
        this.setAttributes(targetRefreshedElement);
        targetUL.insertBefore(targetRefreshedElement[0], targetLi);
        detach(targetLi);
      }
      if (isAlreadyRenderedUL && itemQueue) {
        for (var i = 0; i < itemQueue.length; i++) {
          targetDS.push(itemQueue[parseInt(i.toString(), 10)]);
          this.addItemIntoDom(itemQueue[parseInt(i.toString(), 10)], targetUL, targetDS);
        }
      }
    };
    ListView2.prototype.addItemIntoDom = function(currentItem, targetUL, curViewDS) {
      var index = curViewDS.indexOf(currentItem);
      this.addListItem(currentItem, index, targetUL, curViewDS);
      var curItemDS = curViewDS[index - 1];
      if (curItemDS && curItemDS.isHeader && curItemDS.items.length === 1) {
        this.addListItem(curItemDS, index - 1, targetUL, curViewDS);
      }
    };
    ListView2.prototype.addListItem = function(dataSource, index, ulElement, curViewDS) {
      var target = this.getLiFromObjOrElement(curViewDS[index + 1]) || this.getLiFromObjOrElement(curViewDS[index + 2]) || null;
      var li = ListBase.createListItemFromJson(this.createElement, [dataSource], this.listBaseOption, null, null, this);
      this.setAttributes(li);
      if (this.template && this.isReact) {
        this.renderReactTemplates();
      }
      if (this.fields.groupBy && curViewDS[index + 1] && curViewDS[index + 1].isHeader) {
        var targetEle = this.getLiFromObjOrElement(curViewDS[index - 1]);
        if (targetEle) {
          target = targetEle.nextElementSibling;
        }
      }
      ulElement.insertBefore(li[0], target);
    };
    ListView2.prototype.removeItem = function(item) {
      var listDataSource = this.dataSource instanceof DataManager ? this.localData : this.dataSource;
      if (this.enableVirtualization) {
        this.virtualizationModule.removeItem(item);
      } else {
        this.removeItemFromList(item, listDataSource);
      }
    };
    ListView2.prototype.removeItemFromList = function(obj, listDataSource) {
      var _this = this;
      var curViewDS = this.curViewDS;
      var fields = obj instanceof Element ? this.getElementUID(obj) : obj;
      var dataSource = this.findItemFromDS(listDataSource, fields, true);
      if (dataSource) {
        var data_1 = this.findItemFromDS(dataSource, fields);
        var index = curViewDS.indexOf(data_1);
        var li = this.getLiFromObjOrElement(obj);
        var groupLi = void 0;
        this.validateNestedView(li);
        if (this.fields.groupBy && this.curViewDS[index - 1] && curViewDS[index - 1].isHeader && curViewDS[index - 1].items.length === 1) {
          if (li && li.previousElementSibling.classList.contains(classNames.groupListItem) && (isNullOrUndefined(li.nextElementSibling) || li.nextElementSibling && li.nextElementSibling.classList.contains(classNames.groupListItem))) {
            groupLi = li.previousElementSibling;
          }
        }
        if (li) {
          detach(li);
        }
        if (groupLi) {
          detach(groupLi);
        }
        var foundData = dataSource.length - 1 <= 0 ? this.findParent(this.localData, this.fields.id, function(value) {
          return value === data_1[_this.fields.id];
        }, null) : null;
        var dsIndex = dataSource.indexOf(data_1);
        dataSource.splice(dsIndex, 1);
        this.setViewDataSource(listDataSource);
        if (foundData && foundData.parent && Array.isArray(foundData.parent[this.fields.child]) && foundData.parent[this.fields.child].length <= 0) {
          var parentLi = this.getLiFromObjOrElement(foundData.parent);
          if (parentLi) {
            var li_1 = ListBase.createListItemFromJson(this.createElement, [foundData.parent], this.listBaseOption, null, null, this);
            this.setAttributes(li_1);
            parentLi.parentElement.insertBefore(li_1[0], parentLi);
            parentLi.parentElement.removeChild(parentLi);
          }
        }
        if (dataSource.length <= 0) {
          this.back();
        }
        this.liCollection = Array.prototype.slice.call(this.element.querySelectorAll("." + classNames.listItem));
      }
    };
    ListView2.prototype.validateNestedView = function(li) {
      var liID = li ? li.getAttribute("data-uid").toString().toLowerCase() : null;
      if (liID && this.curDSLevel && this.curDSLevel.length > 0) {
        while (this.curDSLevel.some(function(id) {
          return id.toString().toLowerCase() === liID;
        })) {
          this.back();
        }
      }
    };
    ListView2.prototype.removeMultipleItems = function(item) {
      if (item.length) {
        for (var i = 0; i < item.length; i++) {
          this.removeItem(item[parseInt(i.toString(), 10)]);
        }
      }
    };
    ListView2.prototype.findParent = function(dataSource, id, callback, parent) {
      if (Object.prototype.hasOwnProperty.call(dataSource, id) && callback(dataSource[id]) === true) {
        return extend({}, dataSource);
      }
      for (var i = 0; i < Object.keys(dataSource).length; i++) {
        if (dataSource[Object.keys(dataSource)[parseInt(i.toString(), 10)]] && typeof dataSource[Object.keys(dataSource)[parseInt(i.toString(), 10)]] === "object") {
          var result = this.findParent(dataSource[Object.keys(dataSource)[parseInt(i.toString(), 10)]], id, callback, dataSource);
          if (result != null) {
            if (!result.parent) {
              result.parent = parent;
            }
            return result;
          }
        }
      }
      return null;
    };
    ListView2.prototype.getModuleName = function() {
      return "listview";
    };
    ListView2.prototype.requiredModules = function() {
      var modules = [];
      if (this.enableVirtualization) {
        modules.push({ args: [this], member: "virtualization", name: "Virtualization" });
      }
      return modules;
    };
    ListView2.prototype.onListScroll = function(e) {
      var args = { originalEvent: e, scrollDirection: "Bottom", distanceY: this.element.scrollHeight - this.element.scrollTop };
      var currentScrollTop = this.element.scrollTop;
      if (currentScrollTop > this.previousScrollTop) {
        args.scrollDirection = "Bottom";
        args.distanceY = this.element.scrollHeight - this.element.clientHeight - this.element.scrollTop;
        this.trigger("scroll", args);
      } else if (this.previousScrollTop > currentScrollTop) {
        args.scrollDirection = "Top";
        args.distanceY = this.element.scrollTop;
        this.trigger("scroll", args);
      }
      this.previousScrollTop = currentScrollTop;
    };
    ListView2.prototype.getPersistData = function() {
      return this.addOnPersist([
        "cssClass",
        "enableRtl",
        "htmlAttributes",
        "enable",
        "fields",
        "animation",
        "headerTitle",
        "sortOrder",
        "showIcon",
        "height",
        "width",
        "showCheckBox",
        "checkBoxPosition",
        "selectedId"
      ]);
    };
    __decorate2([
      Property("")
    ], ListView2.prototype, "cssClass", void 0);
    __decorate2([
      Property(false)
    ], ListView2.prototype, "enableVirtualization", void 0);
    __decorate2([
      Property({})
    ], ListView2.prototype, "htmlAttributes", void 0);
    __decorate2([
      Property(true)
    ], ListView2.prototype, "enable", void 0);
    __decorate2([
      Property([])
    ], ListView2.prototype, "dataSource", void 0);
    __decorate2([
      Property()
    ], ListView2.prototype, "query", void 0);
    __decorate2([
      Complex(ListBase.defaultMappedFields, FieldSettings)
    ], ListView2.prototype, "fields", void 0);
    __decorate2([
      Property({ effect: "SlideLeft", duration: 400, easing: "ease" })
    ], ListView2.prototype, "animation", void 0);
    __decorate2([
      Property("None")
    ], ListView2.prototype, "sortOrder", void 0);
    __decorate2([
      Property(false)
    ], ListView2.prototype, "showIcon", void 0);
    __decorate2([
      Property(false)
    ], ListView2.prototype, "showCheckBox", void 0);
    __decorate2([
      Property("Left")
    ], ListView2.prototype, "checkBoxPosition", void 0);
    __decorate2([
      Property("")
    ], ListView2.prototype, "headerTitle", void 0);
    __decorate2([
      Property(false)
    ], ListView2.prototype, "showHeader", void 0);
    __decorate2([
      Property(true)
    ], ListView2.prototype, "enableHtmlSanitizer", void 0);
    __decorate2([
      Property("")
    ], ListView2.prototype, "height", void 0);
    __decorate2([
      Property("")
    ], ListView2.prototype, "width", void 0);
    __decorate2([
      Property(null)
    ], ListView2.prototype, "template", void 0);
    __decorate2([
      Property(null)
    ], ListView2.prototype, "headerTemplate", void 0);
    __decorate2([
      Property(null)
    ], ListView2.prototype, "groupTemplate", void 0);
    __decorate2([
      Event()
    ], ListView2.prototype, "select", void 0);
    __decorate2([
      Event()
    ], ListView2.prototype, "actionBegin", void 0);
    __decorate2([
      Event()
    ], ListView2.prototype, "actionComplete", void 0);
    __decorate2([
      Event()
    ], ListView2.prototype, "actionFailure", void 0);
    __decorate2([
      Event()
    ], ListView2.prototype, "scroll", void 0);
    ListView2 = __decorate2([
      NotifyPropertyChanges
    ], ListView2);
    return ListView2;
  })(Component)
);

// node_modules/@syncfusion/ej2-lists/src/list-view/virtualization.js
var listElementCount = 1.5;
var windowElementCount = 3;
var Virtualization = (
  /** @class */
  (function() {
    function Virtualization2(instance) {
      this.elementDifference = 0;
      this.listViewInstance = instance;
    }
    Virtualization2.prototype.isNgTemplate = function() {
      return !isNullOrUndefined(this.listViewInstance.templateRef) && typeof this.listViewInstance.templateRef !== "string";
    };
    Virtualization2.prototype.isVueFunctionTemplate = function() {
      return this.listViewInstance.isVue && typeof this.listViewInstance.template === "function";
    };
    Virtualization2.prototype.uiVirtualization = function() {
      this.wireScrollEvent(false);
      var curViewDS = this.listViewInstance.curViewDS;
      var isRendered = this.listViewInstance.isRendered;
      var firstIndex = isRendered && !isNullOrUndefined(this.uiFirstIndex) && this.uiLastIndex <= Object.keys(curViewDS).length ? this.uiFirstIndex : 0;
      var firstDs = curViewDS.slice(firstIndex, firstIndex + 1);
      this.listViewInstance.ulElement = this.listViewInstance.curUL = ListBase.createList(this.listViewInstance.createElement, firstDs, this.listViewInstance.listBaseOption, null, this.listViewInstance);
      this.listViewInstance.contentContainer = this.listViewInstance.createElement("div", { className: classNames.container });
      this.listViewInstance.element.appendChild(this.listViewInstance.contentContainer);
      this.listViewInstance.contentContainer.appendChild(this.listViewInstance.ulElement);
      this.listItemHeight = this.listViewInstance.ulElement.firstElementChild.getBoundingClientRect().height;
      this.expectedDomItemCount = this.ValidateItemCount(1e4);
      this.updateDOMItemCount();
      var lastIndex = isRendered && !isNullOrUndefined(this.uiLastIndex) && this.listDiff !== 0 ? this.uiLastIndex : this.domItemCount - 1;
      this.uiFirstIndex = firstIndex;
      this.uiLastIndex = lastIndex;
      var otherDs = curViewDS.slice(firstIndex + 1, lastIndex + 1);
      var listItems = ListBase.createListItemFromJson(this.listViewInstance.createElement, otherDs, this.listViewInstance.listBaseOption, null, null, this.listViewInstance);
      append(listItems, this.listViewInstance.ulElement);
      this.listViewInstance.liCollection = this.listViewInstance.curUL.querySelectorAll("li");
      this.topElement = this.listViewInstance.createElement("div");
      this.listViewInstance.ulElement.insertBefore(this.topElement, this.listViewInstance.ulElement.firstElementChild);
      this.bottomElement = this.listViewInstance.createElement("div");
      this.listViewInstance.ulElement.insertBefore(this.bottomElement, null);
      this.totalHeight = Object.keys(curViewDS).length * this.listItemHeight - this.domItemCount * this.listItemHeight;
      this.topElement.style.height = isRendered ? this.topElementHeight + "px" : "0px";
      this.bottomElement.style.height = isRendered ? this.totalHeight - this.topElementHeight + "px" : this.totalHeight + "px";
      this.topElementHeight = isRendered ? this.topElementHeight : 0;
      this.bottomElementHeight = isRendered ? this.totalHeight - this.topElementHeight : this.totalHeight;
      this.listDiff = isRendered && Object.keys(curViewDS).length !== this.domItemCount ? this.listDiff : 0;
      if (isRendered) {
        this.listViewInstance.element.scrollTop = this.listViewInstance.previousScrollTop;
      }
      this.uiIndicesInitialization();
    };
    Virtualization2.prototype.wireScrollEvent = function(destroy) {
      if (!destroy) {
        if (this.listViewInstance.isWindow) {
          this.onVirtualScroll = this.onVirtualUiScroll.bind(this);
          window.addEventListener("scroll", this.onVirtualScroll);
        } else {
          EventHandler.add(this.listViewInstance.element, "scroll", this.onVirtualUiScroll, this);
        }
      } else {
        if (this.listViewInstance.isWindow === true) {
          window.removeEventListener("scroll", this.onVirtualScroll);
          window.removeEventListener("scroll", this.updateUl);
        } else {
          EventHandler.remove(this.listViewInstance.element, "scroll", this.onVirtualUiScroll);
        }
      }
    };
    Virtualization2.prototype.ValidateItemCount = function(dataSourceLength) {
      var height = parseFloat(formatUnit(this.listViewInstance.height));
      var itemCount;
      if (this.listViewInstance.isWindow) {
        itemCount = Math.round(window.innerHeight / this.listItemHeight * windowElementCount);
      } else {
        if (typeof this.listViewInstance.height === "string" && this.listViewInstance.height.indexOf("%") !== -1) {
          itemCount = Math.round(this.listViewInstance.element.getBoundingClientRect().height / this.listItemHeight * listElementCount);
        } else {
          itemCount = Math.round(height / this.listItemHeight * listElementCount);
        }
      }
      if (itemCount > dataSourceLength) {
        itemCount = dataSourceLength;
      }
      return itemCount;
    };
    Virtualization2.prototype.updateDOMItemCount = function() {
      this.domItemCount = this.ValidateItemCount(Object.keys(this.listViewInstance.curViewDS).length);
    };
    Virtualization2.prototype.uiIndicesInitialization = function() {
      this.uiIndices = { "activeIndices": [], "disabledItemIndices": [], "hiddenItemIndices": [] };
      var data = this.listViewInstance.curViewDS;
      for (var i = 0; i < data.length; i++) {
        if (this.listViewInstance.showCheckBox && data[i][this.listViewInstance.fields.isChecked]) {
          this.uiIndices.activeIndices.push(i);
        }
        if (!isNullOrUndefined(data[parseInt(i.toString(), 10)][this.listViewInstance.fields.enabled]) && !data[i][this.listViewInstance.fields.enabled]) {
          this.uiIndices.disabledItemIndices.push(i);
        }
      }
      if (this.isNgTemplate()) {
        var items = this.listViewInstance.element.querySelectorAll("." + classNames.listItem);
        for (var index = 0; index < items.length; index++) {
          items[index].context = this.listViewInstance.viewContainerRef.get(index).context;
        }
      }
    };
    Virtualization2.prototype.refreshItemHeight = function() {
      if (this.listViewInstance.curViewDS.length) {
        var curViewDS = this.listViewInstance.curViewDS;
        this.listItemHeight = this.topElement.nextSibling.getBoundingClientRect().height;
        this.totalHeight = Object.keys(curViewDS).length * this.listItemHeight - this.domItemCount * this.listItemHeight;
        this.bottomElementHeight = this.totalHeight;
        this.bottomElement.style.height = this.totalHeight + "px";
      }
    };
    Virtualization2.prototype.getscrollerHeight = function(startingHeight) {
      return this.listViewInstance.isWindow ? pageYOffset - startingHeight <= 0 ? 0 : pageYOffset - startingHeight : this.listViewInstance.element.scrollTop - startingHeight <= 0 ? 0 : this.listViewInstance.element.scrollTop - startingHeight;
    };
    Virtualization2.prototype.onVirtualUiScroll = function() {
      var _a;
      var startingHeight;
      var curViewDS = this.listViewInstance.curViewDS;
      this.listItemHeight = select(".e-list-item", this.listViewInstance.element).getBoundingClientRect().height;
      this.totalHeight = Object.keys(curViewDS).length * this.listItemHeight - this.domItemCount * this.listItemHeight;
      if (this.listViewInstance.isWindow) {
        startingHeight = this.listViewInstance.ulElement.getBoundingClientRect().top - document.documentElement.getBoundingClientRect().top;
      } else {
        startingHeight = this.listViewInstance.headerEle ? this.listViewInstance.headerEle.getBoundingClientRect().height : 0;
      }
      this.scrollPosition = isNullOrUndefined(this.scrollPosition) ? 0 : this.scrollPosition;
      var scroll = this.getscrollerHeight(startingHeight);
      this.topElementHeight = this.listItemHeight * Math.floor(scroll / this.listItemHeight);
      this.bottomElementHeight = this.totalHeight - this.topElementHeight;
      _a = scroll <= this.totalHeight ? [this.topElementHeight, this.bottomElementHeight] : [this.totalHeight, 0], this.topElementHeight = _a[0], this.bottomElementHeight = _a[1];
      if (this.topElementHeight !== parseFloat(this.topElement.style.height)) {
        this.topElement.style.height = this.topElementHeight + "px";
        this.bottomElement.style.height = this.bottomElementHeight + "px";
        if (scroll > this.scrollPosition) {
          var listDiff = Math.round(this.topElementHeight / this.listItemHeight - this.listDiff);
          if (listDiff > this.expectedDomItemCount + 5) {
            this.onLongScroll(listDiff, true);
          } else {
            this.onNormalScroll(listDiff, true);
          }
        } else {
          var listDiff = Math.round(this.listDiff - this.topElementHeight / this.listItemHeight);
          if (listDiff > this.expectedDomItemCount + 5) {
            this.onLongScroll(listDiff, false);
          } else {
            this.onNormalScroll(listDiff, false);
          }
        }
      }
      this.listDiff = Math.round(this.topElementHeight / this.listItemHeight);
      if (typeof this.listViewInstance.onUIScrolled === "function") {
        this.listViewInstance.onUIScrolled();
      }
      this.scrollPosition = scroll;
    };
    Virtualization2.prototype.onLongScroll = function(listDiff, isScrollingDown) {
      var index = isScrollingDown ? this.uiFirstIndex + listDiff : this.uiFirstIndex - listDiff;
      var elements = this.listViewInstance.ulElement.querySelectorAll("li");
      for (var i = 0; i < elements.length; i++) {
        this.updateUI(elements[i], index);
        index++;
      }
      this.uiLastIndex = isScrollingDown ? this.uiLastIndex + listDiff : this.uiLastIndex - listDiff;
      this.uiFirstIndex = isScrollingDown ? this.uiFirstIndex + listDiff : this.uiFirstIndex - listDiff;
    };
    Virtualization2.prototype.onNormalScroll = function(listDiff, isScrollingDown) {
      if (isScrollingDown) {
        for (var i = 0; i < listDiff; i++) {
          var index = ++this.uiLastIndex;
          this.updateUI(this.topElement.nextElementSibling, index, this.bottomElement);
          this.uiFirstIndex++;
        }
      } else {
        for (var i = 0; i < listDiff; i++) {
          var index = --this.uiFirstIndex;
          var target = this.topElement.nextSibling;
          this.updateUI(this.bottomElement.previousElementSibling, index, target);
          this.uiLastIndex--;
        }
      }
    };
    Virtualization2.prototype.updateUiContent = function(element, index) {
      var curViewDs = this.listViewInstance.curViewDS;
      if (typeof this.listViewInstance.dataSource[0] === "string" || typeof this.listViewInstance.dataSource[0] === "number") {
        element.dataset.uid = ListBase.generateId();
        element.getElementsByClassName(classNames.listItemText)[0].innerHTML = this.listViewInstance.curViewDS[index].toString();
      } else {
        element.dataset.uid = curViewDs[parseInt(index.toString(), 10)][this.listViewInstance.fields.id] ? curViewDs[parseInt(index.toString(), 10)][this.listViewInstance.fields.id] : ListBase.generateId();
        element.getElementsByClassName(classNames.listItemText)[0].innerHTML = curViewDs[parseInt(index.toString(), 10)][this.listViewInstance.fields.text];
      }
      if (this.listViewInstance.showIcon) {
        if (element.querySelector("." + classNames.listIcon)) {
          detach(element.querySelector("." + classNames.listIcon));
        }
        if (this.listViewInstance.curViewDS[index][this.listViewInstance.fields.iconCss]) {
          var textContent = element.querySelector("." + classNames.textContent);
          var curViewDS = this.listViewInstance.curViewDS[index];
          var iconCss = curViewDS[this.listViewInstance.fields.iconCss].toString();
          var target = this.listViewInstance.createElement("div", {
            className: classNames.listIcon + " " + iconCss
          });
          textContent.insertBefore(target, element.querySelector("." + classNames.listItemText));
        }
      }
      if (this.listViewInstance.showCheckBox && this.listViewInstance.fields.groupBy) {
        if (!this.checkListWrapper) {
          this.checkListWrapper = this.listViewInstance.curUL.querySelector("." + classNames.checkboxWrapper).cloneNode(true);
        }
        var textContent = element.querySelector("." + classNames.textContent);
        if (this.listViewInstance.curViewDS[index].isHeader) {
          if (element.querySelector("." + classNames.checkboxWrapper)) {
            element.classList.remove(classNames.checklist);
            textContent.classList.remove(classNames.checkbox);
            detach(element.querySelector("." + classNames.checkboxWrapper));
          }
        } else {
          if (!element.querySelector("." + classNames.checkboxWrapper)) {
            element.classList.add(classNames.checklist);
            textContent.classList.add(classNames.checkbox);
            if (this.listViewInstance.checkBoxPosition === "Left") {
              textContent.classList.add("e-checkbox-left");
            } else {
              textContent.classList.add("e-checkbox-right");
            }
            textContent.append(this.checkListWrapper.cloneNode(true));
          }
        }
      }
    };
    Virtualization2.prototype.changeElementAttributes = function(element, index) {
      element.classList.remove(classNames.disable);
      if (this.uiIndices.disabledItemIndices.length && this.uiIndices.disabledItemIndices.indexOf(index) !== -1) {
        element.classList.add(classNames.disable);
      }
      element.style.display = "";
      if (this.uiIndices.hiddenItemIndices.length && this.uiIndices.hiddenItemIndices.indexOf(index) !== -1) {
        element.style.display = "none";
      }
      if (this.listViewInstance.showCheckBox) {
        var checklistElement = element.querySelector("." + classNames.checkboxWrapper);
        element.classList.remove(classNames.selected);
        element.classList.remove(classNames.focused);
        if (checklistElement) {
          checklistElement.removeAttribute("aria-checked");
          checklistElement.firstElementChild.classList.remove(classNames.checked);
        }
        if (this.uiIndices.activeIndices.length && this.uiIndices.activeIndices.indexOf(index) !== -1 && !this.listViewInstance.curUL.querySelector(classNames.selected)) {
          element.classList.add(classNames.selected);
          checklistElement.firstElementChild.classList.add(classNames.checked);
          checklistElement.setAttribute("aria-checked", "true");
          if (this.activeIndex === index) {
            element.classList.add(classNames.focused);
          }
        }
      } else {
        element.classList.remove(classNames.selected);
        element.removeAttribute("aria-selected");
        if (!isNullOrUndefined(this.activeIndex) && this.activeIndex === index && !this.listViewInstance.curUL.querySelector(classNames.selected)) {
          element.classList.add(classNames.selected);
          element.setAttribute("aria-selected", "true");
        }
      }
      if (this.listViewInstance.fields.groupBy) {
        if (this.listViewInstance.curViewDS[index].isHeader) {
          if (element.classList.contains(classNames.listItem)) {
            element.classList.remove(classNames.listItem);
            element.setAttribute("role", "group");
            element.classList.add(classNames.groupListItem);
          }
        } else {
          if (element.classList.contains(classNames.groupListItem)) {
            element.classList.remove(classNames.groupListItem);
            element.setAttribute("role", "listitem");
            element.classList.add(classNames.listItem);
          }
        }
      }
    };
    Virtualization2.prototype.findDSAndIndexFromId = function(ds, fields) {
      var _this = this;
      var resultJSON = {};
      fields = this.listViewInstance.getElementUID(fields);
      if (!isNullOrUndefined(fields)) {
        ds.some(function(data, index) {
          if (fields[_this.listViewInstance.fields.id] && fields[_this.listViewInstance.fields.id] === (data[_this.listViewInstance.fields.id] && data[_this.listViewInstance.fields.id]) || fields === data) {
            resultJSON.index = index;
            resultJSON.data = data;
            return true;
          } else {
            return false;
          }
        });
      }
      return resultJSON;
    };
    Virtualization2.prototype.getSelectedItems = function() {
      var _this = this;
      if (!isNullOrUndefined(this.activeIndex) || this.listViewInstance.showCheckBox && this.uiIndices.activeIndices.length) {
        var dataCollection = [];
        var textCollection = [];
        if (typeof this.listViewInstance.dataSource[0] === "string" || typeof this.listViewInstance.dataSource[0] === "number") {
          var curViewDS_1 = this.listViewInstance.curViewDS;
          if (this.listViewInstance.showCheckBox) {
            var indices = this.uiIndices.activeIndices;
            for (var i = 0; i < indices.length; i++) {
              dataCollection.push(curViewDS_1[indices[i]]);
            }
            return {
              text: dataCollection,
              data: dataCollection,
              index: this.uiIndices.activeIndices.map(function(index) {
                return _this.listViewInstance.dataSource.indexOf(curViewDS_1[index]);
              })
            };
          } else {
            return {
              text: curViewDS_1[this.activeIndex],
              data: curViewDS_1[this.activeIndex],
              index: this.listViewInstance.dataSource.indexOf(curViewDS_1[this.activeIndex])
            };
          }
        } else {
          var curViewDS_2 = this.listViewInstance.curViewDS;
          var text = this.listViewInstance.fields.text;
          if (this.listViewInstance.showCheckBox) {
            var indexArray = this.uiIndices.activeIndices;
            for (var i = 0; i < indexArray.length; i++) {
              textCollection.push(curViewDS_2[indexArray[i]]["" + text]);
              dataCollection.push(curViewDS_2[indexArray[parseInt(i.toString(), 10)]]);
            }
            var dataSource_1 = this.listViewInstance.dataSource instanceof DataManager ? curViewDS_2 : this.listViewInstance.dataSource;
            return {
              text: textCollection,
              data: dataCollection,
              index: this.uiIndices.activeIndices.map(function(index) {
                return dataSource_1.indexOf(curViewDS_2[index]);
              })
            };
          } else {
            var dataSource = this.listViewInstance.dataSource instanceof DataManager ? curViewDS_2 : this.listViewInstance.dataSource;
            return {
              text: curViewDS_2[this.activeIndex][this.listViewInstance.fields.text],
              data: curViewDS_2[this.activeIndex],
              index: dataSource.indexOf(curViewDS_2[this.activeIndex])
            };
          }
        }
      } else {
        return void 0;
      }
    };
    Virtualization2.prototype.selectItem = function(obj) {
      var _this = this;
      var resutJSON = this.findDSAndIndexFromId(this.listViewInstance.curViewDS, obj);
      if (Object.keys(resutJSON).length) {
        var isSelected = this.activeIndex === resutJSON.index;
        var isChecked_1;
        this.activeIndex = resutJSON.index;
        if (this.listViewInstance.showCheckBox) {
          if (this.uiIndices.activeIndices.indexOf(resutJSON.index) === -1) {
            isChecked_1 = true;
            this.uiIndices.activeIndices.push(resutJSON.index);
          } else {
            isChecked_1 = false;
            this.uiIndices.activeIndices.splice(this.uiIndices.activeIndices.indexOf(resutJSON.index), 1);
          }
          if (this.listViewInstance.curUL.querySelector("." + classNames.focused)) {
            this.listViewInstance.curUL.querySelector("." + classNames.focused).classList.remove(classNames.focused);
          }
        }
        if (this.listViewInstance.getLiFromObjOrElement(obj)) {
          if (this.listViewInstance.showCheckBox) {
            this.listViewInstance.setCheckboxLI(this.listViewInstance.getLiFromObjOrElement(obj));
          } else {
            this.listViewInstance.setSelectLI(this.listViewInstance.getLiFromObjOrElement(obj));
          }
        } else {
          var eventArgs_1;
          if (typeof this.listViewInstance.dataSource[0] === "string" || typeof this.listViewInstance.dataSource[0] === "number") {
            eventArgs_1 = {
              text: this.listViewInstance.curViewDS[this.activeIndex],
              data: this.listViewInstance.curViewDS[this.activeIndex],
              index: this.activeIndex
            };
          } else {
            var curViewDS = this.listViewInstance.curViewDS;
            eventArgs_1 = {
              text: curViewDS[this.activeIndex][this.listViewInstance.fields.text],
              data: curViewDS[this.activeIndex],
              index: this.activeIndex
            };
          }
          if (this.listViewInstance.showCheckBox) {
            this.listViewInstance.trigger("select", eventArgs_1, function(observedArgs) {
              if (observedArgs.cancel) {
                if (!isChecked_1) {
                  eventArgs_1.isChecked = isChecked_1;
                  _this.uiIndices.activeIndices.push(resutJSON.index);
                } else {
                  eventArgs_1.isChecked = !isChecked_1;
                  _this.uiIndices.activeIndices.splice(_this.uiIndices.activeIndices.indexOf(resutJSON.index), 1);
                }
              }
            });
          } else if (!isSelected) {
            this.listViewInstance.removeSelect();
            this.listViewInstance.trigger("select", eventArgs_1, function(observedArgs) {
              if (observedArgs.cancel) {
                _this.activeIndex = void 0;
              }
            });
          }
        }
      } else if (isNullOrUndefined(obj) && !this.listViewInstance.showCheckBox) {
        this.listViewInstance.removeSelect();
        this.activeIndex = void 0;
      }
    };
    Virtualization2.prototype.enableItem = function(obj) {
      var resutJSON = this.findDSAndIndexFromId(this.listViewInstance.curViewDS, obj);
      if (Object.keys(resutJSON).length) {
        this.uiIndices.disabledItemIndices.splice(this.uiIndices.disabledItemIndices.indexOf(resutJSON.index), 1);
      }
    };
    Virtualization2.prototype.disableItem = function(obj) {
      var resutJSON = this.findDSAndIndexFromId(this.listViewInstance.curViewDS, obj);
      if (Object.keys(resutJSON).length && this.uiIndices.disabledItemIndices.indexOf(resutJSON.index) === -1) {
        this.uiIndices.disabledItemIndices.push(resutJSON.index);
      }
    };
    Virtualization2.prototype.showItem = function(obj) {
      var resutJSON = this.findDSAndIndexFromId(this.listViewInstance.curViewDS, obj);
      if (Object.keys(resutJSON).length) {
        this.uiIndices.hiddenItemIndices.splice(this.uiIndices.hiddenItemIndices.indexOf(resutJSON.index), 1);
      }
    };
    Virtualization2.prototype.hideItem = function(obj) {
      var resutJSON = this.findDSAndIndexFromId(this.listViewInstance.curViewDS, obj);
      if (Object.keys(resutJSON).length && this.uiIndices.hiddenItemIndices.indexOf(resutJSON.index) === -1) {
        this.uiIndices.hiddenItemIndices.push(resutJSON.index);
      }
    };
    Virtualization2.prototype.removeItem = function(obj) {
      var dataSource;
      var curViewDS = this.listViewInstance.curViewDS;
      var resutJSON = this.findDSAndIndexFromId(curViewDS, obj);
      if (Object.keys(resutJSON).length) {
        dataSource = resutJSON.data;
        if (curViewDS[resutJSON.index - 1] && curViewDS[resutJSON.index - 1].isHeader && curViewDS[resutJSON.index - 1].items.length === 1) {
          this.removeUiItem(resutJSON.index - 1);
          this.removeUiItem(resutJSON.index - 1);
        } else {
          this.removeUiItem(resutJSON.index);
        }
      }
      var listDataSource = this.listViewInstance.dataSource instanceof DataManager ? this.listViewInstance.localData : this.listViewInstance.dataSource;
      var index = listDataSource.indexOf(dataSource);
      if (index !== -1) {
        listDataSource.splice(index, 1);
        this.listViewInstance.setViewDataSource(listDataSource);
      }
      this.listViewInstance.liCollection = this.listViewInstance.curUL.querySelectorAll("li");
    };
    Virtualization2.prototype.setCheckboxLI = function(li, e) {
      var index = Array.prototype.indexOf.call(this.listViewInstance.curUL.querySelectorAll("li"), li) + this.uiFirstIndex;
      this.activeIndex = Array.prototype.indexOf.call(this.listViewInstance.curUL.querySelectorAll("li"), li) + this.uiFirstIndex;
      if (li.classList.contains(classNames.selected)) {
        if (this.uiIndices.activeIndices.indexOf(index) === -1) {
          this.uiIndices.activeIndices.push(index);
        }
      } else {
        this.uiIndices.activeIndices.splice(this.uiIndices.activeIndices.indexOf(index), 1);
      }
    };
    Virtualization2.prototype.setSelectLI = function(li, e) {
      this.activeIndex = Array.prototype.indexOf.call(this.listViewInstance.curUL.querySelectorAll("li"), li) + this.uiFirstIndex;
    };
    Virtualization2.prototype.checkedItem = function(checked) {
      if (checked) {
        this.uiIndices.activeIndices = [];
        this.activeIndex = void 0;
        var data = this.listViewInstance.curViewDS;
        for (var index = 0; index < data.length; index++) {
          if (!data[index].isHeader) {
            this.uiIndices.activeIndices.push(index);
          }
        }
      } else {
        this.activeIndex = void 0;
        this.uiIndices.activeIndices = [];
      }
    };
    Virtualization2.prototype.addUiItem = function(index) {
      var curViewDs = this.listViewInstance.curViewDS;
      this.changeUiIndices(index, true);
      if (this.activeIndex && this.activeIndex >= index) {
        this.activeIndex++;
      }
      if (this.listViewInstance.showCheckBox && curViewDs[index][this.listViewInstance.fields.isChecked]) {
        this.uiIndices.activeIndices.push(index);
      }
      if (!parseFloat(this.bottomElement.style.height) && !parseFloat(this.topElement.style.height)) {
        this.bottomElement.style.height = parseFloat(this.bottomElement.style.height) + this.listItemHeight + "px";
      }
      if (parseFloat(this.bottomElement.style.height)) {
        var liItem = this.listViewInstance.curUL.lastElementChild.previousSibling;
        var target = this.listViewInstance.getLiFromObjOrElement(curViewDs[index + 1]) || this.listViewInstance.getLiFromObjOrElement(curViewDs[index + 2]);
        if (target) {
          this.bottomElement.style.height = parseFloat(this.bottomElement.style.height) + this.listItemHeight + "px";
          this.updateUI(liItem, index, target);
        }
      } else {
        var liItem = this.listViewInstance.curUL.firstElementChild.nextSibling;
        var target = void 0;
        if (Object.keys(this.listViewInstance.curViewDS).length - 1 === index) {
          target = this.listViewInstance.curUL.lastElementChild;
        } else {
          target = this.listViewInstance.getLiFromObjOrElement(curViewDs[index + 1]) || this.listViewInstance.getLiFromObjOrElement(curViewDs[index + 2]);
        }
        this.topElement.style.height = parseFloat(this.topElement.style.height) + this.listItemHeight + "px";
        this.uiFirstIndex++;
        this.uiLastIndex++;
        if (target) {
          this.updateUI(liItem, index, target);
          if (this.listViewInstance.isWindow === true) {
            window.scrollTo(0, pageYOffset + this.listItemHeight);
          } else {
            this.listViewInstance.element.scrollTop += this.listItemHeight;
          }
        }
      }
      this.totalHeight += this.listItemHeight;
      this.listDiff = Math.round(parseFloat(this.topElement.style.height) / this.listItemHeight);
    };
    Virtualization2.prototype.removeUiItem = function(index) {
      this.totalHeight -= this.listItemHeight;
      var curViewDS = this.listViewInstance.curViewDS[index];
      var liItem = this.listViewInstance.getLiFromObjOrElement(curViewDS);
      this.listViewInstance.curViewDS.splice(index, 1);
      if (this.activeIndex && this.activeIndex >= index) {
        this.activeIndex--;
      }
      if (liItem) {
        if (this.domItemCount > Object.keys(this.listViewInstance.curViewDS).length) {
          detach(liItem);
          this.domItemCount--;
          this.uiLastIndex--;
          this.totalHeight = 0;
        } else {
          if (liItem.classList.contains(classNames.disable)) {
            liItem.classList.remove(classNames.disable);
            this.uiIndices.disabledItemIndices.splice(this.uiIndices.disabledItemIndices.indexOf(index), 1);
          }
          if (liItem.style.display === "none") {
            liItem.style.display = "";
            this.uiIndices.hiddenItemIndices.splice(this.uiIndices.hiddenItemIndices.indexOf(index), 1);
          }
          if (this.listViewInstance.showCheckBox && liItem.classList.contains(classNames.selected)) {
            this.listViewInstance.removeSelect();
            this.uiIndices.activeIndices.splice(this.uiIndices.activeIndices.indexOf(index), 1);
            var checklistElement = liItem.querySelector("." + classNames.checkboxWrapper);
            checklistElement.removeAttribute("aria-checked");
            checklistElement.firstElementChild.classList.remove(classNames.checked);
            if (liItem.classList.contains(classNames.focused)) {
              liItem.classList.remove(classNames.focused);
              this.activeIndex = void 0;
            }
          } else if (liItem.classList.contains(classNames.selected)) {
            this.listViewInstance.removeSelect();
            this.activeIndex = void 0;
          }
          if (!parseFloat(this.bottomElement.style.height) && !parseFloat(this.topElement.style.height)) {
            this.updateUI(liItem, this.uiLastIndex, this.bottomElement);
          } else if (parseFloat(this.bottomElement.style.height)) {
            this.bottomElement.style.height = parseFloat(this.bottomElement.style.height) - this.listItemHeight + "px";
            this.updateUI(liItem, this.uiLastIndex, this.bottomElement);
          } else {
            this.topElement.style.height = parseFloat(this.topElement.style.height) - this.listItemHeight + "px";
            this.updateUI(liItem, this.uiFirstIndex - 1, this.topElement.nextSibling);
            this.uiLastIndex--;
            this.uiFirstIndex--;
          }
        }
      }
      this.changeUiIndices(index, false);
      this.listDiff = Math.round(parseFloat(this.topElement.style.height) / this.listItemHeight);
    };
    Virtualization2.prototype.changeUiIndices = function(index, increment) {
      var keys = Object.keys(this.uiIndices);
      for (var ind = 0; ind < keys.length; ind++) {
        this.uiIndices[keys[ind]] = this.uiIndices[keys[ind]].map(function(i) {
          if (i >= index) {
            return increment ? ++i : --i;
          } else {
            return i;
          }
        });
      }
    };
    Virtualization2.prototype.addItem = function(data, fields, dataSource, index) {
      for (var i = 0; i < data.length; i++) {
        var currentItem = data[i];
        dataSource = this.listViewInstance.addItemAtIndex(index, dataSource, currentItem);
        this.listViewInstance.setViewDataSource(dataSource);
        if (!this.domItemCount) {
          if ((this.listViewInstance.template || this.listViewInstance.groupTemplate) && !this.isNgTemplate()) {
            this.listViewInstance.listBaseOption.template = null;
            this.listViewInstance.listBaseOption.groupTemplate = null;
            this.listViewInstance.listBaseOption.itemCreated = this.createUIItem.bind(this);
          }
          this.uiVirtualization();
        } else if (this.domItemCount < this.expectedDomItemCount) {
          var ds = this.listViewInstance.findItemFromDS(dataSource, fields);
          if (ds instanceof Array) {
            if (this.listViewInstance.ulElement) {
              var index_1 = this.listViewInstance.curViewDS.indexOf(currentItem);
              this.createAndInjectNewItem(currentItem, index_1);
              var curViewDS = this.listViewInstance.curViewDS[index_1 - 1];
              if (curViewDS && curViewDS.isHeader && curViewDS.items.length === 1) {
                --index_1;
                this.createAndInjectNewItem(curViewDS, index_1);
              }
            }
            this.listViewInstance.liCollection = this.listViewInstance.curUL.querySelectorAll("li");
          }
        } else {
          var index_2 = this.listViewInstance.curViewDS.indexOf(currentItem);
          this.addUiItem(index_2);
          var curViewDS = this.listViewInstance.curViewDS[index_2 - 1];
          if (curViewDS && curViewDS.isHeader && curViewDS.items.length === 1) {
            this.addUiItem(index_2 - 1);
          }
        }
      }
    };
    Virtualization2.prototype.createAndInjectNewItem = function(itemData, index) {
      var target;
      var li = ListBase.createListItemFromJson(this.listViewInstance.createElement, [itemData], this.listViewInstance.listBaseOption, null, null, this.listViewInstance);
      if (Object.keys(this.listViewInstance.curViewDS).length - 1 === index) {
        target = this.listViewInstance.curUL.lastElementChild;
      } else {
        target = this.listViewInstance.getLiFromObjOrElement(this.listViewInstance.curViewDS[index + 1]) || this.listViewInstance.getLiFromObjOrElement(this.listViewInstance.curViewDS[index + 2]);
      }
      if (this.listViewInstance.fields.groupBy && this.listViewInstance.curViewDS[index + 1] && this.listViewInstance.curViewDS[index + 1].isHeader) {
        var targetEle = this.listViewInstance.getLiFromObjOrElement(this.listViewInstance.curViewDS[index - 1]);
        if (targetEle) {
          target = targetEle.nextElementSibling;
        }
      }
      this.listViewInstance.ulElement.insertBefore(li[0], target);
      this.domItemCount++;
      if (this.bottomElementHeight <= 0) {
        this.uiLastIndex++;
      }
      this.refreshItemHeight();
    };
    Virtualization2.prototype.createUIItem = function(args) {
      if (!args.item.classList.contains("e-list-group-item")) {
        this.templateData = args.curData.isHeader ? args.curData.items[0] : args.curData;
        if (this.listViewInstance.showCheckBox) {
          this.listViewInstance.renderCheckbox(args);
          if (!isNullOrUndefined(this.listViewInstance.virtualCheckBox) && !isNullOrUndefined(this.listViewInstance.virtualCheckBox.outerHTML)) {
            var div_1 = document.createElement("div");
            var commonTemplate = '<div class="e-text-content" role="presentation"> <span class="e-list-text"> ${' + this.listViewInstance.fields.text + "} </span></div>";
            var templateFunction = compile(this.listViewInstance.template || commonTemplate, this.listViewInstance);
            var nodes = templateFunction(this.templateData, this.listViewInstance);
            if (this.listViewInstance.template && this.listViewInstance.isReact) {
              this.listViewInstance.renderReactTemplates();
            }
            [].slice.call(nodes).forEach(function(ele) {
              div_1.appendChild(ele);
            });
            if (div_1.children && div_1.children[0]) {
              div_1.children[0].classList.add("e-checkbox");
              if (this.listViewInstance.checkBoxPosition === "Left") {
                div_1.children[0].classList.add("e-checkbox-left");
              } else {
                div_1.children[0].classList.add("e-checkbox-right");
              }
              if (this.listViewInstance.checkBoxPosition === "Left") {
                div_1.children[0].insertBefore(this.listViewInstance.virtualCheckBox, div_1.childNodes[0].children[0]);
              } else {
                div_1.children[0].appendChild(this.listViewInstance.virtualCheckBox);
              }
              while (args.item.lastChild) {
                args.item.removeChild(args.item.lastChild);
              }
              [].slice.call(div_1.children).forEach(function(ele) {
                args.item.appendChild(ele);
              });
            }
          }
        }
      }
    };
    Virtualization2.prototype.reRenderUiVirtualization = function() {
      this.wireScrollEvent(true);
      if (this.listViewInstance.contentContainer) {
        detach(this.listViewInstance.contentContainer);
      }
      this.listViewInstance.preRender();
      this.domItemCount = 0;
      this.listViewInstance.header();
      this.listViewInstance.setLocalData();
    };
    Virtualization2.prototype.updateUI = function(element, index, targetElement) {
      var onChange = this.isNgTemplate() ? this.onNgChange : this.onChange;
      if (this.listViewInstance.template || this.listViewInstance.groupTemplate) {
        var curViewDS = this.listViewInstance.curViewDS[index];
        element.dataset.uid = curViewDS[this.listViewInstance.fields.id] ? curViewDS[this.listViewInstance.fields.id] : ListBase.generateId();
        onChange(curViewDS, element, this);
      } else {
        this.updateUiContent(element, index);
      }
      this.changeElementAttributes(element, index);
      if (targetElement) {
        this.listViewInstance.ulElement.insertBefore(element, targetElement);
      }
    };
    Virtualization2.prototype.onChange = function(newData, listElement, virtualThis) {
      var liItem = ListBase.createListItemFromJson(virtualThis.listViewInstance.createElement, [newData], virtualThis.listViewInstance.listBaseOption, null, null, virtualThis.listViewInstance);
      if (virtualThis.listViewInstance.isReact) {
        virtualThis.listViewInstance.renderReactTemplates();
      }
      while (listElement.lastChild) {
        listElement.removeChild(listElement.lastChild);
      }
      [].slice.call(liItem[0].children).forEach(function(ele) {
        listElement.appendChild(ele);
      });
    };
    Virtualization2.prototype.onNgChange = function(newData, listElement, virtualThis) {
      var templateCompiler = compile(virtualThis.listViewInstance.template);
      var resultElement = templateCompiler(newData);
      while (listElement.lastChild) {
        listElement.removeChild(listElement.lastChild);
      }
      listElement.appendChild(resultElement[0]);
    };
    Virtualization2.prototype.getModuleName = function() {
      return "virtualization";
    };
    Virtualization2.prototype.destroy = function() {
      this.wireScrollEvent(true);
      this.topElement = null;
      this.bottomElement = null;
    };
    return Virtualization2;
  })()
);

export {
  Query,
  Predicate,
  DataUtil,
  JsonAdaptor,
  UrlAdaptor,
  RemoteSaveAdaptor,
  DataManager,
  Deferred,
  cssClass,
  ListBase,
  Sortable,
  moveTo
};
//# sourceMappingURL=chunk-HP6GMK4O.js.map
