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
            Continent {{ countryInfo.continent }}<br /><br />
            <v-row>
              <v-col>
                <strong class="font-weight-light">Cases:</strong>
                {{ countryInfo.cases }}<br />
                <strong class="font-weight-light">Deaths</strong>
                {{ countryInfo.deaths }}<br />
                <strong class="font-weight-light">Recovered:</strong>
                {{ countryInfo.recovered }}<br />
              </v-col>
              <v-col>
                <strong class="font-weight-light">Cases per M:</strong>
                {{ countryInfo.casesPerOneMillion }}<br />
                <strong class="font-weight-light">Tests:</strong>
                {{ countryInfo.tests }}<br />
                <strong class="font-weight-light">Tests per M:</strong>
                {{ countryInfo.testsPerOneMillion }}<br />
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
            label: "Total dose vaccinations",
            data: [],
            backgroundColor: "rgba(255, 0,0, 0.5)",
            pointBackgroundColor: "white",
            borderWidth: 1,
            pointBorderColor: "white",
            radius: 1
          }
        ]
      },
      barChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        borderWidth: 3,
        legend: {
          display: false
        },
        title: {
          display: false,
          text: "Vaccines World Tracker",
          fontSize: 24,
          fontColor: "#FF0700"
        },
        tooltips: {
          backgroundColor: "#17BF62"
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              color: "#444",
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: false
              }
            }
          ]
        }
      }
    };
  },
  watch: {
    countrySelected: function() {
      if (this.countries.includes(this.countrySelected)) {
        this.getHistoricalInfo();
      }
    }
  },
  computed: {
    myStyles() {
      return {
        height: "75vh",
        width: "99vw",
        position: "absolute"
      };
    }
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
        headers: { "content-type": "application/json" }
      });
      // SAVING DATA
      this.latestCountryPicked = this.countrySelected = this.defaultCountry = {
        name: location.data.country_name,
        code: location.data.country
      };
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
            '<a href="https://github.com/matifanger/vaccine-world-tracker/issues">Tell me here!</a>'
        });
      }
      this.countries = await countriesList.json();
      // console.log(this.countries);
      this.getHistoricalInfo();
    },
    async getHistoricalInfo() {
      const historial_response = await axios({
        method: "GET",
        url: "https://corona.lmao.ninja/v2/historical/:query".replace(
          ":query",
          this.countrySelected.code
        ),
        params: {
          lastdays: "all"
        }
      });
      const country_response = await axios({
        method: "GET",
        url: "https://corona.lmao.ninja/v2/countries/:query".replace(
          ":query",
          this.countrySelected.code
        )
      });
      if (
        historial_response.status === 200 &&
        country_response.status === 200
      ) {
        this.latestCountryPicked = this.countrySelected;
        // CLEANING CHART DATA
        this.barChartData.labels = [];
        this.barChartData.datasets[0].data = [];
        // FILLING CHART DATA
        this.barChartData.labels = Object.keys(
          historial_response.data.timeline.cases
        );
        this.barChartData.datasets[0].data = Object.values(
          historial_response.data.timeline.cases
        );

        // FILLING COUNTRY INFO
        this.countryInfo = {
          country: country_response.data.country,
          cases: country_response.data.cases,
          todayCases: country_response.data.todayCases,
          deaths: country_response.data.deaths,
          todayDeaths: country_response.data.todayDeaths,
          recovered: country_response.data.recovered,
          active: country_response.data.active,
          critical: country_response.data.critical,
          casesPerOneMillion: country_response.data.casesPerOneMillion,
          deathsPerOneMillion: country_response.data.deathsPerOneMillion,
          tests: country_response.data.tests,
          testsPerOneMillion: country_response.data.testsPerOneMillion,
          population: country_response.data.population,
          continent: country_response.data.continent,
          oneCasePerPeople: country_response.data.oneCasePerPeople,
          oneDeathPerPeople: country_response.data.oneDeathPerPeople,
          oneTestPerPeople: country_response.data.oneTestPerPeople,
          activePerOneMillion: country_response.data.activePerOneMillion,
          recoveredPerOneMillion: country_response.data.recoveredPerOneMillion,
          criticalPerOneMillion: country_response.data.criticalPerOneMillion,
          affectedCountries: country_response.data.affectedCountries
        };

        // RE-RENDERING THE CHART
        this.keyvalue++;
        // COUNTRY LOADED SUCCESS
        this.componentRenderer = true;
      } else {
        this.latestCountryPicked = this.countrySelected = this.defaultCountry;
        this.$swal.fire({
          icon: "error",
          title: "Sorry!",
          text: "We don't have any information about that country 😔"
        });
      }
    }
  },
  mounted() {
    this.getIp();
  }
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
