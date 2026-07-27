/* ==========================================================
   LifeOS Clock Engine v1.0
   ========================================================== */

class LifeClock{

    constructor(){

        this.hour=document.getElementById("hour");
        this.minute=document.getElementById("minute");
        this.second=document.getElementById("second");

        this.digital=document.getElementById("digital");

        this.date=document.getElementById("date");

        this.clock=document.querySelector(".clock");

        this.start();

    }

    start(){

        this.update();

        setInterval(()=>{

            this.update();

        },1000);

    }

    update(){

        const now=new Date();

        this.updateAnalog(now);

        this.updateDigital(now);

        this.updateDate(now);

    }

    updateAnalog(now){

        if(!this.hour || !this.minute || !this.second)
            return;

        const hours=now.getHours()%12;

        const minutes=now.getMinutes();

        const seconds=now.getSeconds();

        const hourDeg=(hours*30)+(minutes/2);

        const minuteDeg=minutes*6;

        const secondDeg=seconds*6;

        this.hour.style.transform=
            `translateX(-50%) rotate(${hourDeg}deg)`;

        this.minute.style.transform=
            `translateX(-50%) rotate(${minuteDeg}deg)`;

        this.second.style.transform=
            `translateX(-50%) rotate(${secondDeg}deg)`;

    }

    updateDigital(now){

        if(!this.digital)
            return;

        this.digital.textContent=
            now.toLocaleTimeString([],{

                hour:"2-digit",

                minute:"2-digit"

            });

    }

    updateDate(now){

        if(!this.date)
            return;

        this.date.textContent=
            now.toLocaleDateString([],{

                weekday:"long",

                day:"numeric",

                month:"long"

            });

    }

}

/* ==========================================================
   Boot
   ========================================================== */

window.addEventListener("DOMContentLoaded",()=>{

    window.lifeClock=new LifeClock();

    const wordmark=document.querySelector("[data-lifeos-wordmark]");

    if(!wordmark) return;

    let isAnimating=false;

    const wait=(duration)=>new Promise(resolve=>window.setTimeout(resolve,duration));

    const playWordmark=async()=>{

        if(isAnimating) return;

        isAnimating=true;
        wordmark.classList.add("is-wordmark");

        const word="LifeOS";
        wordmark.textContent=word.charAt(0);

        for(let index=1;index<=word.length;index++){

            await wait(82);
            wordmark.textContent=word.slice(0,index);

        }

        await wait(1150);

        for(let index=word.length-1;index>=1;index--){

            await wait(64);
            wordmark.textContent=word.slice(0,index);

        }

        wordmark.classList.remove("is-wordmark");
        isAnimating=false;

    };

    document.addEventListener("keydown",event=>{

        if(event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;

        if(event.key.toLowerCase()==="l") playWordmark();

    });

});
