var TabItem = function() {
    this.fid = "";
    this.title =  "";
    this.url =  "";
}

var WorkSpaceItem = function() {
    this.fid =  "";  // 主键ID
    this.workSpaceName =  "";  // 工作区名称
    this.saveDataTime =  "";  // 保存时间
    this.spaceTabs =  [];  // 工作区中的页面
}
// %USERPROFILE%\AppData\Local\Google\Chrome\User Data\Default\IndexedDB
var dbUtil = {
    db: {},
    initDB: (successFun) =>{
        var request = window.indexedDB.open("tabsWorkSpaceDB", 1);
        request.onerror = function(event){
            console.log("打开DB失败", event);
        }
        request.onupgradeneeded   = function(event){
            console.log("DB升级中...");
            var db = event.target.result;
            var objectStore = db.createObjectStore("workSpace", { keyPath : "fid" });
            objectStore.createIndex('fid', 'fid', {
                unique: true    
            });
            // onupgradeneeded 执行完后会再到 onsuccess 的
        };
        request.onsuccess  = function(event){
           dbUtil.db = event.target.result;
           if(successFun){
               successFun();
           }
        }
    },
    getObjStore: () =>{
        return dbUtil.db.transaction(["workSpace"],"readwrite").objectStore("workSpace");
    },
    del: fid => {
        dbUtil.getObjStore().delete(fid);
    },
    save: workSpaceItem => {
        dbUtil.getObjStore().put(workSpaceItem);
    },
    findById: (fid, callbackFn) => {
        var request = dbUtil.getObjStore().get(fid);
        request.onerror = function(event){
            callbackFn();
        }
        request.onsuccess = function(event){
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

