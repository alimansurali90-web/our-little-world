// ===============================
// OUR LITTLE WORLD ❤️
// SHARED DIARY SYSTEM
// ===============================


// ===============================
// AUTH BOX NAVIGATION
// ===============================

function hideAllDiaryBoxes() {

    const boxes = [
        "openDiaryBox",
        "createDiaryBox",
        "joinDiaryBox",
        "diaryCreatedBox",
        "recoveryBox",
        "partnerRecoveryBox",
        "emergencyRecoveryBox"
    ];

    boxes.forEach(function (id) {

        const box = document.getElementById(id);

        if (box) {
            box.style.display = "none";
        }

    });

}


function showOpenDiary() {



    const box = document.getElementById("openDiaryBox");

    if (box) {
        box.style.display = "block";
    }

    clearMessage();
}


function showCreateDiary() {



    const box = document.getElementById("createDiaryBox");

    if (box) {
        box.style.display = "block";
    }

    clearMessage();
}


function showJoinDiary() {



    const box = document.getElementById("joinDiaryBox");

    if (box) {
        box.style.display = "block";
    }

    clearMessage();
}


function showRecovery() {



    const box = document.getElementById("recoveryBox");

    if (box) {
        box.style.display = "block";
    }

    clearMessage();
}


function partnerRecovery() {



    const box = document.getElementById("partnerRecoveryBox");

    if (box) {
        box.style.display = "block";
    }

    clearMessage();
}


function emergencyRecovery() {



    const box =
        document.getElementById("emergencyRecoveryBox");

    if (box) {
        box.style.display = "block";
    }

    clearMessage();
}


function clearMessage() {

    const message =
        document.getElementById("authMessage");

    if (message) {
        message.textContent = "";
    }

}


// ===============================
// GENERATE RANDOM VALUES
// ===============================

function generateDiaryId() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let part1 = "";
    let part2 = "";

    for (let i = 0; i < 4; i++) {

        part1 += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );

    }

    for (let i = 0; i < 4; i++) {

        part2 += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );

    }

    return "OWL-" + part1 + "-" + part2;
}


function generateInviteCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 8; i++) {

        code += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );

    }

    return code;
}


function generateRecoveryKey() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let key = "";

    for (let i = 0; i < 32; i++) {

        key += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );

    }

    return key;
}


// ===============================
// CREATE DIARY
// ===============================

async function createDiary() {

    const yourName =
        document.getElementById("yourName").value.trim();

    const partnerName =
        document.getElementById("partnerName").value.trim();

    const yourPhone =
        document.getElementById("yourPhone").value.trim();

    const partnerPhone =
        document.getElementById("partnerPhone").value.trim();

    const pin =
        document.getElementById("createPin").value.trim();

    const message =
        document.getElementById("authMessage");


    if (
        yourName === "" ||
        partnerName === "" ||
        yourPhone === "" ||
        partnerPhone === "" ||
        pin === ""
    ) {

        message.textContent =
            "Please fill in all details ❤️";

        return;
    }


    if (pin.length < 4) {

        message.textContent =
            "Your PIN should be at least 4 characters 🔐";

        return;
    }


    message.textContent =
        "Creating your private world... 💕";


    const diaryId =
        generateDiaryId();

    const inviteCode =
        generateInviteCode();

    const recoveryKey =
        generateRecoveryKey();


    const diaryName =
        yourName + " + " + partnerName;


    const diary = {

        diaryName: diaryName,

        diaryId: diaryId,

        inviteCode: inviteCode,

        recoveryKey: recoveryKey,

        yourName: yourName,

        partnerName: partnerName,

        yourPhone: yourPhone,

        partnerPhone: partnerPhone,

        pin: pin,

        createdAt: new Date().toISOString()

    };


    // Save the diary locally so the current phone
    // continues to work exactly as before.
    localStorage.setItem(
        "ourLittleWorldDiary",
        JSON.stringify(diary)
    );


    // Save the same diary to Supabase.
const { data, error } = await supabaseClient.rpc(
    "create_our_world",
    {
        p_diary_name: diaryName,
        p_person1_name: yourName,
        p_person1_phone: yourPhone,
        p_person2_name: partnerName,
        p_person2_phone: partnerPhone,
        p_pin: pin
    }
);

if (error) {
console.error(
    "Supabase diary save error:",
    JSON.stringify(error, null, 2)
);

message.textContent =
    "Could not save diary: " +
    (error.message || error.details || error.hint || "Unknown error");

        return;
    }





    const createdBox =
        document.getElementById("diaryCreatedBox");

    if (createdBox) {
        createdBox.style.display = "block";
    }


    document.getElementById("createdDiaryName").textContent =
        diaryName;

    document.getElementById("createdDiaryId").textContent =
        diaryId;

    document.getElementById("createdInviteCode").textContent =
        inviteCode;

    document.getElementById("createdRecoveryKey").textContent =
        recoveryKey;


    message.textContent =
        "Your world has been created! ❤️";

}


// ===============================
// OPEN DIARY
// ===============================
async function openDiary() {

    const diaryId =
        document.getElementById("diaryId").value.trim();

    const pin =
        document.getElementById("diaryPin").value.trim();

    const message =
        document.getElementById("authMessage");


    if (diaryId === "" || pin === "") {

        message.textContent =
            "Please enter your Diary ID and PIN 🔐";

        return;
    }


    message.textContent =
        "Finding your shared world... ❤️";


    // Find the diary directly in Supabase
    const { data: diary, error } =
        await supabaseClient
            .from("diaries")
            .select("*")
            .eq("diary_id", diaryId)
            .eq("pin", pin)
            .maybeSingle();


    if (error) {

        console.error(
            "Supabase diary lookup error:",
            error
        );

        message.textContent =
            "Could not connect to your shared diary. ❌";

        return;
    }


    if (!diary) {

        message.textContent =
            "Diary ID or PIN is incorrect. 💔";

        return;
    }


    // Save the diary locally for this device
    localStorage.setItem(
        "ourLittleWorldDiary",
        JSON.stringify({
            diaryName: diary.diary_name,
            diaryId: diary.diary_id,
            inviteCode: diary.invite_code,
            recoveryKey: diary.recovery_key,
            yourName: diary.person1_name,
            partnerName: diary.person2_name,
            yourPhone: diary.person1_phone,
            partnerPhone: diary.person2_phone,
            pin: diary.pin,
            createdAt: diary.created_at
        })
    );


    message.textContent =
        "Welcome back to your little world! ❤️";


    setTimeout(function () {

        const authSection =
            document.getElementById("authSection");

        if (authSection) {
            authSection.style.display = "none";
        }

        showFeaturePopup();

    }, 500);

}


// ===============================
// JOIN DIARY
// ===============================
async function joinDiary() {

    const diaryId =
        document.getElementById("joinDiaryId").value.trim();

    const inviteCode =
        document.getElementById("inviteCode").value.trim();

    const joinName =
        document.getElementById("joinName").value.trim();

    const joinPhone =
        document.getElementById("joinPhone").value.trim();

    const message =
        document.getElementById("authMessage");


    if (
        diaryId === "" ||
        inviteCode === "" ||
        joinName === "" ||
        joinPhone === ""
    ) {

        message.textContent =
            "Please fill in all details ❤️";

        return;
    }


    message.textContent =
        "Finding your shared world... ❤️";


    // Find the diary in Supabase
    const { data: diary, error } =
        await supabaseClient
            .from("diaries")
            .select("*")
            .eq("diary_id", diaryId)
            .eq("invite_code", inviteCode)
            .maybeSingle();


    if (error) {

        console.error(
            "Supabase diary join error:",
            JSON.stringify(error, null, 2)
        );

        message.textContent =
            "Could not connect to your shared diary. ❌";

        return;
    }


    if (!diary) {

        message.textContent =
            "Diary ID or Invitation Code is incorrect. 💔";

        return;
    }


    // Save the shared diary on this device
    localStorage.setItem(
        "ourLittleWorldDiary",
        JSON.stringify({

            diaryName: diary.diary_name,

            diaryId: diary.diary_id,

            inviteCode: diary.invite_code,

            recoveryKey: diary.recovery_key,

            yourName: joinName,

            partnerName:
                diary.person1_name,

            yourPhone: joinPhone,

            partnerPhone:
                diary.person1_phone,

            pin: diary.pin,

            createdAt: diary.created_at

        })
    );


    message.textContent =
        "You joined Our Little World! ❤️";


    setTimeout(function () {

        const authSection =
            document.getElementById("authSection");

        if (authSection) {
            authSection.style.display = "none";
        }

        showFeaturePopup();

    }, 800);

}


// ===============================
// SHARE INVITATION
// ===============================

async function shareInvitation() {

    const savedDiary =
        localStorage.getItem("ourLittleWorldDiary");


    if (!savedDiary) {

        alert("Diary information not found.");

        return;
    }


    const diary =
        JSON.parse(savedDiary);


    const invitationText =

`💕 Join Our Little World ❤️

Our private shared diary is ready!

Diary Name:
${diary.diaryName}

Diary ID:
${diary.diaryId}

Invitation Code:
${diary.inviteCode}

Open Our Little World and use these details to join me. ❤️`;


    if (navigator.share) {

        try {

            await navigator.share({

                title: "Our Little World ❤️",

                text: invitationText

            });

        } catch (error) {

            console.log("Share cancelled.");

        }

    } else {

        try {

            await navigator.clipboard.writeText(
                invitationText
            );

            alert(
                "Invitation copied! ❤️ You can paste it into WhatsApp or Messages."
            );

        } catch (error) {

            alert(
                invitationText
            );

        }

    }

}


// ===============================
// COPY DIARY DETAILS
// ===============================

async function copyDiaryDetails() {

    const savedDiary =
        localStorage.getItem("ourLittleWorldDiary");


    if (!savedDiary) {

        alert("Diary information not found.");

        return;
    }


    const diary =
        JSON.parse(savedDiary);


    const details =

`Our Little World ❤️

Diary Name: ${diary.diaryName}

Diary ID: ${diary.diaryId}

Invitation Code: ${diary.inviteCode}

Emergency Recovery Key: ${diary.recoveryKey}`;


    try {

        await navigator.clipboard.writeText(details);

        alert(
            "Diary details copied! 📋❤️"
        );

    } catch (error) {

        alert(
            "Could not copy automatically. Please copy the details manually."
        );

    }

}


// ===============================
// ENTER DIARY
// ===============================

function continueToDiary() {

    const authSection =
        document.getElementById("authSection");

    if (authSection) {
        authSection.style.display = "none";
    }

    showFeaturePopup();

}


// ===============================
// PARTNER RECOVERY
// ===============================

function requestPartnerRecovery() {

    const diaryId =
        document.getElementById("recoveryDiaryId").value.trim();

    const name =
        document.getElementById("recoveryName").value.trim();

    const message =
        document.getElementById("authMessage");


    if (diaryId === "" || name === "") {

        message.textContent =
            "Please enter your Diary ID and name ❤️";

        return;
    }


    message.textContent =
        "Recovery request created. Your partner will need to approve it. 💕";

}


// ===============================
// EMERGENCY RECOVERY
// ===============================

function verifyEmergencyRecovery() {

    const key =
        document.getElementById("emergencyKey").value.trim();

    const message =
        document.getElementById("authMessage");


    if (key === "") {

        message.textContent =
            "Please enter your Emergency Recovery Key 🔑";

        return;
    }


    const savedDiary =
        localStorage.getItem("ourLittleWorldDiary");


    if (!savedDiary) {

        message.textContent =
            "No diary is stored on this device.";

        return;
    }


    const diary =
        JSON.parse(savedDiary);


    if (diary.recoveryKey !== key) {

        message.textContent =
            "Recovery key is incorrect. ❌";

        return;
    }


    message.textContent =
        "Recovery successful! Welcome back to your world. ❤️";


    setTimeout(function () {

        const authSection =
            document.getElementById("authSection");

        if (authSection) {
            authSection.style.display = "none";
        }

        showFeaturePopup();

    }, 800);

}


// ===============================
// FEATURE DASHBOARD
// ===============================

function getFeatureElements() {

    return Array.from(
        document.querySelectorAll(
            'button[onclick*="openMemories"],' +
            'button[onclick*="openLetters"],' +
            'button[onclick*="openDates"],' +
            'button[onclick*="openNotes"]'
        )
    );

}


// ===============================
// HIDE FEATURES
// ===============================

function hideFeatures() {

    const features =
        getFeatureElements();


    features.forEach(function (feature) {

        feature.style.display = "none";

        feature.classList.remove("feature-pop");

    });

}


// ===============================
// SHOW FEATURES WITH POP-UP
// ===============================

function showFeaturePopup() {

    const welcome =
        document.querySelector(".welcome");


    if (welcome) {

        welcome.style.display = "block";

    }


    const features =
        getFeatureElements();


    features.forEach(function (feature, index) {

        // Start hidden
        feature.style.display = "none";

        feature.classList.remove("feature-pop");


        setTimeout(function () {

            feature.style.display = "block";


            // Give Android WebView time
            // to render before animation.

            setTimeout(function () {

                feature.classList.add("feature-pop");

            }, 30);

        }, 200 + (index * 180));

    });

}


// ===============================
// HIDE FEATURES WHEN PAGE LOADS
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        hideFeatures();

    }
);


// ===============================
// MEMORY FORM
// ===============================

function showMemoryForm() {

    const form =
        document.getElementById("memoryForm");

    if (form) {
        form.style.display = "block";
    }

}


function hideMemoryForm() {

    const form =
        document.getElementById("memoryForm");

    if (form) {
        form.style.display = "none";
    }

}


// ===============================
// SAVE MEMORY
// ===============================

function saveMemory() {

    const title =
        document.getElementById("memoryTitle").value.trim();

    const date =
        document.getElementById("memoryDate").value;

    const story =
        document.getElementById("memoryStory").value.trim();

    const photoInput =
        document.getElementById("memoryPhoto");

    const photoFile =
        photoInput.files[0];


    if (title === "" || story === "") {

        alert(
            "Please add a title and your memory ❤️"
        );

        return;
    }


    // Save photo as Data URL so it remains
    // available after closing/reopening the app.

    if (photoFile) {

        const reader =
            new FileReader();


        reader.onload = function (event) {

            const memory = {

                id: Date.now(),

                title: title,

                date: date,

                story: story,

                photo: event.target.result

            };


            saveMemoryToStorage(memory);

        };


        reader.readAsDataURL(photoFile);


    } else {

        const memory = {

            id: Date.now(),

            title: title,

            date: date,

            story: story,

            photo: ""

        };


        saveMemoryToStorage(memory);

    }

}


// ===============================
// SAVE MEMORY TO STORAGE
// ===============================



async function saveMemoryToStorage(memory) {

    // Get the couple ID.
    // For now our Supabase couple is ID 1.
    const coupleId = 1;

    const { error } = await supabaseClient
        .from("memories")
        .insert({
            couple_id: coupleId,
            title: memory.title,
            content: memory.story,
            date: memory.date || null,
            photo: memory.photo || null
        });

    if (error) {

        console.error("Supabase save error:", error);

        alert(
            "Could not save memory to the shared diary. ❌"
        );

        return;
    }


    alert(
        "Memory saved to your shared world! ❤️"
    );


    const titleInput =
        document.getElementById("memoryTitle");

    const dateInput =
        document.getElementById("memoryDate");

    const storyInput =
        document.getElementById("memoryStory");

    const photoInput =
        document.getElementById("memoryPhoto");


    if (titleInput) {
        titleInput.value = "";
    }

    if (dateInput) {
        dateInput.value = "";
    }

    if (storyInput) {
        storyInput.value = "";
    }

    if (photoInput) {
        photoInput.value = "";
    }


    hideMemoryForm();

    loadMemories();
}


// ===============================
// OPEN MEMORIES
// ===============================

function openMemories() {

    const welcome =
        document.querySelector(".welcome");


    if (welcome) {

        welcome.style.display = "none";

    }


    const memoriesSection =
        document.getElementById("memoriesSection");


    if (memoriesSection) {

        memoriesSection.style.display = "block";

        loadMemories();

    }

}


// ===============================
// LOAD MEMORIES
// ===============================


async function loadMemories() {

    const memoryList =
        document.getElementById("memoryList");

    if (!memoryList) {
        return;
    }

    memoryList.innerHTML = `
        <div class="empty-memory">
            <p>Loading our memories... ❤️</p>
        </div>
    `;


    const coupleId = 1;


    const { data: memories, error } = await supabaseClient
        .from("memories")
        .select("*")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false });


    if (error) {

        console.error("Supabase load error:", error);

        memoryList.innerHTML = `
            <div class="empty-memory">
                <p>Could not load our memories. ❌</p>
            </div>
        `;

        return;
    }


    memoryList.innerHTML = "";


    if (!memories || memories.length === 0) {

        memoryList.innerHTML = `

            <div class="empty-memory">

                <p>💭 No memories yet.</p>

                <p>
                    Create your first beautiful
                    memory together ❤️
                </p>

            </div>

        `;

        return;
    }


    memories.forEach(function (memory) {

        const memoryCard =
            document.createElement("div");

        memoryCard.className = "memory";

        memoryCard.style.cursor = "pointer";
        memoryCard.style.touchAction = "manipulation";


        memoryCard.innerHTML = `

            <div class="memory-content">

                <h3>
                    💕 ${escapeHTML(memory.title)}
                </h3>

                ${
                    memory.date
                        ? `
                            <small>
                                📅 ${escapeHTML(memory.date)}
                            </small>
                        `
                        : `
                            <small>
                                📅 A special day ❤️
                            </small>
                        `
                }

            </div>

        `;


        memoryCard.onclick = function () {
            openMemory(memory.id);
        };


        memoryCard.addEventListener(
            "touchend",
            function (event) {

                event.preventDefault();

                openMemory(memory.id);

            }
        );


        memoryList.appendChild(memoryCard);

    });

}


// ===============================
// OPEN ONE MEMORY
// ===============================
async function openMemory(memoryId) {

    const { data: memory, error } = await supabaseClient
        .from("memories")
        .select("*")
        .eq("id", memoryId)
        .single();


    if (error || !memory) {

        console.error("Supabase memory error:", error);

        alert(
            "Memory could not be found. ❌"
        );

        return;
    }


    const oldPopup =
        document.querySelector(".memory-popup");


    if (oldPopup) {
        oldPopup.remove();
    }


    const popup =
        document.createElement("div");


    popup.className =
        "memory-popup";


    popup.innerHTML = `

        <div class="memory-popup-box">

            <button
                class="memory-close"
                onclick="closeMemoryPopup()"
            >
                ×
            </button>

            <div class="memory-popup-heart">
                ❤️
            </div>

            <h2>
                ${escapeHTML(memory.title)}
            </h2>

            ${
                memory.date
                    ? `
                        <div class="memory-popup-date">
                            📅 ${escapeHTML(memory.date)}
                        </div>
                    `
                    : `
                        <div class="memory-popup-date">
                            📅 A special day ❤️
                        </div>
                    `
            }

            ${
                memory.photo
                    ? `
                        <img
                            src="${memory.photo}"
                            class="memory-popup-photo"
                            alt="Memory photo"
                        >
                    `
                    : ""
            }

            <div class="memory-popup-story">
                ${escapeHTML(memory.content)}
            </div>

            <button
                class="memory-delete"
                onclick="deleteMemory(${memory.id})"
            >
                🗑️ Delete Memory
            </button>

        </div>

    `;


    document.body.appendChild(popup);


    popup.addEventListener(
        "click",
        function (event) {

            if (event.target === popup) {

                closeMemoryPopup();

            }

        }
    );

}


// ===============================
// CLOSE MEMORY POPUP
// ===============================

function closeMemoryPopup() {

    const popup =
        document.querySelector(".memory-popup");


    if (popup) {

        popup.remove();

    }

}


// ===============================
// DELETE MEMORY
// ===============================
async function deleteMemory(memoryId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this memory? ❤️"
        );


    if (!confirmed) {
        return;
    }


    const { error } = await supabaseClient
        .from("memories")
        .delete()
        .eq("id", memoryId);


    if (error) {

        console.error(
            "Supabase delete error:",
            error
        );

        alert(
            "Could not delete the memory. ❌"
        );

        return;
    }


    closeMemoryPopup();

    loadMemories();


    alert(
        "Memory deleted from your shared world. ❤️"
    );

}


// ===============================
// BACK TO HOME
// ===============================

function backToHome() {

    const memoriesSection =
        document.getElementById("memoriesSection");


    if (memoriesSection) {

        memoriesSection.style.display =
            "none";

    }


    const welcome =
        document.querySelector(".welcome");


    if (welcome) {

        welcome.style.display =
            "block";

    }


    showFeaturePopup();

}


// ===============================
// LOVE LETTERS
// ===============================

function openLetters() {

    alert(
        "💌 Love Letters are coming next! ❤️"
    );

}


// ===============================
// SPECIAL DATES
// ===============================

function openDates() {

    alert(
        "📅 Our Special Dates are coming next! ❤️"
    );

}


// ===============================
// OUR NOTES
// ===============================

function openNotes() {

    alert(
        "📝 Our Notes are coming next! ❤️"
    );

}


// ===============================
// SECURITY HELPER
// ===============================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


