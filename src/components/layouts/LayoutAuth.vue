<template>
  <main class="main" id="top">
    <div class="container-fluid bg-body-tertiary dark__bg-gray-1200">
      <div
        class="bg-holder bg-auth-card-overlay"
        style="background-image: url('/cr_assets/png/login_bg.png')"
      ></div>
      <div class="row flex-center position-relative min-vh-90 g-0 py-5">
        <div class="col-11 col-sm-10 col-xl-8">
          <div class="card border border-translucent auth-card">
            <div class="card-body pe-md-0">
              <div class="row align-items-center gx-0 gy-7">
                <div
                  class="col-auto bg-body-highlight dark__bg-gray-1100 rounded-3 position-relative overflow-hidden auth-title-box"
                >
                  <div
                    class="bg-holder"
                    style="background-image: url('/cr_assets/png/login_corner.png')"
                  ></div>
                  <div
                    class="position-relative px-4 px-lg-7 pt-7 pb-7 pb-sm-5 text-center text-md-start pb-lg-7 pb-md-7"
                  >
                    <h3 class="mb-3 text-body-emphasis">ADV Dashboard</h3>
                    <!-- <p class="text-body-tertiary">
                      Outdoor adventure help to promote tourism in Cambodia. We’re
                      promoting very attractive tourist place by providing the detail
                      information such as shop, store and suggestion the best travel
                      materials, equipment for specific area.
                    </p> -->
                    <ul class="list-unstyled mb-0 w-max-content w-md-auto">
                      <li class="d-flex align-items-center">
                        <span class="uil uil-check-circle text-success me-2"></span>
                        <span class="text-body-tertiary fw-semibold">User site</span>
                      </li>
                      <li class="d-flex align-items-center">
                        <span class="uil uil-check-circle text-success me-2"></span>
                        <span class="text-body-tertiary fw-semibold"
                          >Admin dashboard</span
                        >
                      </li>
                      <li class="d-flex align-items-center">
                        <span class="uil uil-check-circle text-success me-2"></span>
                        <span class="text-body-tertiary fw-semibold">Web API</span>
                      </li>
                    </ul>
                  </div>
                  <div
                    class="position-relative z-n1 mb-6 d-none d-md-block text-center mt-md-15"
                  >
                    <img
                      class="auth-title-box-img d-dark-none"
                      src="/cr_assets/png/login_auth.png"
                      alt="illustration"
                    />
                  </div>
                </div>
                <slot></slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <slot name="modal"></slot>
</template>
