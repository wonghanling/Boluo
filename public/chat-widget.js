/**
 * BoLuo 网站聊天组件
 * 右下角悬浮聊天弹窗
 * 使用 Mixdesk AI 聊天机器人
 *
 * 使用方法：
 * 在页面底部引入此文件：
 * <script src="/chat-widget.js"></script>
 */

(function() {
    'use strict';

    // Mixdesk 聊天机器人集成代码
    (function(a, b, c, d, e, j, s) {
        a._t = d;
        a[d] = a[d] || function() {
            (a[d].a = a[d].a || []).push(arguments)
        };
        j = b.createElement(c),
            s = b.getElementsByTagName(c)[0];
        j.async = true;
        j.charset = 'UTF-8';
        j.src = 'https://chat.mix-chat.com/entry.js';
        s.parentNode.insertBefore(j, s);
    })(window, document, 'script', '_MIXDESK');

    // 初始化 Mixdesk 聊天组件
    _MIXDESK('entId', '1be646e5b182ce9e051e6d14c8628558');

    console.log('✅ BoLuo 聊天组件已加载');

})();