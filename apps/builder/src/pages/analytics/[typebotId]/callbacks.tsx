import { ChevronLeftIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  IconButton,
  StackProps,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

interface Callback {
  id: string
  threadId: string
  createdAt: string
  callback: {
    country: string
    ip: string
    phone: string
    email: string
    demoURL: string
  }
}

export default function Page() {
  const router = useRouter()
  const { typebot } = useTypebot()
  const { typebotId } = router.query
  const bgColor = useColorModeValue('#f4f5f8', 'gray.850')
  const headerBgColor = useColorModeValue('white', 'gray.800')
  const [data, setData] = useState([] as Callback[])
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAndSetData = async () => {
      const limit = 100
      const offset = 0

      if (typeof typebotId === 'string') {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_URL}/api/analytics/${typebotId}/callback?limit=${limit}&offset=${offset}`,
          {
            headers: {
              contentType: 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANALYTICS_API_KEY}`,
            },
          }
        )

        const data: Callback[] = await response.json()
        setData(data)
        setLoading(false)
      }
    }

    fetchAndSetData()
  }, [typebotId])

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
          Callbacks for {typebot?.name}
        </Text>
        <Flex alignItems="center" right="1rem" pos="absolute">
          <Link
            href={{
              pathname: `/analytics/${typebotId}/overview`,
              query: {},
            }}
          >
            <Button colorScheme="blue" size="sm" m={2}>
              Analytics
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

      <Flex
        flex="1"
        pos="relative"
        h="full"
        bgColor={bgColor}
        backgroundSize="40px 40px"
        backgroundPosition="-19px -19px"
      >
        <Flex justify="center" align="center" boxSize="full">
          <Grid templateColumns="1fr" gap={6}>
            {data &&
              !isLoading &&
              data.map((dataPoint, index) => {
                return (
                  <Flex
                    direction="row"
                    align="center"
                    justify="space-between"
                    p={5}
                    borderWidth="1px"
                    borderRadius="lg"
                    key={index}
                    w="full"
                  >
                    <Box borderWidth="1px" p={4}>
                      <Text fontSize="xl" fontWeight="bold">
                        {dataPoint.createdAt}
                      </Text>
                    </Box>
                    <Box borderWidth="1px" p={2}>
                      <Link
                        href={
                          '/analytics/' +
                          typebotId +
                          '/transcripts/view?conversationId=' +
                          dataPoint.id
                        }
                      >
                        <Button colorScheme="blue" size="sm" m={2}>
                          {dataPoint.threadId || 'N/A'}
                        </Button>
                      </Link>
                    </Box>
                    <Box borderWidth="1px" p={5}>
                      <Text>
                        Country: {dataPoint.callback?.country || 'N/A'}
                      </Text>
                    </Box>
                    <Box borderWidth="1px" p={5}>
                      <Text>IP: {dataPoint.callback?.ip || 'N/A'}</Text>
                    </Box>
                    <Box borderWidth="1px" p={5}>
                      <Text>Phone: {dataPoint.callback?.phone || 'N/A'}</Text>
                    </Box>
                    <Box borderWidth="1px" p={5}>
                      <Text>Email: {dataPoint.callback?.email || 'N/A'}</Text>
                    </Box>
                  </Flex>
                )
              })}
          </Grid>
        </Flex>
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
