import { colors } from '@mui/material'
import React from 'react'
import Chart from 'react-apexcharts'

interface Series {
  name: string
  data: number[]
}

interface GraphData {
  categories: string[]
  series: Series[]
  timePeriod: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  graphTitle?: string
}

const LineGraph: React.FC<{ graphData: GraphData }> = ({ graphData }) => {
  const { categories, series, timePeriod, graphTitle } = graphData

  const options = {
    // set toolbar theme to dark

    chart: {
      id: 'basic-line',
      toolbar: {
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
        show: true,
      },
      fontFamily: 'Roboto, sans-serif' as const,
    },

    stroke: {
      curve: 'smooth' as const,
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: colors.grey[500],
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: colors.grey[500],
        },
      },
    },

    tooltip: {
      theme: 'dark' as const,
    },

    legend: {
      labels: {
        colors: colors.grey[500],
      },
    },

    title: {
      text: graphTitle,
      align: 'left' as const,
      style: {
        color: colors.grey[500],
      },
    },
    subtitle: {
      text: `${timePeriod}` as const,
      align: 'left' as const,
      style: {
        color: colors.blue[500],
      },
    },
  }

  return (
    <Chart
      options={options}
      series={series}
      type="line"
      width="250%" // Adjust the width as needed
      height="250%" // Adjust the height as needed
    />
  )
}

const BarChart: React.FC<{ graphData: GraphData }> = ({ graphData }) => {
  const { categories, series, timePeriod, graphTitle } = graphData

  const options = {
    chart: {
      id: 'basic-bar' as const,
      type: 'bar' as const,
      height: 350,
      stacked: true,
      stackType: '100%' as const,
      fontFamily: 'Roboto, sans-serif' as const,
    },
    toolbar: {
      show: false,
    },
    tooltip: {
      theme: 'dark' as const,
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: colors.grey[500],
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: colors.grey[500],
        },
      },
    },
    legend: {
      labels: {
        colors: colors.grey[500],
      },
    },
    title: {
      text: graphTitle,
      align: 'left' as const,
      style: {
        color: colors.grey[500],
      },
    },
    subtitle: {
      text: `${timePeriod}` as const,
      align: 'left' as const,
      style: {
        color: colors.blue[500],
      },
    },
  }
  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      width="250%" // Shorter height for the bar chart with only 2 values
      height="250%" // Shorter height for the bar chart with only 2 values
    />
  )
}

export { LineGraph, BarChart }
export type { GraphData, Series }
