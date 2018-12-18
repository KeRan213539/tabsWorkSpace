var fid;
$(function() {
    $("#backBtn").click(e => {
        window.location.href = "./popup.html";
    });
    var tempfId = pageUtil.getRequestPrarms().fid;
    if(!tempfId){
        pageUtil.alertMsg("该工作区不存在", 2);
    }
    fid = parseInt($.trim(tempfId));
    dbUtil.initDB(loadWorkSpace);
});

var loadWorkSpace = function() {
    dbUtil.findById(fid, workSpaceItem => {
        if(!workSpaceItem) {
            pageUtil.alertMsg("该工作区不存在", 2);
            return false;
        }
        if(workSpaceItem.spaceTabs) {
            var title = "工作区名称：【" + workSpaceItem.workSpaceName + "】";
            title = title + "<br />" + "页面总数：【" + workSpaceItem.spaceTabs.length + "】"
            $("#titleDiv").html(title);
            var tableHtml = ""
            for(var i = (workSpaceItem.spaceTabs.length - 1); i >= 0; i--) {
                var tab = workSpaceItem.spaceTabs[i];
                tableHtml = tableHtml + "<tr>";
                tableHtml = tableHtml + "<th scope='row'>" + tab.title + "</th>";
                tableHtml = tableHtml + "<td><div class='btn-group' role='group' aria-label='操作'>";
                tableHtml = tableHtml + "<button type='button' class='btn btn-outline-primary viewTab' data-furl='" + tab.url + "'>查看</button>";
                tableHtml = tableHtml + "<button type='button' class='btn btn-outline-danger delWorkSpaceBtn' data-fid='" + tab.id + "'>删除</button>";
                tableHtml = tableHtml + "</div></td>";
                tableHtml = tableHtml + "</tr>";
            }
            $("#tablistDiv").html(tableHtml);
        }
        $(".viewTab").click(e => {
            var url = $(e.target).data("furl");
            chrome.tabs.create({
                    "url": url,
                    "active": false
                },
                function(tab) {}
            );
        });
        $(".delWorkSpaceBtn").click(e => {
            pageUtil.confirmModal("确定删除吗?", () => {
                dbUtil.findById(fid, workSpaceItem => {
                    var tabfId = parseInt($(e.target).data("fid"));
                    if(!tabfId){
                        return false;
                    }
                    if(workSpaceItem.spaceTabs){
                        var toRemoveIndx;
                        for(var i = (workSpaceItem.spaceTabs.length - 1); i >= 0; i--) {
                            var tab = workSpaceItem.spaceTabs[i];
                            if(tabfId === tab.id){
                                toRemoveIndx = i;
                                break;
                            }
                        }
                        if(toRemoveIndx != undefined && toRemoveIndx > -1){
                            workSpaceItem.spaceTabs.splice(toRemoveIndx, 1)
                            dbUtil.save(workSpaceItem);
                            pageUtil.alertMsg("删除成功！", 1);
                            loadWorkSpace();
                        }
                    }
                    return false;
                });
            });
        });
    });
    return false;
}



