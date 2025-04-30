<template>
    <nav class="navbar navbar-top fixed-top navbar-expand py-0"
         id="navbarDefault">
        <div class="collapse navbar-collapse justify-content-between">
            <div class="navbar-logo">
                <button class="btn navbar-toggler navbar-toggler-humburger-icon hover-bg-transparent"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarVerticalCollapse"
                        aria-controls="navbarVerticalCollapse"
                        aria-expanded="false"
                        aria-label="Toggle Navigation">
                    <span class="navbar-toggle-icon">
                        <span class="toggle-line"></span>
                    </span>
                </button>
                <div class="navbar-brand me-1 me-sm-3">
                    <div class="d-flex align-items-center">
                        <div class="d-flex align-items-center">
                            <RouterLink to="/">
                                <img src="@/assets/img/png/logo.png"
                                     alt="phoenix"
                                     style="width: 50px">
                            </RouterLink>
                            <div>
                                <RouterLink to="/">
                                    <h5 class="logo-text ms-2 d-none d-sm-block mb-0 text-primary">adv</h5>
                                </RouterLink>
                                <a class="ms-2 mb-0 logo-text d-none d-sm-block"
                                   style="font-size: 11px"
                                   href="https://chandalen.dev"
                                   target="_blank">outdoor adventure</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <TopSearch />
            <ul class="navbar-nav navbar-nav-icons flex-row">
                <TopProfileDrop />
            </ul>
        </div>
    </nav>
</template>

<script setup>
import TopSearch from '@/components/layouts/TopSearch.vue'
import TopProfileDrop from '@/components/layouts/TopProfileDrop.vue'
</script>