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
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Page() {
  const { typebot } = useTypebot()
  const router = useRouter()
  const { typebotId } = router.query
  const bgColor = useColorModeValue('#f4f5f8', 'gray.850')
  const headerBgColor = useColorModeValue('white', 'gray.800')
  const [isLoading, setIsLoading] = useState(true)
  // setIsLoading(true)

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (!typebotId) return
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
          Admin Overview for {typebot?.name}
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
        {!isLoading ? (
          <></>
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
