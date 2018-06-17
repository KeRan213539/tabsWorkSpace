var publicWorkSpaceItems;
$(function() {

	// 新建工作区
	$("#newWorkSpaceBtn").click(e => {
		if($.trim($("#newWorkSpaceNameInput").val()) == ""){
			$("#newWorkSpaceNameInput").val("");
			alert("请输入工作区名称！");
			return false;
		}
		var workSpaceItem = {};
		// workSpaceItem.fid = uuid();
		workSpaceItem.fid = new Date().getTime();
		workSpaceItem.workSpaceName = $("#newWorkSpaceNameInput").val();
		publicWorkSpaceItems[workSpaceItem.fid] = workSpaceItem;
		chrome.storage.sync.set({workSpaces: publicWorkSpaceItems}, function() {
			$("#newWorkSpaceNameInput").val("");
			console.log("新建成功！");
			alert("新建成功！");
		});
		loadWorkSpaces();
		return false;
	});

	loadWorkSpaces();
});

/*
 * 加载工作区
 */
var loadWorkSpaces = function() {
	var workSpacesStorageKey = {workSpaces: {}}; // 默认配置
	chrome.storage.sync.get(workSpacesStorageKey, function(workSpaceItems) {
		publicWorkSpaceItems = workSpaceItems.workSpaces;
		$("#workSpacesDiv").html("");
		var tableHtml = "<table>"
		
		// 排序
		var sortedObjKeys = Object.keys(workSpaceItems.workSpaces).sort();
		
		for (var index in sortedObjKeys) {
			var workSpaceItem = workSpaceItems.workSpaces[sortedObjKeys[index]];
			tableHtml = tableHtml + "<tr>";
			tableHtml = tableHtml + "<td>" + workSpaceItem.workSpaceName + "</td>";
			tableHtml = tableHtml + "<td><input type='button' data-fid='" + workSpaceItem.fid + "' value='保存当前打开的页面' class='saveAllTabsBtn' /></td>";
			tableHtml = tableHtml + "<td><input type='button' data-fid='" + workSpaceItem.fid + "' value='切换' class='switch2WorkSpaceBtn' /></td>";
			tableHtml = tableHtml + "<td><input type='button' data-fid='" + workSpaceItem.fid + "' value='删除' class='delWorkSpaceBtn' /></td>";
			tableHtml = tableHtml + "<td>保存时间:" + (workSpaceItem.saveDataTime ? workSpaceItem.saveDataTime : "未保存") + "</td>";
			tableHtml = tableHtml + "</tr>";
		}
		
		tableHtml = tableHtml + "</table>"
		$("#workSpacesDiv").append(tableHtml);
		
		// ======================注册事件==========================================
		// 保存当前打开的所有tab到空间
		$(".saveAllTabsBtn").click(e => {
			var fid = $(e.target).data("fid");
			var workSpaceItem = publicWorkSpaceItems[fid];
			if(!workSpaceItem){
				console.log("该工作区不存在");
				alert("该工作区不存在");
				return false;
			}
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
				if(!publicWorkSpaceItems){
					publicWorkSpaceItems = {};
				}
				publicWorkSpaceItems[workSpaceItem.fid] = workSpaceItem;
				chrome.storage.sync.set({workSpaces: publicWorkSpaceItems}, function() {
					loadWorkSpaces();
					console.log("保存成功！");
					alert("保存成功！");
				});
			});
			return false;
		});
		
		// 切换工作区
		$(".switch2WorkSpaceBtn").click(e => {
			var fid = $(e.target).data("fid");
			var workSpaceItem = publicWorkSpaceItems[fid];
			if(!workSpaceItem){
				console.log("该工作区不存在");
				alert("该工作区不存在");
				return false;
			}
			if(workSpaceItem.spaceTabs){
				chrome.tabs.query({}, function(tabs) {
					$.each( tabs, function(i, tab){
						chrome.tabs.remove(tab.id);
					});
				});
				
				for(var i = (workSpaceItem.spaceTabs.length - 1); i >=0; i--){
					var tab = workSpaceItem.spaceTabs[i];
					chrome.tabs.create({"url": tab.url, "active": false}, 
						function(tab) {
						}
					);
				}
				
			} else {
				console.log("该工作区中没有页面");
				alert("该工作区中没有页面");
			}
			return false;
		});
		
		$(".delWorkSpaceBtn").click(e => {
			var fid = $(e.target).data("fid");
			if((fid in publicWorkSpaceItems) && (delete publicWorkSpaceItems[fid])){
				chrome.storage.sync.set({workSpaces: publicWorkSpaceItems}, function() {
					loadWorkSpaces();
					console.log("删除成功");
					alert("删除成功");  
				});
			} else {
				console.log("该工作区不存在");
				alert("该工作区不存在");  
			}
			return false;
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