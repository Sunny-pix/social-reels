const reelsContainer =
    document.getElementById("reelsContainer");


/* =========================
   REEL DATA
========================= */

const reels = [
    {
        video: "videos/reel1.mp4",
        title: "First Reel",
        description: "This is the first test reel."
    },

    {
        video: "videos/reel2.mp4",
        title: "Second Reel",
        description: "Swipe up to watch the next reel."
    },

    {
        video: "videos/reel3.mp4",
        title: "Third Reel",
        description: "This is the third test reel."
    }
];


/* =========================
   STATE
========================= */

let currentReel = 0;

let isMoving = false;

let touchStartY = 0;
let touchStartTime = 0;

let startTrackPosition = 0;


/* =========================
   CREATE TRACK
========================= */

const track =
    document.createElement("div");

track.className = "reels-track";

reelsContainer.appendChild(track);


/* =========================
   CREATE REELS
========================= */

reels.forEach((reelData) => {

    const reel =
        document.createElement("section");

    reel.className = "reel";


    reel.innerHTML = `
        <video
            src="${reelData.video}"
            muted
            playsinline
            preload="auto"
        ></video>

        <div class="play-indicator">
            ▶
        </div>

        <div class="reel-info">

            <div class="reel-title">
                ${reelData.title}
            </div>

            <div class="reel-description">
                ${reelData.description}
            </div>

        </div>
    `;


    track.appendChild(reel);

    const video = reel.querySelector("video");

video.addEventListener("error", () => {
    video.style.display = "none";

    const message = document.createElement("div");

    message.className = "video-error";
    message.textContent = "Video unavailable";

    reel.appendChild(message);
});

});


/* =========================
   GET ELEMENTS
========================= */

const reelElements =
    Array.from(
        document.querySelectorAll(".reel")
    );

const videos =
    Array.from(
        document.querySelectorAll(".reel video")
    );


/* =========================
   UPDATE POSITION
========================= */

function updatePosition(animate = true) {

    if (animate) {

        track.style.transition =
            "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)";

    } else {

        track.style.transition =
            "none";
    }


    const position =
        currentReel * window.innerHeight;


    track.style.transform =
        `translate3d(0, -${position}px, 0)`;

}


/* =========================
   PLAY CURRENT VIDEO
========================= */

function playCurrentVideo() {

    videos.forEach((video, index) => {

        if (index === currentReel) {

            video.play().catch(() => {});

        } else {

            video.pause();
        }

    });

}


/* =========================
   CHANGE REEL
========================= */

function changeReel(direction) {

    if (isMoving) {
        return;
    }


    const next =
        currentReel + direction;


    if (
        next < 0 ||
        next >= reelElements.length
    ) {

        return;
    }


    isMoving = true;

    currentReel = next;


    updatePosition(true);

    playCurrentVideo();


    setTimeout(() => {

        isMoving = false;

    }, 400);

}


/* =========================
   TOUCH START
========================= */

reelsContainer.addEventListener(
    "touchstart",
    (event) => {

        event.preventDefault();


        if (isMoving) {
            return;
        }


        touchStartY =
            event.touches[0].clientY;

        touchStartTime =
            Date.now();


        startTrackPosition =
            currentReel * window.innerHeight;


        track.style.transition =
            "none";

    },
    {
        passive: false
    }
);


/* =========================
   TOUCH MOVE
========================= */

reelsContainer.addEventListener(
    "touchmove",
    (event) => {

        event.preventDefault();


        if (isMoving) {
            return;
        }


        const currentY =
            event.touches[0].clientY;


        const difference =
            touchStartY - currentY;


        /*
         * Limit the drag.
         *
         * The user can move the reel
         * slightly, but cannot drag
         * through multiple reels.
         */

        const maxDrag =
            window.innerHeight * 0.99;


        let limitedDifference =
            Math.max(
                -maxDrag,
            Math.min(
                maxDrag,
                difference
                    )
                );

        if (
            currentReel === 0 &&
            difference < 0
        ) {
            limitedDifference = 0;
        }

        if (
            currentReel === reelElements.length - 1 &&
            difference > 0
        ) {
            limitedDifference = 0;
        }


        const position =
            startTrackPosition +
            limitedDifference;


        track.style.transform =
            `translate3d(
                0,
                -${position}px,
                0
            )`;

    },
    {
        passive: false
    }
);


/* =========================
   TOUCH END
========================= */

reelsContainer.addEventListener(
    "touchend",
    (event) => {

        event.preventDefault();


        if (isMoving) {
            return;
        }


        const touchEndY =
            event.changedTouches[0].clientY;


        const difference =
            touchStartY - touchEndY;


        const distance =
            Math.abs(difference);


        /*
         * Small movement = return
         * to current reel.
         */

        if (distance < 100) {

            updatePosition(true);

            return;
        }


        /*
         * SWIPE UP
         */
        if (difference > 60) {
            currentReel = Math.min(currentReel + 1, reelElements.length - 1);
        } else {
            currentReel = Math.max(currentReel - 1, 0);
        }
      
    
        /*
         * SWIPE DOWN
         */
        
        isMoving = true;

        updatePosition(true);
        playCurrentVideo();

        setTimeout(() => {
             isMoving = false;
        }, 400);
        

    },
    {
        passive: false
    }
);


/* =========================
   DESKTOP WHEEL
========================= */

let wheelLocked = false;

reelsContainer.addEventListener(
    "wheel",
    (event) => {

        event.preventDefault();

        if (wheelLocked || isMoving) {
            return;
        }

        wheelLocked = true;

        changeReel(
            event.deltaY > 0 ? 1 : -1
        );

        setTimeout(() => {
            wheelLocked = false;
        },1000);
    },
    {
        passive: false
    }
);


/* =========================
   VIDEO TAP
========================= */

videos.forEach((video) => {

    video.addEventListener(
        "click",
        () => {

            const indicator =
                video.parentElement
                    .querySelector(
                        ".play-indicator"
                    );


            if (video.paused) {

                video.play();

                indicator.textContent =
                    "▶";

            } else {

                video.pause();

                indicator.textContent =
                    "Ⅱ";

            }


            indicator.classList.add(
                "show"
            );


            setTimeout(() => {

                indicator.classList.remove(
                    "show"
                );

            }, 500);

        }
    );

});


/* =========================
   WINDOW RESIZE
========================= */

window.addEventListener(
    "resize",
    () => {

        updatePosition(false);

    }
);


/* =========================
   START
========================= */

updatePosition(false);

playCurrentVideo();
