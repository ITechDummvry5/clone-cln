/* Contact page: demo submit message + preselect the service from ?service=... (links on the Services page). */
(function(){
document.getElementById('cform').addEventListener('submit',function(e){e.preventDefault();this.querySelector('.ok').textContent='Message sent. We will reply soon.';this.reset()})
  var sel=document.getElementById('service');
var wanted=new URLSearchParams(location.search).get('service');
if(wanted){for(var i=0;i<sel.options.length;i++){if(sel.options[i].value===wanted){sel.value=wanted;break}}}
})();
