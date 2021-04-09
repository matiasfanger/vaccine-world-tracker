import Vue from 'vue'
import { Bar, Doughnut, Line, Pie, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins;

const registerComponent = function(name, originalComponent) {
    Vue.component(
        name,
        {
            extends: originalComponent,
            mixins: [reactiveProp],
            props: ['chartData', 'options'],
            mounted() {
                this.renderChart(this.chartData, this.options)
            }
        }
    )
}

registerComponent('BarChart', Bar);
registerComponent('DoughnutChart', Doughnut);
registerComponent('LineChart', Line);
registerComponent('PieChart', Pie);