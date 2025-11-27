/**
 * BoLuo 网站聊天组件
 * 右下角悬浮聊天弹窗
 * 使用自建 LiveHelperChat Chatbox 系统 - 国内访问更快速
 *
 * 使用方法：
 * 在页面底部引入此文件：
 * <script src="/chat-widget.js"></script>
 */

(function() {
    'use strict';

    // 确保全局变量被正确定义
    window.LHCChatboxOptions = {
        hashchatbox:'empty',
        identifier:'default',
        status_text:'Chatbox'
    };

    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://mistcurrnet.com/index.php/chatbox/getstatus/(position)/bottom_right/(top)/300/(units)/pixels/(width)/300/(height)/300/(chat_height)/220';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);

    console.log('✅ BoLuo 自建Chatbox聊天框已加载');

})();