import { GraphData } from '@/components/Charts'
import { ChevronLeftIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  GridItem,
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

// const BarChart = dynamic(
//   () => import('@/components/Charts').then((mod) => mod.BarChart),
//   {
//     ssr: false,
//   }
// )

export default function Page() {
  const { typebot } = useTypebot()
  const router = useRouter()
  const { typebotId } = router.query
  const headerBgColor = useColorModeValue('white', 'gray.800')

  const [LatencyGraphData, setLatencyGraphData] = useState<GraphData | null>(
    null
  )
  const [LineGraphData, setLineGraphData] = useState<GraphData | null>(null)

  const [timePeriod, setTimePeriod] = useState('daily')

  useEffect(() => {
    const fetchAndSetData = async () => {
      const end = new Date()
      const begin = new Date(end)
      if (timePeriod === 'hourly') {
        begin.setHours(end.getHours() - 1)
      } else if (timePeriod === 'daily') {
        begin.setDate(end.getDate() - 1)
      } else if (timePeriod === 'weekly') {
        begin.setDate(end.getDate() - 7)
      } else if (timePeriod === 'monthly') {
        begin.setMonth(end.getMonth() - 1)
      } else {
        begin.setFullYear(end.getFullYear() - 1)
      }

      if (typeof typebotId === 'string') {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_URL}//api/analytics/${typebotId}/conversation?begin=${begin}&end=${end}&timePeriod=${timePeriod}`,
          {
            headers: {
              contentType: 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANALYTICS_API_KEY}`,
            },
          }
        )

        const data: {
          [key: number]: {
            callbackCount: number
            initialisations: number
            aiInitialisations: number
          }
        } = await res.json()

        if (!data) return
        let _timePeriod
        if (timePeriod === 'hour') {
          _timePeriod = 'Day'
        } else if (timePeriod === 'day') {
          _timePeriod = 'Week'
        } else if (timePeriod === 'week') {
          _timePeriod = 'Month'
        } else if (timePeriod === 'month') {
          _timePeriod = 'Year'
        } else {
          _timePeriod = 'Today'
        }

        const AIAGraphData: GraphData = {
          categories: Object.keys(data).map((key) => `${key}`),
          series: [
            {
              name: 'AIA Initialisations',
              data: Object.values(data).map((point) => point.aiInitialisations),
            },
          ],
          graphTitle: 'AIA Statistics',
          timePeriod: _timePeriod as
            | 'hourly'
            | 'daily'
            | 'weekly'
            | 'monthly'
            | 'yearly',
        }

        const formattedLineGraphData: GraphData = {
          categories: Object.keys(data).map((key) => `${key}`),
          series: [
            {
              name: 'Starts',
              data: Object.values(data).map((point) => point.initialisations),
            },

            {
              name: 'Callbacks',
              data: Object.values(data).map((point) => point.callbackCount),
            },
          ],
          graphTitle: 'User Activity',
          timePeriod: _timePeriod as
            | 'hourly'
            | 'daily'
            | 'weekly'
            | 'monthly'
            | 'yearly',
        }

        setLatencyGraphData(AIAGraphData)
        setLineGraphData(formattedLineGraphData)
      }
    }

    fetchAndSetData()
  }, [typebotId, timePeriod])

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
          Analytics Overview for {typebot?.name}
        </Text>
        <Flex alignItems="center" right="1rem" pos="absolute">
          <Link
            href={{
              pathname: `/analytics/${typebotId}/callbacks`,
              query: {},
            }}
          >
            <Button colorScheme="blue" size="sm" m={2}>
              Callbacks
            </Button>
          </Link>
          <Link
            href={{
              pathname: `/analytics/${typebotId}/transcripts`,
              query: {},
            }}
          >
            <Button colorScheme="blue" size="sm" m={2}>
              Transcripts
            </Button>
          </Link>
        </Flex>
      </Flex>

      <Flex direction="column" align="center" justify="center" h="100vh">
        {/* Element at the top middle */}
        <GridItem colSpan={3}>
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
              <Button onClick={() => setTimePeriod('hourly')}>Hourly</Button>
              <Button onClick={() => setTimePeriod('daily')}>Daily</Button>
              <Button onClick={() => setTimePeriod('weekly')}>Weekly</Button>
              <Button onClick={() => setTimePeriod('monthly')}>Monthly</Button>
              <Button onClick={() => setTimePeriod('yearly')}>Yearly</Button>
            </ButtonGroup>
          </Box>
        </GridItem>

        {/* Row of two elements below the top element */}
        {LatencyGraphData && LineGraphData ? (
          <Flex justify="center" w="full">
            <Box
              p={10}
              m={10}
              boxSize="fit-content"
              borderWidth="1px"
              borderRadius="lg"
            >
              <LineGraph graphData={LatencyGraphData} />
            </Box>

            <Box
              p={10}
              marginTop={10}
              boxSize="fit-content"
              borderWidth="1px"
              borderRadius="lg"
            >
              <LineGraph graphData={LineGraphData} />
            </Box>
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
