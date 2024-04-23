import { ChevronLeftIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  Button,
  Flex,
  HStack,
  IconButton,
  Spinner,
  StackProps,
  Text,
  useColorModeValue,
  Box,
  Grid,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

// make interface for:

// {
//   "createdAt": "2024-04-18T18:00:17.272Z",
//   "threadId": "123-123-12-31-3-2",
//   "userIp": "123.456.789.0",
//   "userCountry": "UK",
//   "transcripts": [
//       {
//           "userMessage": "Hello",
//           "botMessage": "Hi"
//       }
//   ]
// }

interface Transcript {
  createdAt: string
  threadId: string
  userIp: string
  userCountry: string
  transcripts: {
    userMessage: string
    botMessage: string
  }[]
}

export default function Page() {
  const router = useRouter()
  const { typebot } = useTypebot()
  const { typebotId } = router.query
  const bgColor = useColorModeValue('#f4f5f8', 'gray.850')
  const headerBgColor = useColorModeValue('white', 'gray.800')
  const [isLoading, setIsLoading] = useState(true)
  const [transcripts, setTranscripts] = useState([] as Transcript[])

  useEffect(() => {
    if (!typebotId) return
    const fetchAndSetData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/api/analytics/${typebotId}/transcript?limit=100&offset=0`,
        {
          headers: {
            contentType: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANALYTICS_API_KEY}`,
          },
        }
      )

      const data: Transcript[] = await res.json()
      setTranscripts(data)
      setIsLoading(false)
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
          Transcripts for {typebot?.name}
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
              pathname: `/analytics/${typebotId}/callbacks`,
              query: {},
            }}
          >
            <Button colorScheme="blue" size="sm" m={2}>
              Callbacks
            </Button>
          </Link>
        </Flex>
      </Flex>

      <Flex flex="1" pos="relative" h="full" bgColor={bgColor}>
        {!isLoading ? (
          <Grid
            gap={4}
            p={4}
            templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          >
            {transcripts.map((transcript) => (
              <Box key={transcript.threadId}>
                <Flex
                  p={2}
                  borderWidth={1}
                  borderRadius="md"
                  my={2}
                  flexDir="column"
                >
                  <Box
                    fontWeight="bold"
                    fontSize="md"
                    borderBottomWidth={1}
                    pb={2}
                    mb={2}
                    padding={2}
                    fontFamily="monospace" // Monospace font for thread ID
                  >
                    Thread ID: {transcript.threadId}
                  </Box>
                  <Flex flexDir="column">
                    {transcript.transcripts.map((message, index) => (
                      <Flex key={index} flexDir="column" mb={2}>
                        <Box mb={2}>
                          <Text as="span" fontWeight="semibold">
                            User:
                          </Text>
                          {message.userMessage}
                        </Box>
                        <Box>
                          <Text
                            as="span"
                            fontWeight="semibold"
                            color="gray.600"
                          >
                            Reply:
                          </Text>
                          {message.botMessage}
                        </Box>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Grid>
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
