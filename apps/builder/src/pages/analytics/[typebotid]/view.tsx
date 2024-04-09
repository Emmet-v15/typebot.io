import { GraphData } from '@/components/Charts'
import { ChevronLeftIcon } from '@/components/icons'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  HStack,
  IconButton,
  Spinner,
  StackProps,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

const LineGraph = dynamic(
  () => import('@/components/Charts').then((mod) => mod.LineGraph),
  {
    ssr: false,
  }
)

const BarChart = dynamic(
  () => import('@/components/Charts').then((mod) => mod.BarChart),
  {
    ssr: false,
  }
)

interface RawDataPoints {
  [key: number]: {
    userMessages: number
    averageResponseTime: number
    chatTime: number
  }
}

const fetchData = async (
  typebotid: string,
  begin: string,
  end: string,
  metric: string,
  timePeriod: string
): Promise<RawDataPoints> => {
  try {
    const response = await fetch(
      `/api/analytics/${typebotid}/stats?begin=${begin}&end=${end}&metric=${metric}&timePeriod=${timePeriod}`
    )
    const data: {
      dataPoints: RawDataPoints
    } = await response.json()
    return data.dataPoints
  } catch (error) {
    console.error('Error fetching the analytics data:', error)
    throw error
  }
}

// {
// "dataPoints": {
//   "1": {
//       "completed": 306,
//       "userMessages": 33928,
//       "callbackAsked": 345,
//       "averageResponseTime": 57,
//       "chatTime": 34289
//   },
//   "2": {
//       "completed": 322,
//       "userMessages": 31009,
//       "callbackAsked": 308,
//       "averageResponseTime": 15,
//       "chatTime": 31947
//   },
//   "3": {
//       "completed": 313,
//       "userMessages": 32618,
//       "callbackAsked": 342,
//       "averageResponseTime": 11,
//       "chatTime": 31956
//   },
//   "4": {
//       "completed": 321,
//       "userMessages": 34074,
//       "callbackAsked": 360,
//       "averageResponseTime": 91,
//       "chatTime": 33021
//   },
// }

export default function Page() {
  const router = useRouter()
  const { typebotid } = router.query
  const bgColor = useColorModeValue('#f4f5f8', 'gray.850')
  const headerBgColor = useColorModeValue('white', 'gray.800')

  const [LatencyGraphData, setLatencyGraphData] = useState<GraphData | null>(
    null
  )
  const [LineGraphData, setLineGraphData] = useState<GraphData | null>(null)
  const [BarGraphData, setBarGraphData] = useState<GraphData | null>(null)

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (typeof typebotid === 'string') {
        try {
          let timePeriod = 'hour'
          const data: RawDataPoints = await fetchData(
            typebotid,
            '1-1-2023',
            '1-2-2024',
            'all',
            timePeriod
          )
          if (timePeriod === 'hour') {
            timePeriod = 'Day'
          } else if (timePeriod === 'day') {
            timePeriod = 'Week'
          } else if (timePeriod === 'week') {
            timePeriod = 'Month'
          } else if (timePeriod === 'month') {
            timePeriod = 'Year'
          } else {
            timePeriod = 'Hour'
          }

          const rawBarGraphData: RawDataPoints = {
            ...Object.fromEntries(
              Object.entries(data).filter(([,], index) => index % 2 === 0)
            ),
          }

          const formattedLatencyGraphData: GraphData = {
            categories: Object.keys(data).map((key) => `${key}`),
            series: [
              {
                name: 'Average Response Time',
                data: Object.values(data).map(
                  (point) => point.averageResponseTime
                ),
              },
            ],
            graphTitle: 'Bot Latency',
            timePeriod: timePeriod as 'day' | 'week' | 'month' | 'year',
          }

          const formattedLineGraphData: GraphData = {
            categories: Object.keys(data).map((key) => `${key}`),
            series: [
              {
                name: 'User Messages',
                data: Object.values(data).map((point) => point.userMessages),
              },

              {
                name: 'Chat Time',
                data: Object.values(data).map((point) => point.chatTime),
              },
            ],
            graphTitle: 'User Activity',
            timePeriod: timePeriod as 'day' | 'week' | 'month' | 'year',
          }

          const formattedBarGraphData: GraphData = {
            categories: Object.keys(rawBarGraphData).map((key) => `${key}`),
            series: [
              {
                name: 'Chats Completed',
                data: Object.values(rawBarGraphData).map(
                  (point) => point.completed
                ),
              },
              {
                name: 'Callback Asked',
                data: Object.values(rawBarGraphData).map(
                  (point) => point.callbackAsked
                ),
              },
            ],
            graphTitle: 'Callbacks Asked vs Chats completed per Day',
            timePeriod: timePeriod as 'day' | 'week' | 'month' | 'year',
          }

          setLatencyGraphData(formattedLatencyGraphData)
          setLineGraphData(formattedLineGraphData)
          setBarGraphData(formattedBarGraphData)
        } catch (error) {
          console.error('Error fetching the analytics data:', error)
        }
      }
    }

    fetchAndSetData()
  }, [typebotid])

  return (
    <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
      <Flex
        w="full"
        borderBottomWidth="1px"
        justify="center"
        align="center"
        h={`56px`}
        zIndex={100}
        pos="relative"
        bgColor={headerBgColor}
        flexShrink={0}
      >
        <LeftElements pos="absolute" left="1rem" />
        <Text fontSize="xl" fontWeight="bold" p={5}>
          Bot Analytics
        </Text>
      </Flex>

      <Flex
        flex="1"
        pos="relative"
        h="full"
        bgColor={bgColor}
        backgroundSize="40px 40px"
        backgroundPosition="-19px -19px"
      >
        {LatencyGraphData && LineGraphData && BarGraphData ? (
          <Flex justify="center" align="center" boxSize="full">
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <Box
                p={5}
                boxSize="fit-content"
                borderWidth="1px"
                borderRadius="lg"
                justifySelf="center"
                alignSelf="center"
              >
                <Text fontSize="xl" fontWeight="bold" marginBottom={5}>
                  View Timeperiod
                </Text>
                <ButtonGroup isAttached variant="outline">
                  <Button>Hour</Button>
                  <Button>Day</Button>
                  <Button>Week</Button>
                  <Button>Month</Button>
                  <Button>Year</Button>
                  <Button>All</Button>
                </ButtonGroup>
              </Box>
              <Box
                p={5}
                boxSize="fit-content"
                borderWidth="1px"
                borderRadius="lg"
              >
                <LineGraph graphData={LatencyGraphData} />
              </Box>

              <Box
                p={5}
                boxSize="fit-content"
                borderWidth="1px"
                borderRadius="lg"
              >
                <LineGraph graphData={LineGraphData} />
              </Box>

              <Box
                p={5}
                boxSize="fit-content"
                borderWidth="1px"
                borderRadius="lg"
              >
                <BarChart graphData={BarGraphData} />
              </Box>
            </Grid>
          </Flex>
        ) : (
          <Flex justify="center" align="center" boxSize="full">
            <Spinner color="gray" />
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

const LeftElements = ({ ...props }: StackProps) => {
  return (
    <HStack justify="center" align="center" spacing="6" {...props}>
      <HStack alignItems="center" spacing={3}>
        <IconButton
          as={Link}
          aria-label="Navigate back"
          icon={<ChevronLeftIcon fontSize={25} />}
          href={{
            pathname: '/analytics',
          }}
          size="sm"
        />
      </HStack>
    </HStack>
  )
}
