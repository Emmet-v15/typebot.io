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
  const typebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    select: {
      id: true,
    },
  })

  if (!typebot) return res.status(404).send({ message: 'Typebot not found' })
  const conversationId = req.query.conversationId as string
  const begin = req.query.begin as string
  const end = req.query.end as string
  const limit = req.query.limit as string
  const offset = req.query.offset as string

  if (req.method === 'GET') {
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
        },
        select: {
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
      })
      if (conversation) {
        return res.status(200).send({
          threadId: conversation.threadId,
          demoURL: conversation.callback?.demoURL,
          email: conversation.callback?.email,
          phone: conversation.callback?.phone,
          country: conversation.callback?.country,
          ip: conversation.callback?.ip,
        })
      }
    } else if (begin && end) {
      const begin = req.query.begin as string
      const end = req.query.end as string
      const timePeriod = req.query.timePeriod as string

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
          transcripts: {
            select: {
              id: true,
              userMessage: true,
              botMessage: true,
            },
          },
        },
      })

      const data: {
        [key: number]: {
          callbackCount: number
          initialisations: number
          aiInitialisations: number
        }
      } = {}

      conversations.forEach(async (record) => {
        let _timePeriod
        if (timePeriod === 'hourly') {
          _timePeriod = record.createdAt.getHours() + 1
        } else if (timePeriod === 'daily') {
          _timePeriod = record.createdAt.getDate()
        } else if (timePeriod === 'weekly') {
          _timePeriod = record.createdAt.getDay() + 1
        } else if (timePeriod === 'monthly') {
          _timePeriod = record.createdAt.getMonth() + 1
        } else if (timePeriod === 'yearly') {
          _timePeriod = record.createdAt.getFullYear()
        } else {
          _timePeriod = record.createdAt.getHours()
        }

        if (!data[_timePeriod]) {
          data[_timePeriod] = {
            callbackCount: 0,
            initialisations: 0,
            aiInitialisations: 0,
          }
        }

        data[_timePeriod].callbackCount +=
          (record.callback?.email ? 1 : 0) || (record.callback?.phone ? 1 : 0)
        data[_timePeriod].initialisations += 1
        if (record.transcripts.length > 0)
          data[_timePeriod].aiInitialisations += 1
      })

      return res.status(200).send(data)
    } else if (limit && offset) {
      const conversations = await prisma.conversation.findMany({
        where: {
          typebotId,
        },
        select: {
          id: true,
          threadId: true,
        },
        take: limit ? parseInt(limit) : 10,
        skip: offset ? parseInt(offset) : 0,
      })

      return res.status(200).send(conversations)
    } else return res.status(400).send({ message: 'Invalid Request' })
  } else if (req.method === 'POST') {
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
        },
      })

      if (conversation) {
        const threadId = req.body.threadId
        const demoURL = req.body.demoURL
        const email = req.body.email
        const phone = req.body.phone
        const country = req.body.country
        const ip = req.body.ip

        const data = {
          ...(threadId && { threadId }),
        }

        await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data,
        })

        if (demoURL || email || phone || country || ip) {
          await prisma.callback.upsert({
            where: {
              conversationId: conversationId,
            },
            update: {
              demoURL,
              email,
              phone,
              country,
              ip,
            },
            create: {
              demoURL,
              email,
              phone,
              country,
              ip,
              conversationId: conversationId,
            },
          })
        }

        return res.status(200).send({ message: 'Conversation Updated.' })
      } else return res.status(404).send({ message: 'Conversation not found.' })
    } else {
      const conversation = await prisma.conversation.create({
        data: {
          typebotId,
        },
      })

      return res.status(201).send({
        message: 'Conversation Created.',
        conversationId: conversation.id,
      })
    }
  }
  return methodNotAllowed(res)
}

export default handler
