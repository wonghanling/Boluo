var LHC_API = LHC_API||{};
LHC_API.args = {mode:'widget',lhc_base_url:'//139.180.135.151/index.php/',wheight:450,wwidth:350,pheight:520,pwidth:500,leaveamessage:true,check_messages:false};
(function() {
var po = document.createElement('script'); po.type = 'text/javascript'; po.setAttribute('crossorigin','anonymous'); po.async = true;
var date = new Date();po.src = '//139.180.135.151/design/defaulttheme/js/widgetv2/index.js?'+(""+date.getFullYear() + date.getMonth() + date.getDate());
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();