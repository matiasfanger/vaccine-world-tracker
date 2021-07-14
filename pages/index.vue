<template>
  <v-container fluid>
    <!-- Github link -->
    <a
      href="https://github.com/matiasfanger/vaccine-world-tracker"
      class="d-flex white--text"
      style="
        right: 1%;
        position: absolute;
        text-decoration: none;
        color: inherit;
      "
    >
      <v-icon color="gray">mdi-github</v-icon></a
    >

    <!-- Main content -->
    <v-row align="center" justify="center">
      <v-col xs="12" sm="6" md="6">
        <!-- Title -->
        <h1 class="text-center pt-5">Vaccine World Tracker 💉</h1>
        <!-- Country picker -->
        <v-sheet class="mx-auto" max-width="500" color="#212733">
          <v-combobox
            @click:prepend="showDialog = true"
            prepend-icon="mdi-information"
            class="mt-5"
            label="Country"
            outlined
            dense
            :items="countries"
            item-text="name"
            item-value="name"
            v-model="countrySelected"
          >
            <template v-slot:[`item`]="{ item }">
              <gb-flag :code="item.code" /> &nbsp; {{ item.name }}
            </template>
            <template v-slot:[`selection`]="{ item }">
              <gb-flag :code="item.code" /> &nbsp; {{ item.name }}
            </template>
          </v-combobox>
        </v-sheet>
      </v-col>

      <v-col cols="12" 
        ><LineChart
          :styles="myStyles"
          v-if="componentRenderer"
          :chartData="barChartData"
          :options="barChartOptions"
          :key="keyvalue"
        />
      </v-col>
    </v-row>

    <!-- Dialog -->
    <div class="text-center" v-if="componentRenderer">
      <v-dialog v-model="showDialog" width="700">
        <v-card>
          <v-card-title class="headline indigo darken-1">
            Information of {{ latestCountryPicked.name }} ({{
              latestCountryPicked.code
            }})
          </v-card-title>

          <v-card-text class="mt-3 white--text body-1">
            Vaccine type {{ countryInfo.data.data[0].vaccine_type
            }}<br /><br />
            <v-row>
              <v-col>
                <strong class="font-weight-light"
                  >Total dose vaccinations:</strong
                >
                {{ countryInfo.data.data[0].total_dose_vaccinations
                }}<br />
                <strong class="font-weight-light">People vaccinated:</strong>
                {{ countryInfo.data.data[0].people_vaccinated }}<br />
                <strong class="font-weight-light"
                  >People fully vaccinated:</strong
                >
                {{ countryInfo.data.data[0].people_fully_vaccinated
                }}<br />
              </v-col>
              <v-col>
                <strong class="font-weight-light">Daily vaccinations:</strong>
                {{ countryInfo.data.data[0].daily_vaccinations }}<br />
                <strong class="font-weight-light"
                  >Daily vaccinations per million:</strong
                >
                {{ countryInfo.data.data[0].daily_vaccinations_per_million
                }}<br />
                <strong class="font-weight-light"
                  >People fully vaccinated per hundred:</strong
                >
                {{ countryInfo.data.data[0].people_vaccinated_per_hundred
                }}<br />
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="showDialog = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      showDialog: false,
      keyvalue: 0,
      componentRenderer: false,
      gradient: null,
      countries: [],
      countrySelected: "",
      defaultCountry: "",
      countryInfo: {},
      barChartData: {
        labels: [],
        datasets: [
          {
            label: "Daily vaccinations",
            data: [],
            backgroundColor: "rgba(255, 0,0, 0.5)",
            pointBackgroundColor: "white",
            borderWidth: 1,
            pointBorderColor: "white",
            radius: 3,
          },
        ],
      },
      barChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        borderWidth: 3,
        legend: {
          display: false,
        },
        title: {
          display: false,
          text: "Vaccines World Tracker",
          fontSize: 24,
          fontColor: "#FF0700",
        },
        tooltips: {
          backgroundColor: "#17BF62",
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              color: "#444",
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: false,
              },
            },
          ],
        },
      },
    };
  },
  watch: {
    countrySelected: function () {
      if (this.countries.includes(this.countrySelected)) {
        this.obtenerPais();
      }
    },
  },
  computed: {
    myStyles() {
      return {
        height: "75vh",
        width: "99vw",
        position: "absolute",
      };
    },
  },
  methods: {
    async getIp() {
      // TODO: Save in localstorage.
      // GETTING USER IP
      const ip = await axios({ method: "GET", url: "https://httpbin.org/ip" });
      // GETTING USER COUNTRY
      const location = await axios({
        method: "GET",
        url: "https://ipapi.co/" + ip.data.origin + "/json/",
        headers: { "content-type": "application/json" },
      });
      // SAVING DATA
      this.latestCountryPicked = this.countrySelected = this.defaultCountry = { name: location.data.country_name, code: location.data.country };
      // GETTING COUNTRIES LIST
      const countriesList = await fetch(
        "https://gist.githubusercontent.com/matifanger/4841780c0758152fbf592ed84e755d68/raw/fc47ebaaf923ce17d7550e9df976b7cc3e396e31/countries.json"
      );
      if (!countriesList.ok) {
        const message = `An error has occured: ${countriesList.status}`;
        this.$swal.fire({
          icon: "error",
          title: "Error!",
          text: message,
          footer:
            '<a href="https://github.com/matifanger/vaccine-world-tracker/issues">Tell me here!</a>',
        });
      }
      this.countries = await countriesList.json();
      // console.log(this.countries);
      this.obtenerPais();
    },
    obtenerPais() {
      console.log("starting");
      axios({
        method: "GET",
        url:
          "https://api.thecovidvaccines.com/api/v1/countries/" +
          this.countrySelected.name,
      })
        .then((result) => {
          if (result.status == 200) {
            this.latestCountryPicked = this.countrySelected;
            this.countryInfo = result;
            // CLEANING CHART DATA
            this.barChartData.labels = [];
            this.barChartData.datasets[0].data = [];

            // FILLING CHART DATA
            for (let i = 0; i < result.data.data.length; i++) {
              var date = result.data.data[i]["date"];
              var daily_vaccinations =
                result.data.data[i]["daily_vaccinations"];
              if (date != null || daily_vaccinations != null) {
                this.barChartData.labels.push(date);
                this.barChartData.datasets[0].data.push(daily_vaccinations);
              }
            }

            // SORTING CHART DATA
            this.barChartData.labels = this.barChartData.labels.sort();
            console.log();
            this.barChartData.datasets[0].data =
              this.barChartData.datasets[0].data.reverse();

            // RE-RENDERING THE CHART
            this.keyvalue++;

            // COUNTRY LOADED SUCCESS
            this.componentRenderer = true;
          }
        })
        .catch((error) => {
          this.latestCountryPicked = this.countrySelected = this.defaultCountry;
          this.$swal.fire({
            icon: "error",
            title: "Sorry!",
            text: "We don't have any information about that country 😔",
          });
        });
    },
  },
  mounted() {
    this.getIp();
  },
};
</script>


<style>
/* SCROLLBAR OUT */
::-webkit-scrollbar {
  display: none;
}

h1 {
  font-family: "Comic Sans", Verdana, sans-serif;
  color: #ff0700;
}
</style>