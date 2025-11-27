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

    // LiveHelperChat Widget API 配置
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

    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.setAttribute('crossorigin','anonymous');
    po.async = true;
    var date = new Date();
    po.src = '//mistcurrnet.com/design/defaulttheme/js/widgetv2/index.js?'+(""+date.getFullYear() + date.getMonth() + date.getDate());
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);

    console.log('✅ BoLuo Widget已加载 - 域名: boluoing.com');

})();