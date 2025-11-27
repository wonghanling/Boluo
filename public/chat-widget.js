/**
 * BoLuo 网站聊天组件
 * 右下角悬浮聊天弹窗
 * 使用自建 LiveHelperChat Widget 系统 - 国内访问更快速，支持实时客服对话
 *
 * 使用方法：
 * 在页面底部引入此文件：
 * <script src="/chat-widget.js"></script>
 */

(function() {
    'use strict';

    // LiveHelperChat Widget API 配置 - 自动生成的embed code
    var LHC_API = LHC_API||{};
    LHC_API.args = {
        mode:'widget',
        lhc_base_url:'//mistcurrnet.com/index.php/',
        wheight:450,
        wwidth:350,
        pheight:520,
        pwidth:500,
        domain:'boluoing.com',
        fresh:true,
        leaveamessage:true,
        check_messages:false
    };

    // 自动语言检测
    (function() {
        var _l = '';
        var _m = document.getElementsByTagName('meta');
        var _cl = '';
        for (var i=0; i < _m.length; i++) {
            if ( _m[i].getAttribute('http-equiv') == 'content-language' ) {
                _cl = _m[i].getAttribute('content');
            }
        }
        if (document.documentElement.lang != '') _l = document.documentElement.lang;
        if (_cl != '' && _cl != _l) _l = _cl;
        if (_l == undefined || _l == '') {
            _l = '';
        } else {
            _l = _l[0].toLowerCase() + _l[1].toLowerCase();
            if ('eng' == _l) {
                _l = ''
            } else {
                LHC_API.args.lang = _l + '/';
            }
        }
    })();

    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.setAttribute('crossorigin','anonymous');
    po.async = true;
    var date = new Date();
    po.src = '//mistcurrnet.com/design/defaulttheme/js/widgetv2/index.js?'+(""+date.getFullYear() + date.getMonth() + date.getDate());
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);

    console.log('✅ BoLuo 自建Widget聊天框已加载 - 域名: boluoing.com');

})();