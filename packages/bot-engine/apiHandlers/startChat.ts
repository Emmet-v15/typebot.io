import { filterPotentiallySensitiveLogs } from '../logs/filterPotentiallySensitiveLogs'
import { restartSession } from '../queries/restartSession'
import { saveStateToDatabase } from '../saveStateToDatabase'
import { startSession } from '../startSession'

type Props = {
  origin: string | undefined
  message?: string
  isOnlyRegistering: boolean
  publicId: string
  isStreamEnabled: boolean
  prefilledVariables?: Record<string, unknown>
  resultId?: string
}

export const startChat = async ({
  origin,
  message,
  isOnlyRegistering,
  publicId,
  isStreamEnabled,
  prefilledVariables,
  resultId: startResultId,
}: Props) => {
  const {
    typebot,
    messages,
    input,
    resultId,
    dynamicTheme,
    logs,
    clientSideActions,
    newSessionState,
    visitedEdges,
  } = await startSession({
    version: 2,
    startParams: {
      type: 'live',
      isOnlyRegistering,
      isStreamEnabled,
      publicId,
      prefilledVariables,
      resultId: startResultId,
    },
    message,
  })

  let corsOrigin

  if (
    newSessionState.allowedOrigins &&
    newSessionState.allowedOrigins.length > 0
  ) {
    if (origin && newSessionState.allowedOrigins.includes(origin))
      corsOrigin = origin
    else corsOrigin = newSessionState.allowedOrigins[0]
  }

  const session = isOnlyRegistering
    ? await restartSession({
        state: newSessionState,
      })
    : await saveStateToDatabase({
        session: {
          state: newSessionState,
        },
        input,
        logs,
        clientSideActions,
        visitedEdges,
        hasCustomEmbedBubble: messages.some(
          (message) => message.type === 'custom-embed'
        ),
      })

  return {
    sessionId: session.id,
    typebot: {
      id: typebot.id,
      theme: typebot.theme,
      settings: typebot.settings,
    },
    messages,
    input,
    resultId,
    dynamicTheme,
    logs: logs?.filter(filterPotentiallySensitiveLogs),
    clientSideActions,
    corsOrigin,
    progress: newSessionState.progressMetadata ? 0 : undefined,
  }
}
