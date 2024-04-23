import prisma from '@typebot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
// import { canReadTypebots } from '@/helpers/databaseRules'
// import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
// import { methodNotAllowed, notAuthenticated } from '@typebot.io/lib/api'
import { methodNotAllowed } from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // const user = await getAuthenticatedUser(req, res)
  // if (!user) return notAuthenticated(res)

  const auth = req.headers.authorization
  if (!auth) return res.status(401).send({ message: 'Unauthorized' })
  if (!auth.startsWith('Bearer '))
    return res.status(401).send({ message: 'Unauthorized' })
  const token = auth.split('Bearer ')[1]
  if (token !== process.env.NEXT_PUBLIC_ANALYTICS_API_KEY)
    return res.status(401).send({ message: 'Unauthorized' })

  const typebotId = req.query.typebotId as string
  const conversationId = req.query.conversationId as string
  const transcriptId = req.query.transcriptId as string
  const limit = req.query.limit as string
  const offset = req.query.offset as string

  if (!typebotId)
    return res.status(400).send({ message: 'Typebot ID is required' })

  const typebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    select: {
      id: true,
    },
  })

  if (!typebot) return res.status(404).send({ message: 'Typebot not found' })

  if (req.method === 'POST') {
    if (transcriptId) {
      const transcript = await prisma.transcript.findFirst({
        where: {
          id: transcriptId,
        },
        select: {
          id: true,
          userMessage: true,
          botMessage: true,
        },
      })

      if (!transcript)
        return res.status(404).send({ message: 'Transcript not found' })

      const updatedTranscript = await prisma.transcript.update({
        where: {
          id: transcriptId,
        },
        data: {
          userMessage: req.body.userMessage || transcript.userMessage,
          botMessage: req.body.botMessage || transcript.botMessage,
        },
      })

      return res.status(200).send({
        message: 'Transcript Updated.',
        transcriptId: updatedTranscript.id,
      })
    } else if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
        },
        select: {
          id: true,
        },
      })

      if (!conversation)
        return res.status(404).send({ message: 'Conversation not found' })

      const transcript = await prisma.transcript.create({
        data: {
          conversationId: conversationId,
          userMessage: req.body.userMessage,
          botMessage: req.body.botMessage,
        },
      })

      return res.status(201).send({
        message: 'Transcript Created.',
        transcriptId: transcript.id,
      })
    } else {
      return res
        .status(400)
        .send({ message: 'Conversation ID or Transcript ID is required' })
    }
  } else if (req.method === 'GET') {
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
        },
        select: {
          id: true,
          threadId: true,
          callback: {
            select: {
              country: true,
              ip: true,
            },
          },
          transcripts: {
            select: {
              userMessage: true,
              botMessage: true,
            },
          },
        },
      })

      if (!conversation)
        return res.status(404).send({ message: 'Conversation not found' })

      return res.status(200).send({
        threadId: conversation.threadId,
        userIp: conversation.callback?.ip,
        userCountry: conversation.callback?.country,
        transcripts: conversation.transcripts.map((t) => ({
          userMessage: t.userMessage,
          botMessage: t.botMessage,
        })),
      })
    } else if (limit && offset) {
      const conversations = await prisma.conversation.findMany({
        where: {
          typebotId,
        },
        select: {
          id: true,
          threadId: true,
          createdAt: true,
          callback: {
            select: {
              country: true,
              ip: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit ? parseInt(limit) : 10,
        skip: offset ? parseInt(offset) : 0,
      })

      const transcripts = await prisma.transcript.findMany({
        where: {
          conversationId: {
            in: conversations.map((c) => c.id),
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      return res.status(200).send(
        conversations
          .map((c) => ({
            createdAt: c.createdAt,
            threadId: c.threadId,
            userIp: c.callback?.ip,
            userCountry: c.callback?.country,
            transcripts: transcripts
              .filter((t) => t.conversationId === c.id)
              .map((t) => ({
                userMessage: t.userMessage,
                botMessage: t.botMessage,
              })),
          }))
          .filter((c) => c.transcripts.length > 0)
      )
    } else if (transcriptId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          transcripts: {
            some: {
              id: transcriptId,
            },
          },
        },
        select: {
          id: true,
          threadId: true,
          callback: {
            select: {
              country: true,
              ip: true,
            },
          },
        },
      })

      if (!conversation)
        return res.status(404).send({ message: 'Conversation not found' })

      const transcripts = await prisma.transcript.findMany({
        where: {
          id: transcriptId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      return res.status(200).send({
        threadId: conversation.threadId,
        userIp: conversation.callback?.ip,
        userCountry: conversation.callback?.country,
        transcripts: transcripts.map((t) => ({
          userMessage: t.userMessage,
          botMessage: t.botMessage,
        })),
      })
    } else {
      return res
        .status(400)
        .send({ message: 'Transcript / Conversation ID is required' })
    }
  }
  return methodNotAllowed(res)
}

export default handler
