const hour=document.getElementById("hour"),
minute=document.getElementById("minute"),
second=document.getElementById("second"),
time=document.getElementById("time"),
date=document.getElementById("date");

function tick(){
 const d=new Date();
 const h=d.getHours()%12,m=d.getMinutes(),s=d.getSeconds();
 hour.style.transform=`translateX(-50%) rotate(${h*30+m/2}deg)`;
 minute.style.transform=`translateX(-50%) rotate(${m*6}deg)`;
 second.style.transform=`translateX(-50%) rotate(${s*6}deg)`;
 time.textContent=d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false});
 date.textContent=d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
}
tick();setInterval(tick,1000);

document.querySelectorAll('.app,.tile,.clock').forEach(el=>{
el.addEventListener('click',()=>{
el.animate([
{transform:'scale(1)'},
{transform:'scale(.92)'},
{transform:'scale(1.03)'},
{transform:'scale(1)'}
],{
duration:280,
easing:'cubic-bezier(.22,1,.36,1)'
});
});
});

document.querySelectorAll('.app').forEach(app=>{
 app.onclick=()=>window.windowManager?.open(app.dataset.app);
});

document.querySelector('[data-widget="settings"]')?.addEventListener('click',()=>{
 window.windowManager?.open('settings');
});

document.querySelectorAll('[data-widget="weather"]').forEach(widget=>{
 widget.addEventListener('click',()=>window.windowManager?.open('weather'));
});

document.querySelector('[data-widget="notifications"]')?.addEventListener('click',()=>{
 window.windowManager?.open('notifications');
});

document.querySelector('[data-widget="music"]')?.addEventListener('click',()=>{
 window.windowManager?.open('music');
});
