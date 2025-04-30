<template>
    <div class="mb-9">
        <div class="row g-2 mb-4">
            <div class="col-auto">
                <h2 class="mb-0">Color</h2>
            </div>
        </div>

        <div id="Colors">
            <div class="mb-4">
                <div class="row g-3 justify-content-between">
                    <div class="col-auto">
                        <div class="search-box">
                            <input v-model="searchQuery" class="form-control search-input search" type="search"
                                placeholder="Search Colors" />
                        </div>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-primary" @click="openModal">
                            <span class="fas fa-plus me-2"></span>Add Color
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="state.isLoading" class="text-center">Loading...</div>
            <div v-else-if="state.error" class="text-center text-danger">
                {{ state.error }}
            </div>
            <div v-else class="table-responsive">
                <table class="table table-sm fs-9 mb-0">
                    <thead>
                        <tr>
                            <th class="align-middle ps-0">#</th>
                            <th class="align-middle">Color Name</th>
                            <th class="align-middle text-end">Created At</th>
                            <th class="align-middle text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filteredColors.length === 0">
                            <td colspan="4" class="text-center">No Colors found</td>
                        </tr>
                        <tr v-else v-for="(Color, index) in filteredColors" :key="Color.id">
                            <td class="align-middle ps-0">{{ index + 1 }}</td>
                            <td class="align-middle">{{ Color.name }}</td>
                            <td class="align-middle text-end">{{ Color.created_at }}</td>
                            <td class="align-middle text-end">
                                <button class="btn btn-sm btn-primary me-2" @click="editColor(Color.id)">
                                    <span class="fas fa-edit me-1"></span>Edit
                                </button>
                                <button class="btn btn-sm btn-danger" @click="deleteColor(Color.id)">
                                    <span class="fas fa-trash me-1"></span>Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
            <h4>{{ isEditMode ? 'Edit' : 'Create' }} Color</h4>
            <div v-if="modalMessage" class="alert alert-danger">{{ modalMessage }}</div>
            <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
                <div class="col-md-12">
                    <label class="form-label" for="ColorName">Color Name</label>
                    <input v-model="newColor.name" class="form-control" id="ColorName" type="text" required />
                    <div class="invalid-feedback">Color name is required</div>
                </div>
                <div class="col-12 float-end">
                    <button class="btn btn-secondary me-2" type="button" @click="closeModal">
                        Cancel
                    </button>
                    <button class="btn btn-primary" type="submit" :disabled="isSubmitting">
                        {{ isSubmitting ? 'Processing...' : (isEditMode ? 'Update' : 'Save') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { useGlobalStore } from '@/stores/global';
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

const state = reactive({
    Colors: [],
    isLoading: false,
    error: null,
});

const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentColorId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");

const newColor = reactive({
    name: "",
});

const fetchColors = async () => {
    state.isLoading = true;
    try {
        const res = await axios.get("/api/product-colors");
        if (res.data.result && Array.isArray(res.data.data)) {
            state.Colors = res.data.data;
        } else {
            state.error = res.data.message || "Failed to fetch Colors";
        }
    } catch (error) {
        state.error = "An error occurred while fetching Colors";
        console.error(error);
    } finally {
        state.isLoading = false;
    }
};

const createColor = async () => {
    const globalStore = useGlobalStore();
    try {
        isSubmitting.value = true;
        modalMessage.value = "";
        const res = await axios.post(
            `/api/product-colors`,
            { name: newColor.name },
            globalStore.getAxiosHeader()
        );
        if (res.data.result) {
            state.Colors.push(res.data.data);
            closeModal();
            resetColorForm();
        } else {
            modalMessage.value = res.data.message || "Failed to create Color";
        }
    } catch (error) {
        console.error("Error creating Color:", error);
        modalMessage.value = "An error occurred while creating the Color";
        await globalStore.onCheckError(error, router);
    } finally {
        isSubmitting.value = false;
    }
};

const updateColor = async () => {
    const globalStore = useGlobalStore();
    try {
        isSubmitting.value = true;
        modalMessage.value = "";
        const res = await axios.put(
            `/api/product-colors/${currentColorId.value}`,
            { name: newColor.name },
            globalStore.getAxiosHeader()
        );
        if (res.data.result) {
            const updatedColor = res.data.data;
            const index = state.Colors.findIndex(t => t.id === updatedColor.id);
            state.Colors.splice(index, 1, updatedColor);
            closeModal();
            resetColorForm();
        } else {
            modalMessage.value = res.data.message || "Failed to update Color";
        }
    } catch (error) {
        console.error("Error updating Color:", error);
        modalMessage.value = "An error occurred while updating the Color";
    } finally {
        isSubmitting.value = false;
    }
};

const deleteColor = async (ColorId) => {
    const globalStore = useGlobalStore();
    if (!confirm("Are you sure you want to delete this Color?")) return;
    try {
        const res = await axios.delete(`/api/product-colors/${ColorId}`, globalStore.getAxiosHeader());
        if (res.data.result) {
            state.Colors = state.Colors.filter(t => t.id !== ColorId);
        } else {
            alert(res.data.message || "Failed to delete Color");
        }
    } catch (error) {
        console.error("Error deleting Color:", error);
        alert("An error occurred while deleting the Color");
    }
};

const openModal = () => {
    resetColorForm();
    isEditMode.value = false;
    showModal.value = true;
};

const editColor = (ColorId) => {
    const Color = state.Colors.find(t => t.id === ColorId);
    if (Color) {
        newColor.name = Color.name;
        currentColorId.value = ColorId;
        isEditMode.value = true;
        showModal.value = true;
    }
};

const closeModal = () => {
    showModal.value = false;
    resetColorForm();
    modalMessage.value = "";
};

const resetColorForm = () => {
    newColor.name = "";
    currentColorId.value = null;
};

const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newColor.name.trim()) {
        modalMessage.value = "Color name is required";
        return;
    }

    if (isEditMode.value) {
        await updateColor();
    } else {
        await createColor();
    }
};

const filteredColors = computed(() => {
    return state.Colors.filter((Color) =>
        Color.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

onMounted(fetchColors);
</script>
