$(function() {

	// 新建工作区
	$("#newWorkSpaceBtn").click(e => {
		if($.trim($("#newWorkSpaceNameInput").val()) == ""){
			$("#newWorkSpaceNameInput").val("");
			alertMsg("请输入工作区名称！", 2);
			return false;
		}
		var workSpaceItem = new WorkSpaceItem();
		// workSpaceItem.fid = uuid();
		workSpaceItem.fid = new Date().getTime();
		workSpaceItem.workSpaceName = $("#newWorkSpaceNameInput").val();
		dbUtil.save(workSpaceItem);
		$("#newWorkSpaceNameInput").val("");
		alertMsg("新建成功！", 1);
		loadWorkSpaces();
		return false;
	});
	
	$("#closeAllTabsBtn").click(e => {
		confirmModal("确定关闭目前打开的所有页面吗?", e => {
			closeAllTabs();
			chrome.tabs.create({"url": "chrome://newtab/", "active": true}, 
				function(tab) {
				}
			);
		});
	});
	
	$("#exportBtn").click(e => {
		confirmModal("确定导出工作空间数据吗?", e => {
			chrome.tabs.create({"url": "./export.html", "active": true}, 
				function(tab) {
				}
			);
		});
	});
	
	$("#importBtn").click(e => {
	    $("#importFileSelect").click();
	});
	
	$("#importFileSelect").unbind("change").change(e => {
	    var files = $("#importFileSelect")[0].files;
	    if(files.length) {
            var file = files[0];
            var reader = new FileReader();
            if(/json+/.test(file.type)) {
                reader.onload = (e) => {
                    if(!e.currentTarget.result){
                        alertMsg("读取数据发生异常,导入失败！", 2);
                        return false;
                    }
                    var result = e.currentTarget.result;
                    var workSpaceItems = JSON.parse(result);
                    for(var workSpaceItem in workSpaceItems){
                        dbUtil.save(workSpaceItems[workSpaceItem]);
                    }
                    alertMsg("导入成功！", 1);
                    loadWorkSpaces();
                }
                reader.readAsText(file);
            } else {
                alertMsg("文件类型不正确！", 2);
            }
        }
	    $("#importFileSelect").val("");
	});
	
	dbUtil.initDB(loadWorkSpaces);
});

/*
 * 加载工作区
 */
var loadWorkSpaces = function() {
    dbUtil.findAll(workSpaceItems => {
        buildDataList(workSpaceItems);
    });
}

var buildDataList = function(workSpaceItems){
    $("#workSpacesDiv").html("");
    var tableHtml = ""
    
    // 排序
    var sortedObjKeys = Object.keys(workSpaceItems).sort();
    
    for (var index in sortedObjKeys) {
        var workSpaceItem = workSpaceItems[sortedObjKeys[index]];
        tableHtml = tableHtml + "<tr>";
        tableHtml = tableHtml + "<th scope='row'>" + workSpaceItem.workSpaceName + "</th>";
        tableHtml = tableHtml + "<td>" + (workSpaceItem.saveDataTime ? workSpaceItem.saveDataTime : "未保存") + "</td>";
        tableHtml = tableHtml + "<td><div class='btn-group' role='group' aria-label='操作'>";
        tableHtml = tableHtml + "<button type='button' class='btn btn-success saveAllTabsBtn' data-fid='" + workSpaceItem.fid + "'>保存当前打开的页面</button>";
        tableHtml = tableHtml + "<button type='button' class='btn btn-primary switch2WorkSpaceBtn' data-fid='" + workSpaceItem.fid + "'>切换</button>";
        tableHtml = tableHtml + "<button type='button' class='btn btn-danger delWorkSpaceBtn' data-fid='" + workSpaceItem.fid + "'>删除</button>";
        tableHtml = tableHtml + "</div></td>";
        tableHtml = tableHtml + "</tr>";
    }
    
    $("#workSpacesDiv").append(tableHtml);
    
    // ======================注册事件==========================================
    // 保存当前打开的所有tab到空间
    $(".saveAllTabsBtn").click(e => {
        var fid = $(e.target).data("fid");
        dbUtil.findById(fid, workSpaceItem => {
            
            if(!workSpaceItem) {
               alertMsg("该工作区不存在", 2);
               return false;
           }
           if(workSpaceItem.saveDataTime) {
               confirmModal("确定覆盖工作区【" + workSpaceItem.workSpaceName + "】吗?", function() {
                   saveAllTabs(workSpaceItem);
               });
           } else {
               saveAllTabs(workSpaceItem);
           }
            
        });
        return false;
    });
    
    // 切换工作区
    $(".switch2WorkSpaceBtn").click(e => {
        var fid = $(e.target).data("fid");
        dbUtil.findById(fid, workSpaceItem => {
            
            if(!workSpaceItem) {
                alertMsg("该工作区不存在", 2);
                return false;
            }
            if(workSpaceItem.spaceTabs) {
                confirmModal("确定切换到工作区【" + workSpaceItem.workSpaceName + "】吗?", function() {
                    closeAllTabs();
                    for(var i = (workSpaceItem.spaceTabs.length - 1); i >= 0; i--) {
                        var tab = workSpaceItem.spaceTabs[i];
                        chrome.tabs.create({
                                "url": tab.url,
                                "active": false
                            },
                            function(tab) {}
                        );
                    }
                });

            } else {
                alertMsg("该工作区中没有页面", 2);
            }
            
        });
        return false;
    });
    
    $(".delWorkSpaceBtn").click(e => {
        var fid = $(e.target).data("fid");
        dbUtil.findById(fid, workSpaceItem => {
            
            if(workSpaceItem && workSpaceItem.fid) {
                confirmModal("确定删除工作区【" + workSpaceItem.workSpaceName + "】吗?", function() {
                    //              if((fid in publicWorkSpaceItems) && (delete publicWorkSpaceItems[fid])){
                    dbUtil.del(fid);
                    loadWorkSpaces();
                    alertMsg("删除成功", 1);
                    //              } else {
                    //                  alertMsg("该工作区不存在", 2);  
                    //              }
                });
            } else {
                alertMsg("该工作区不存在", 2);
            }
            
        });
        
        return false;
    });
}

function saveAllTabs(workSpaceItem){
	if(workSpaceItem){
		chrome.tabs.query({}, function(tabs) {
			workSpaceItem.saveDataTime = nowFormatDate(); 
			workSpaceItem.spaceTabs = new Array();
			$.each( tabs, function(i, tab){
				var storageTab = {};
				storageTab.id = tab.id
				storageTab.url = tab.url;
				storageTab.title = tab.title;
				workSpaceItem.spaceTabs.push(storageTab);
			});
			dbUtil.save(workSpaceItem);
			loadWorkSpaces();
			alertMsg("保存成功！", 1);
		});
	}
}

function confirmModal(msg, okFunction){
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

function closeAllTabs(){
	chrome.tabs.query({}, function(tabs) {
		$.each( tabs, function(i, tab){
			chrome.tabs.remove(tab.id);
		});
	});
}

function uuid() { 
    var s = []; 
    var hexDigits = "0123456789abcdef"; 
    for (var i = 0; i < 36; i++) { 
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1); 
    } 
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010 
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01 
    s[8] = s[13] = s[18] = s[23]; 
    
    var uuid = s.join(""); 
    return uuid; 
} 

function nowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	if (hours >= 0 && hours <= 9) {
		hours = "0" + hours;
	}
	if (minutes >= 0 && minutes <= 9) {
		minutes = "0" + minutes;
	}
	if (seconds >= 0 && seconds <= 9) {
		seconds = "0" + seconds;
	}
	
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + hours + seperator2 + minutes
            + seperator2 + seconds;
    return currentdate;
}

function alertMsg(msg, type){
	if(type && type == 1){
		$("#successMsg").text(msg);
		$("#successDiv").show();
	} else {
		$("#faildMsg").text(msg);
		$("#faildDiv").show();
	}
}