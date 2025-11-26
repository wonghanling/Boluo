/**
 * BoLuo 网站聊天组件
 * 右下角悬浮聊天弹窗
 * 使用自建 LiveHelperChat 系统 - 国内访问更快速
 *
 * 使用方法：
 * 在页面底部引入此文件：
 * <script src="/chat-widget.js"></script>
 */

(function() {
    'use strict';

    // LiveHelperChat 聊天组件集成代码
    var LHC_API = LHC_API||{};
    LHC_API.args = {
        mode:'widget',
        lhc_base_url:'//mistcurrnet.com/index.php/',
        wheight:450,
        wwidth:350,
        pheight:520,
        pwidth:500,
        leaveamessage:true,
        check_messages:false
    };

    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.setAttribute('crossorigin','anonymous');
    po.async = true;
    var date = new Date();
    po.src = '//mistcurrnet.com/design/defaulttheme/js/widgetv2/index.js?'+(""+date.getFullYear() + date.getMonth() + date.getDate());
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);

    console.log('✅ BoLuo 自建聊天组件已加载');

})();