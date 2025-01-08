$.get("/syncHelp.md?t=" + new Date(), function(data) {
    if(!data) {
        return;
    }
    var converter = new showdown.Converter({
        emoji: true, // 打开 emoji 文字表情支持  例: this is a smile :smile: emoji 被转换为  <p>this is a smile 😄 emoji</p>,  表情列表  https://github.com/showdownjs/showdown/wiki/Emojis
        underline: true, // 打开下划线支持    __被下划线的__   和   ___空格    一起下划线___
        simplifiedAutoLink: true, // 打开 url自动转连接功能
        excludeTrailingPunctuationFromURLs: true, // 自动转url时排除最后的标点符号, 要先打开 simplifiedAutoLink
        strikethrough: true, //打开删除线支持  ~~被删除线的~~
        tables: true, // 打开表格支持,例:
        //  | h1    |    h2   |      h3 |
        //  |:------|:-------:|--------:|
        //  | 100   | [a][1]  | ![b][2] |
        //  | *foo* | **bar** | ~~baz~~ |
        openLinksInNewWindow: true //在浏览器窗口中打开连接

    });
    var html = converter.makeHtml(data);
    $("#markdownDiv").html(html);
});