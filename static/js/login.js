class LifeLogin {

    constructor() {

        this.form = document.querySelector("#loginForm");
        this.username = document.querySelector("#username");
        this.password = document.querySelector("#password");
        this.signin = document.querySelector("#signin");

        this.loading = false;

        this.initialize();

    }

    initialize() {

        if (!this.form) return;

        this.bindInputEffects();

        this.form.addEventListener("submit", (event) => {

            if (this.loading) {
                event.preventDefault();
                return;
            }

            if (!this.validate(event))
                return;

            this.startUnlock();

            // IMPORTANT:
            // We DO NOT call preventDefault().
            // The browser will submit the form normally.
            // FastAPI handles authentication.

        });

    }

    bindInputEffects() {

        document.querySelectorAll(".input").forEach(input => {

            input.addEventListener("focus", () => {
                input.closest(".field").classList.add("active");
            });

            input.addEventListener("blur", () => {
                input.closest(".field").classList.remove("active");
            });

        });

    }

    validate(event) {

        if (!this.username.value.trim()) {

            event.preventDefault();
            this.invalid(this.username);

            return false;

        }

        if (!this.password.value.trim()) {

            event.preventDefault();
            this.invalid(this.password);

            return false;

        }

        return true;

    }

    startUnlock() {

        this.loading = true;

        this.signin.disabled = true;

        this.signin.querySelector("span").textContent = "Unlocking...";

        document.body.classList.add("unlocking");

        // Optional:
        // Start a subtle breathing animation
        // while the backend authenticates.

    }

    invalid(input) {

        input.focus();

        input.animate(

            [
                { transform: "translateX(0)" },
                { transform: "translateX(-6px)" },
                { transform: "translateX(5px)" },
                { transform: "translateX(-3px)" },
                { transform: "translateX(0)" }
            ],

            {
                duration: 320,
                easing: "cubic-bezier(.36,.07,.19,.97)"
            }

        );

    }

}

window.addEventListener("DOMContentLoaded", () => {

    window.lifeLogin = new LifeLogin();

});