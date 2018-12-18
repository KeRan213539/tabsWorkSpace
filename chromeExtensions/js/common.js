var TabItem = function() {
    this.id = "";
    this.title = "";
    this.url = "";
}

var WorkSpaceItem = function() {
    this.fid = ""; // 主键ID
    this.workSpaceName = ""; // 工作区名称
    this.saveDataTime = ""; // 保存时间
    this.spaceTabs = []; // 工作区中的页面
}
// %USERPROFILE%\AppData\Local\Google\Chrome\User Data\Default\IndexedDB
var dbUtil = {
    db: {},
    initDB: (successFun) => {
        var request = window.indexedDB.open("tabsWorkSpaceDB", 1);
        request.onerror = function(event) {
            console.log("打开DB失败", event);
        }
        request.onupgradeneeded = function(event) {
            console.log("DB升级中...");
            var db = event.target.result;
            var objectStore = db.createObjectStore("workSpace", {
                keyPath: "fid"
            });
            objectStore.createIndex('fid', 'fid', {
                unique: true
            });
            // onupgradeneeded 执行完后会再到 onsuccess 的
        };
        request.onsuccess = function(event) {
            dbUtil.db = event.target.result;
            if(successFun) {
                successFun();
            }
        }
    },
    getObjStore: () => {
        return dbUtil.db.transaction(["workSpace"], "readwrite").objectStore("workSpace");
    },
    del: fid => {
        dbUtil.getObjStore().delete(fid);
    },
    save: workSpaceItem => {
        dbUtil.getObjStore().put(workSpaceItem);
    },
    findById: (fid, callbackFn) => {
        var request = dbUtil.getObjStore().get(fid);
        request.onerror = function(event) {
            callbackFn();
        }
        request.onsuccess = function(event) {
            callbackFn(request.result);
        }
    },
    findAll: callbackFn => {
        var workSpaceItems = {};
        dbUtil.getObjStore().openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if(cursor) {
                workSpaceItems[cursor.key] = cursor.value;
                cursor.continue();
            } else {
                callbackFn(workSpaceItems);
            }
        };
    }
}

var pageUtil = {
    getRequestPrarms: () => {
        var url = location.search;
        var theRequest = new Object();
        if(url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for(var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    },
    alertMsg: (msg, type) => {
        if(!type || $("#alertsDiv").length <= 0){
            alert(msg);
        } else {
            if(type == 1){
                if($("#successDiv").length <= 0){
                    var alertMessageHtml = "<div class=\"alert alert-success\" id=\"successDiv\" role=\"alert\" style=\"display: none;\">"
                                            +    "<span id=\"successMsg\"></span>"
                                            +    "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">"
                                            +            "<span aria-hidden=\"true\">&times;</span>"
                                            +    "</button>"
                                            + "</div>"
                    $("#alertsDiv").append(alertMessageHtml);
                }
                $("#successMsg").text(msg);
                $("#successDiv").show();
            } else {
                if($("#faildDiv").length <= 0){
                    var alertMessageHtml = "<div class=\"alert alert-danger\" id=\"faildDiv\" role=\"alert\" style=\"display: none;\">"
                                            +    "<span id=\"faildMsg\"></span>"
                                            +    "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">"
                                            +            "<span aria-hidden=\"true\">&times;</span>"
                                            +    "</button>"
                                            + "</div>"
                    $("#alertsDiv").append(alertMessageHtml);
                }
                $("#faildMsg").text(msg);
                $("#faildDiv").show();
            }
        }
    },
    confirmModal: (msg, okFunction) => {
        if($("#confirmModal").length <= 0){
            var confirmModalHtml = "<div class=\"modal fade\" id=\"confirmModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"确认\" aria-hidden=\"true\">"
                +"<div class=\"modal-dialog\" role=\"document\">"
                +    "<div class=\"modal-content\">"
                +        "<div class=\"modal-body\" id=\"confirmModalBody\">"
                +        "</div>"
                +        "<div class=\"modal-footer\">"
                +            "<button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">取消</button>"
                +            "<button type=\"button\" class=\"btn btn-success\" id=\"confirmModalOkBtn\">确定</button>"
                +        "</div>"
                +    "</div>"
                +"</div>"
            +"</div>";
            $("body").append(confirmModalHtml);
        }
        if(msg){
            $("#confirmModalBody").text(msg);
        } else {
            $("#confirmModalBody").text("");
        }
        $("#confirmModalOkBtn").unbind("click");
        if(okFunction){
            $("#confirmModalOkBtn").click(e => {
                $('#confirmModal').modal('hide');
                okFunction(e);
                return false;
            });
        } else {
            $("#confirmModalOkBtn").click(e => {
                $('#confirmModal').modal('hide');
                return false;
            });
        }
        $('#confirmModal').modal();
    }
}