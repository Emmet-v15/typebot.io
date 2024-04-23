import { ChevronLeftIcon } from '@/components/icons'
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Spinner,
  StackProps,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

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
  const { conversationId, typebotId } = router.query
  const bgColor = useColorModeValue('#f4f5f8', 'gray.850')
  const headerBgColor = useColorModeValue('white', 'gray.800')

  const [isLoading, setIsLoading] = useState(true)
  const [transcripts, setTranscripts] = useState<Transcript[]>([]) // Update initial state value

  console.log(typebotId, conversationId)

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (!typebotId || !conversationId) return
      const response = await fetch(
        `/api/analytics/${typebotId}/transcript?conversationId=${conversationId}`,
        {
          headers: {
            contentType: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANALYTICS_API_KEY}`,
          },
        }
      )

      const data = await response.json()
      console.log(data)
      setTranscripts([data])
      setIsLoading(false)
    }

    fetchAndSetData()
  }, [typebotId, conversationId])

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
          Details of thread: {conversationId}
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
        </Flex>
      </Flex>
      {!isLoading ? (
        <Box key={transcripts[0].threadId}>
          <Flex p={2} borderWidth={1} borderRadius="md" my={2} flexDir="column">
            <Box
              fontWeight="bold"
              fontSize="md"
              borderBottomWidth={1}
              pb={2}
              mb={2}
              padding={2}
              fontFamily="monospace"
            >
              Thread ID: {transcripts[0].threadId}
            </Box>
            <Flex flexDir="column">
              {transcripts[0].transcripts.map((message, index) => (
                <Flex key={index} flexDir="column" mb={2}>
                  <Box mb={2}>
                    <Text as="span" fontWeight="semibold">
                      User:
                    </Text>
                    {message.userMessage}
                  </Box>
                  <Box>
                    <Text as="span" fontWeight="semibold" color="gray.600">
                      Reply:
                    </Text>
                    {message.botMessage}
                  </Box>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Box>
      ) : (
        <Flex justify="center" align="center" boxSize="full">
          <Spinner color="gray" />
        </Flex>
      )}
      <Flex
        flex="1"
        pos="relative"
        h="full"
        bgColor={bgColor}
        backgroundSize="40px 40px"
        backgroundPosition="-19px -19px"
      ></Flex>
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
