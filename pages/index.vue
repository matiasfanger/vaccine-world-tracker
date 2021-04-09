<template>
<v-container fluid>

    <a href="https://github.com/matiasfanger/vaccine-world-tracker" 
    class="d-flex white--text" 
    style="right:1%; position: absolute; text-decoration: none; color: inherit;">
    <v-icon color="gray">mdi-github</v-icon></a>

    
    <v-row align="center" justify="center">

      <v-col xs=12 sm=6 md=6>
        <h1 class="text-center pt-5">Vaccine World Tracker 💉</h1>

      <v-sheet class="mx-auto" max-width="500" color="#212733">

        <!-- Cambiar a v-combobox en un futuro -->
        <v-select @click:prepend="mostrarDialog=true" prepend-icon="mdi-information"  dense
        class="mt-5" v-model="paisSeleccionado" 
        :items="paises" item-text="name" item-value="name" outlined :placeholder="paisSeleccionado" 
        label="Country">

        <template v-slot:[`item`]="{ item }">
        <gb-flag :code="item.code" /> &nbsp; {{item.name}} 
        </template>

        <template v-slot:[`selection`]="{ item }">
        <gb-flag :code="item.code" /> &nbsp; {{item.name}} 
        </template>

        </v-select>

      </v-sheet>
      </v-col>
      <v-col cols=12><v-divider></v-divider></v-col>
      <v-col cols=12><LineChart :styles="myStyles" v-if="componentRenderer" :chartData="barChartData" :options="barChartOptions" :key="keyvalue"  />
    </v-col>
    </v-row>

<!-- Dialog -->
  <div class="text-center" v-if="paisListo">
    <v-dialog
      v-model="mostrarDialog"
      width="700"
    >
      <v-card>
        <v-card-title class="headline indigo darken-1">
          Information of {{paisSeleccionado}}
        </v-card-title>


        <v-card-text class="mt-3 white--text body-1">
          Vaccine type {{paisInfoObtenida.data.data[0].vaccine_type}}<br/><br/>
          <v-row>
          <v-col>
          <strong class="font-weight-light">Total dose vaccinations:</strong> {{paisInfoObtenida.data.data[0].total_dose_vaccinations}}<br/>
          <strong class="font-weight-light">People vaccinated:</strong> {{paisInfoObtenida.data.data[0].people_vaccinated}}<br/>
          <strong class="font-weight-light">People fully vaccinated:</strong> {{paisInfoObtenida.data.data[0].people_fully_vaccinated}}<br/>
          </v-col>
          <v-col>
          <strong class="font-weight-light">Daily vaccinations:</strong> {{paisInfoObtenida.data.data[0].daily_vaccinations}}<br/>
          <strong class="font-weight-light">Daily vaccinations per million:</strong> {{paisInfoObtenida.data.data[0].daily_vaccinations_per_million}}<br/>
          <strong class="font-weight-light">People fully vaccinated per hundred:</strong> {{paisInfoObtenida.data.data[0].people_vaccinated_per_hundred}}<br/>
          </v-col>
          </v-row>          
       
          </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="mostrarDialog = false"
          >
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
      paisListo: false,
      mostrarDialog: false,
      keyvalue: 0,
      componentRenderer: false,
      gradient: null,
      paises: Array,
      paisSeleccionado: String,
      paisDefault: String,
      paisInfoObtenida: Object,
      barChartData: {
        labels: [],
        datasets: [
          {
            label: 'Daily vaccinations',
            data: [],
            backgroundColor: 'rgba(255, 0,0, 0.5)', 
            pointBackgroundColor: 'white', 
            borderWidth: 1, 
            pointBorderColor: 'white',
            radius: 3,
          },
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
        text: 'Vaccines World Tracker',
        fontSize: 24,
        fontColor: '#FF0700'
    },
    tooltips: {
        backgroundColor: '#17BF62'
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
            color: '#444',
            ticks: {
            beginAtZero: true
            },
            gridLines: {
            display: false
            }
        }
        ]
    }
    },
    }
  },
  watch:{
    paisSeleccionado: function () {
      this.obtenerPais()
    }
  },
  computed: {
    myStyles() {
      return {
          height: '78vh',
          width: '99vw',
          position: 'relative',

      }
    }
  },
  methods: {
    setearColoresDelChart() {
      var ctx = this.$refs['myChart'].getContext("2d")
      this.gradient = ctx.createLinearGradient(0, 0, 0, 450)
      this.gradient.addColorStop(0, 'rgba(255, 0,0, 0.5)')
      this.gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
      this.gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    },
    obtenerPais() {
      axios({method: "GET", url: "https://api.thecovidvaccines.com/api/v1/countries/"+this.paisSeleccionado, data: this.input})
      .then(result => {
        if (result.status == 200) {

          this.paisInfoObtenida = result

          // CLEANING CHART DATA
          this.barChartData.labels = []
          this.barChartData.datasets[0].data = []
        
          // FILLING CHART DATA
        for (let i=0; i < result.data.data.length; i++) {
          var date = result.data.data[i]['date']
          var daily_vaccinations = result.data.data[i]['daily_vaccinations']
          if (date != null || daily_vaccinations != null) {
            this.barChartData.labels.push(date)
            this.barChartData.datasets[0].data.push(daily_vaccinations)
          }
        }

          // SORTING CHART DATA
          this.barChartData.labels = this.barChartData.labels.sort()
          console.log()
          this.barChartData.datasets[0].data = this.barChartData.datasets[0].data.reverse()

          // RE-RENDERING THE CHART
          this.keyvalue++

          // COUNTRY LOADED SUCCESS
          this.paisListo = true
          
        }
      })
      .catch( error => {
            this.paisSeleccionado = this.paisDefault
            this.$swal.fire({
            icon: 'error',
            title: 'Sorry!',
            text: "We don't have any information about that country 😔",
            })}
      )
    },
  },
    mounted() {
    // GETTING USER COUNTRY
    axios({ method: "GET", "url": "https://httpbin.org/ip" }).then(result => {
        this.ip = result.data.origin;
        axios({ method: "GET", "url": "https://ipapi.co/"+this.ip+"/json/", "data": this.input, "headers": { "content-type": "application/json" } }).then(result => {
        this.ipinfo = result.data;
        this.paisSeleccionado = this.ipinfo.country_name
        this.paisDefault = this.ipinfo.country_name
        }, error => {
            console.error(error);
        });
    }, error => {
        console.error(error);
    });

    this.componentRenderer = true

    // GETTING COUNTRIES LIST
    fetch('https://gist.githubusercontent.com/matifanger/4841780c0758152fbf592ed84e755d68/raw/fc47ebaaf923ce17d7550e9df976b7cc3e396e31/countries.json')
    .then(res => res.json()
    .then(data => {
      console.log(data)
      this.paises = data
    })).catch( error => {
            this.$swal.fire({
            icon: 'error',
            title: 'Error!',
            text: "Something happened! 😔",
            footer: '<a href="https://github.com/matifanger/vaccine-world-tracker/issues">Tell me here!</a>'
            })}
      )

    
    }, 
}
</script>


<style>
/* SCROLLBAR OUT */
::-webkit-scrollbar {
    display: none;
}


h1 {
  font-family: 'Comic Sans', Verdana, sans-serif;
  color: #FF0700;
}


</style>