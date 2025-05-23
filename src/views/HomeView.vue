<template>
  <div class="travel-explorer">
    <!-- Header Section -->
    <header class="header">
      <div class="welcome">
        <h1>Hello, {{ userName }} <span class="wave-emoji">👋</span></h1>
        <p class="welcome-text">Welcome back and explore the world.</p>
      </div>
      <div class="search-container">
        <i class="fa fa-search search-icon"></i>
        <input
          type="search"
          placeholder="Search Destinations..."
          v-model="searchQuery"
          class="search-input"
        />
      </div>
      <div class="user-actions">
        <div class="notification-badge">
          <i class="fa fa-bell"></i>
          <span class="badge">3</span>
        </div>
        <div class="user-profile" @click="toggleProfileMenu">
          <img :src="userImage" alt="User Profile" class="avatar" />
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-title">{{ userTitle }}</span>
          </div>
          <i class="fa fa-chevron-down"></i>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Featured Destinations Section -->
      <section class="featured-destinations">
        <div
          v-for="destination in featuredDestinations"
          :key="destination.id"
          class="destination-card"
          :style="{ backgroundImage: `url(${destination.image})` }"
        >
          <div class="destination-info">
            <h3>{{ destination.name }}</h3>
            <div class="location">
              <i class="fa fa-map-marker-alt"></i>
              <span>{{ destination.location }}</span>
            </div>
            <div class="rating">
              <i class="fa fa-star"></i>
              <span>{{ destination.rating }}</span>
            </div>
          </div>
        </div>
      </section>

      <div class="content-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Best Destinations Section -->
          <section class="best-destinations">
            <div class="section-header">
              <h2>Best Destination <span class="emoji">🚀</span></h2>
              <span class="destination-count">100+ Destination found</span>
            </div>

            <div class="filter-bar">
              <button class="filter-button">
                <i class="fa fa-sliders-h"></i>
                {{ filtersCount }} filters
              </button>
            </div>

            <div class="destination-list">
              <div
                v-for="destination in popularDestinations"
                :key="destination.id"
                class="destination-list-item"
              >
                <div class="destination-image">
                  <img :src="destination.image" :alt="destination.name" />
                </div>
                <div class="destination-details">
                  <h4>{{ destination.name }}</h4>
                  <div class="location">
                    <i class="fa fa-map-marker-alt"></i>
                    <span>{{ destination.location }}</span>
                  </div>
                  <div class="rating">
                    <i class="fa fa-star"></i>
                    <span>{{ destination.rating }}</span>
                  </div>
                </div>
                <div class="destination-price">
                  <span class="price">${{ destination.price }}</span>
                  <span class="price-period">/day</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Calendar Section -->
          <section class="calendar-section">
            <div class="month-navigator">
              <h3>{{ currentMonth }} {{ currentYear }}</h3>
              <div class="month-controls">
                <button class="control-button" @click="previousMonth">
                  <i class="fa fa-chevron-left"></i>
                </button>
                <button class="control-button" @click="nextMonth">
                  <i class="fa fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <div class="calendar">
              <div class="weekdays">
                <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
              </div>
              <div class="days">
                <div
                  v-for="day in calendarDays"
                  :key="day.value"
                  :class="[
                    'day',
                    {
                      'current-day': day.isCurrentDay,
                      'has-event': day.hasEvent,
                      'other-month': !day.isCurrentMonth,
                    },
                  ]"
                >
                  {{ day.value }}
                </div>
              </div>
            </div>
          </section>

          <!-- Schedule Section -->
          <section class="schedule-section">
            <div class="section-header">
              <h3>My Schedule</h3>
              <button class="more-button">
                <i class="fa fa-ellipsis-h"></i>
              </button>
            </div>

            <div class="schedule-list">
              <div v-for="trip in upcomingTrips" :key="trip.id" class="schedule-item">
                <div class="trip-image">
                  <img :src="trip.image" :alt="trip.name" />
                </div>
                <div class="trip-details">
                  <h4>{{ trip.name }}</h4>
                  <div class="trip-date">
                    <i class="fa fa-calendar-alt"></i>
                    <span>{{ trip.date }}</span>
                  </div>
                </div>
                <div class="attendees">
                  <div class="attendee-avatars">
                    <div v-for="n in trip.attendees" :key="n" class="attendee-avatar">
                      {{ n <= 3 ? n : "+" + (trip.attendees - 3) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Promotional Panel -->
    <div class="promo-panel">
      <div class="promo-character">
        <img
          src="https://www.campsited.com/wp-content/uploads/2021/09/eco-camping-382x214.jpg"
          alt="Adventure Character"
        />
      </div>
      <div class="promo-content">
        <h3>Let's Explore The Beauty</h3>
        <p>Get special offers & news</p>
        <button class="promo-button">Join Now</button>
      </div>
    </div>

    <!-- Navigation Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-icon">🌍</span>
      </div>
      <nav class="nav-menu">
        <a href="#" class="nav-item active">
          <i class="fa fa-home"></i>
        </a>
        <a href="#" class="nav-item">
          <i class="fa fa-map-marked-alt"></i>
        </a>
        <a href="#" class="nav-item">
          <i class="fa fa-mountain"></i>
        </a>
        <a href="#" class="nav-item">
          <i class="fa fa-sun"></i>
        </a>
        <a href="#" class="nav-item">
          <i class="fa fa-compass"></i>
        </a>
      </nav>
      <div class="sidebar-footer">
        <a href="#" class="nav-item">
          <i class="fa fa-cog"></i>
        </a>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

// User Data
const userName = ref("Jeremy");
const userTitle = ref("Traveler Enthusiast");
const userImage = ref(
  "https://static.vecteezy.com/system/resources/previews/048/414/267/non_2x/tour-guide-icon-against-transparent-background-generated-by-ai-free-png.png"
);

// Search
const searchQuery = ref("");

// Filters
const filtersCount = ref(0);

// Calendar
const currentMonth = ref("June");
const currentYear = ref("2025");
const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Sample Data
const featuredDestinations = ref([
  {
    id: 1,
    name: "Mount Fuji",
    location: "Japan",
    image:
      "https://americanhiking.org/wp-content/uploads/2019/08/ER-web-Big_Basin_Late_Day_Landscape-Max-Forster.jpg",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Eco Camping",
    location: "Patagonia",
    image:
      "https://www.europe-consommateurs.eu/fileadmin/_processed_/6/8/csm_camping-sauvage-tourisme_539c5d8f8c.jpg",
    rating: 4.5,
  },
  {
    id: 3,
    name: "Mount Everest",
    location: "Nepal",
    image:
      "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/10/5c/8f/5d.jpg",
    rating: 4.7,
  },
]);

const popularDestinations = ref([
  {
    id: 1,
    name: "Redwood Forest",
    location: "California",
    image:
      "https://ecocamping.de/wp-content/uploads/2023/03/E-Mob-Roadshow-2021-08-5466-klein-scaled-e1677654409433-1024x774.jpg",
    price: 150,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Sahale Glacier Camp",
    location: "Washington",
    image:
      "https://wildlandtrekking.com/content/webp-express/webp-images/doc-root/content/uploads/2024/07/sahale-glacier-camp-tents.jpg.webp",
    price: 100,
    rating: 4.7,
  },
  {
    id: 3,
    name: "Monteverde Forest",
    location: "Costa Rica",
    image: "https://www.infobuildenergia.it/wp-content/uploads/2020/07/eco-campeggio.jpg",
    price: 120,
    rating: 4.5,
  },
]);

const upcomingTrips = ref([
  {
    id: 1,
    name: "Crooked Forest",
    date: "23 June, 2025",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLeRQ6D8eWE2ENX09ONrLVEWUcQjC6t-0KZw&s",
    attendees: 2,
  },
  {
    id: 2,
    name: "Gioc Waterfall",
    date: "28 June, 2025",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNsWJ-QIV1pT0sd7Hi5fkF-ZKkyrMvyBXj3W8ykxBhrpySIo_xcCc23UuB-_T__REkoDU&usqp=CAU",
    attendees: 3,
  },
  {
    id: 3,
    name: "Tortuguero Camp",
    date: "4 July, 2025",
    image:
      "https://extraordinaryjourneys.com/wp-content/uploads/2014/12/eco_camp_suite_ext-1024x683.jpg",
    attendees: 6,
  },
]);

const calendarDays = computed(() => {
  const days = [];
  const totalDays = 30;
  for (let i = 29; i <= 31; i++) {
    days.push({
      value: i,
      isCurrentMonth: false,
      isCurrentDay: false,
      hasEvent: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      value: i,
      isCurrentMonth: true,
      isCurrentDay: i === 16,
      hasEvent: [10, 17, 23, 28].includes(i),
    });
  }

  for (let i = 1; i <= 9; i++) {
    days.push({
      value: i,
      isCurrentMonth: false,
      isCurrentDay: false,
      hasEvent: false,
    });
  }

  return days;
});

// Methods
const toggleProfileMenu = () => {
  // Would implement dropdown functionality here
  console.log("Toggle profile menu");
};

const previousMonth = () => {
  // Would implement month navigation here
  console.log("Previous month");
};

const nextMonth = () => {
  // Would implement month navigation here
  console.log("Next month");
};

// Lifecycle
onMounted(() => {
  // Any initialization code would go here
});
</script>

<style scoped>
.travel-explorer {
  font-family: "Poppins", sans-serif;
  background-color: #f7f9fc;
  color: #333;
  min-height: 100vh;
  position: relative;
  padding-left: 80px; /* Space for sidebar */
  padding-right: 20px;
  padding-top: 20px;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.welcome h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
}

.wave-emoji {
  display: inline-block;
  animation: wave 1.5s infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(14deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  30% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.welcome-text {
  color: #6c757d;
  font-size: 14px;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background-color: #fff;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-badge {
  position: relative;
}

.notification-badge i {
  font-size: 18px;
  color: #6c757d;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.user-title {
  font-size: 12px;
  color: #6c757d;
}

/* Main Content Styles */
.main-content {
  padding: 0 20px;
}

.featured-destinations {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.destination-card {
  height: 180px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  color: white;
}

.destination-card:hover {
  transform: translateY(-5px);
}

.destination-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.destination-info h3 {
  color: white;
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 600;
}

.location,
.rating {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: white;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

/* Best Destinations Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2,
.section-header h3 {
  font-weight: 700;
  margin: 0;
}

.destination-count {
  font-size: 14px;
  color: #6c757d;
}

.filter-bar {
  margin-bottom: 20px;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f0f2f5;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.filter-button:hover {
  background-color: #e5e8ec;
}

.destination-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.destination-list-item {
  display: flex;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.destination-image {
  width: 90px;
  height: 70px;
  overflow: hidden;
}

.destination-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.destination-details {
  flex: 1;
  padding: 10px 15px;
}

.destination-details h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
}

.destination-price {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 15px;
  font-weight: 700;
  color: #3f51b5;
}

.price {
  font-size: 18px;
}

.price-period {
  font-size: 12px;
  color: #6c757d;
  font-weight: 400;
}

/* Calendar Section */
.calendar-section {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.month-navigator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.month-controls {
  display: flex;
  gap: 10px;
}

.control-button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.control-button:hover {
  background-color: #e5e8ec;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 600;
  color: #6c757d;
  font-size: 12px;
  margin-bottom: 10px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-radius: 50%;
  cursor: pointer;
}

.day:hover {
  background-color: #f0f2f5;
}

.current-day {
  background-color: #4caf50;
  color: white;
}

.has-event {
  position: relative;
}

.has-event::after {
  content: "";
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #f44336;
}

.other-month {
  color: #bdbdbd;
}

/* Schedule Section */
.schedule-section {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.more-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trip-image {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
}

.trip-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-details {
  flex: 1;
}

.trip-details h4 {
  margin: 0 0 5px 0;
  font-size: 15px;
  font-weight: 600;
}

.trip-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6c757d;
}

.attendees {
  display: flex;
  align-items: center;
}

.attendee-avatars {
  display: flex;
}

.attendee-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #616161;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-left: -8px;
  border: 2px solid white;
}

.attendee-avatar:first-child {
  margin-left: 0;
}

/* Promo Panel */
.promo-panel {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #3f51b5;
  border-radius: 16px;
  padding: 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 20px;
  width: 320px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.promo-character img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.promo-content h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 600;
}

.promo-content p {
  margin: 0 0 15px 0;
  font-size: 14px;
  opacity: 0.9;
}

.promo-button {
  background-color: white;
  color: #3f51b5;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.promo-button:hover {
  background-color: #f0f2f5;
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.logo {
  margin-bottom: 50px;
}

.logo-icon {
  font-size: 24px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.nav-item {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #f0f2f5;
  color: #3f51b5;
}

.nav-item.active {
  background-color: #3f51b5;
  color: white;
}

.sidebar-footer {
  margin-top: auto;
  padding-bottom: 20px;
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .right-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .featured-destinations {
    grid-template-columns: repeat(2, 1fr);
  }

  .right-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .travel-explorer {
    padding-left: 0;
    padding-bottom: 70px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .search-container {
    width: 100%;
  }

  .user-actions {
    width: 100%;
    justify-content: space-between;
  }

  .featured-destinations {
    grid-template-columns: 1fr;
  }

  .sidebar {
    top: auto;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 60px;
    flex-direction: row;
    padding: 0 20px;
  }

  .logo,
  .sidebar-footer {
    display: none;
  }

  .nav-menu {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }

  .promo-panel {
    width: 100%;
    right: 0;
    bottom: 60px;
    border-radius: 0;
  }
}
</style>
