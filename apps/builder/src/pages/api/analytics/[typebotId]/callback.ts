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

  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string
    const conversationId = req.query.conversationId as string

    const begin = req.query.begin as string
    const end = req.query.end as string
    const timePeriod = req.query.timePeriod as string

    const limit = req.query.limit as string
    const offset = req.query.offset as string

    if (!typebotId)
      return res.status(400).send({ message: 'Typebot ID is required' })

    if (!conversationId) {
      const typebot = await prisma.typebot.findFirst({
        where: {
          id: typebotId,
        },
        select: {
          id: true,
        },
      })

      if (!typebot)
        return res.status(404).send({ message: 'Typebot not found' })

      if (begin && end) {
        const _begin = new Date(begin)
        const _end = new Date(end)

        const conversations = await prisma.conversation.findMany({
          where: {
            typebotId,
            createdAt: {
              gte: _begin,
              lte: _end,
            },
          },
          select: {
            id: true,
            createdAt: true,
            threadId: true,
            callback: {
              select: {
                demoURL: true,
                email: true,
                phone: true,
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

        const callbacks: {
          [key: number]: {
            count: number
          }
        } = {}

        conversations.forEach(async (record) => {
          let _timePeriod
          if (timePeriod === 'hour') {
            _timePeriod = record.createdAt.getHours() + 1
          } else if (timePeriod === 'day') {
            _timePeriod = record.createdAt.getDate()
          } else if (timePeriod === 'week') {
            _timePeriod = record.createdAt.getDay() + 1
          } else if (timePeriod === 'month') {
            _timePeriod = record.createdAt.getMonth() + 1
          } else if (timePeriod === 'year') {
            _timePeriod = record.createdAt.getFullYear()
          } else {
            _timePeriod = record.createdAt.getHours()
          }

          if (!callbacks[_timePeriod]) {
            callbacks[_timePeriod] = {
              count: 0,
            }
          }

          callbacks[_timePeriod].count +=
            (record.callback?.email ? 1 : 0) || (record.callback?.phone ? 1 : 0)
        })

        return res.status(200).send(callbacks)
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
                phone: true,
                email: true,
                demoURL: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit ? parseInt(limit) : 10,
          skip: offset ? parseInt(offset) : 0,
        })

        return res.status(200).send(conversations)
      }
    } else {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
        },
        select: {
          threadId: true,
          createdAt: true,
          callback: {
            select: {
              demoURL: true,
              email: true,
              phone: true,
              country: true,
              ip: true,
            },
          },
        },
      })

      if (!conversation)
        return res.status(404).send({ message: 'Conversation not found' })

      return res.status(200).send(conversation)
    }
  }
  return methodNotAllowed(res)
}

export default handler
