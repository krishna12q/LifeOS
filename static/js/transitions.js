/* Shared-element unlock transition: the existing clock is moved, never cloned. */
class LifeTransition {
    unlock(destination) {
        const clock = document.querySelector("#lifeClock");
        const dock = document.querySelector("#desktopClockDock");
        if (!clock || !dock) return window.location.assign(destination);
        const from = clock.getBoundingClientRect(); const to = dock.getBoundingClientRect();
        const dx = to.left + to.width / 2 - (from.left + from.width / 2); const dy = to.top + to.height / 2 - (from.top + from.height / 2); const scale = to.width / from.width;
        clock.animate([{transform:"translate(0, 0) scale(1)",filter:"drop-shadow(0 .7rem 1.1rem rgba(0,0,0,.22))"},{offset:.16,transform:"translate(0, -4px) scale(.985)",filter:"drop-shadow(0 .8rem 1.35rem rgba(0,0,0,.25))"},{transform:`translate(${dx}px, ${dy}px) scale(${scale})`,filter:"drop-shadow(0 .35rem .7rem rgba(0,0,0,.2))"}], {duration:2200,delay:120,easing:"cubic-bezier(.22,1,.36,1)",fill:"forwards"});
        window.setTimeout(() => window.location.assign(destination), 2480);
    }
}
window.lifeTransition = new LifeTransition();
