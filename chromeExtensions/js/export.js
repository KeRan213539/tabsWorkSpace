$(function() {
    
    dbUtil.initDB(() => {
        dbUtil.findAll(workSpaceItems => {
            $("#exportData").text(JSON.stringify(workSpaceItems, null, 4));
            $("#exportData").each((i, block) =>  {
                hljs.highlightBlock(block);
            });
        });
    });
    
    
	$("#snippet").mousemove(e => {
		$(".snippet .btn").css("top", $("#exportData").offset().top - 30);
		$(".snippet .btn").css("opacity", 1);
	});
	
	$("#snippet").mouseout(e => {
		$(".snippet .btn").css("opacity", 0);
	});
	
	$("#downloadBtn").unbind("click").click(e => {
		export_raw('tabsWorkSpaceExportData.json', $("#exportData").text());
	});
	
	var clipboardSnippets = new ClipboardJS("#snippet .btn", {
        target: function(trigger) {
            return trigger.nextElementSibling;
        }
    });
    clipboardSnippets.on('success', e => {
        e.clearSelection();
        alertMsg("复制成功", 1);  
    });
    clipboardSnippets.on('error', e => {
        alertMsg("复制失败", 2)
    });
	
});






function fake_click(obj) {
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0
        , false, false, false, false, 0, null
        );
    obj.dispatchEvent(ev);
}
 
function export_raw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;
 
    var export_blob = new Blob([data]);
 
    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    fake_click(save_link);
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
