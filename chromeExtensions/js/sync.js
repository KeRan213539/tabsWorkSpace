$(function() {
    $("#backBtn").click(e => {
        window.location.href = "./popup.html";
    });
    
    $("#uploadData").click(e => {
        syncUtil.uploadData();
    });
    
    $("#downloadData").click(e => {
        syncUtil.getSyncToken(strToken => {
            alert(strToken);
        });
    });
    
    $("#updateToken").click(e => {
        var strToken = $.trim(prompt("请输入github的 Personal access token, 如何获得Token请查看使用帮助"));
        if(strToken.length > 0){
            dbUtil.updateSyncToken(strToken);
            loadInfo();
            pageUtil.alertMsg("更新成功！", 1);
        }
    });
    
    $("#updateFileId").click(e => {
        var fileId = $.trim(prompt("请输入上传后返回的文件ID"));
        if(fileId.length > 0){
            dbUtil.updateSyncFileId(fileId);
            loadInfo();
            pageUtil.alertMsg("更新成功！", 1);
        }
    });
    dbUtil.initDB(loadInfo);
});
var loadInfo = function() {
    dbUtil.getSyncToken(strToken => {
        if(strToken){
            $("#tokenSpan").text(strToken);
        }
    });
    dbUtil.getSyncFileId(strFileId => {
        if(strFileId){
            $("#fileIdSpan").text(strFileId);
        }
    });
}