<template>
    <div class="modal fade"
        id="mdl-wrong-otp"
        data-bs-backdrop="static"
        tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header justify-content-center border-0 pt-4">
                    <div>
                        <div class="d-flex justify-content-center">
                            <img src="@/assets/img/png/wrong.png"
                                alt="cross.png"
                                style="height: 60px;">
                        </div>
                        <h5 class="modal-title mt-2">Verify Code Fail</h5>
                    </div>
                </div>
                <div class="modal-body">
                    <p class="text-body-tertiary text-center mb-0">Your verify code is incorrect. Please try
                        again.</p>
                </div>
                <div class="modal-footer justify-content-center border-0 pb-4">
                    <button class="btn btn-primary"
                        data-bs-dismiss="modal"
                        type="button">Ok, Got it
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>