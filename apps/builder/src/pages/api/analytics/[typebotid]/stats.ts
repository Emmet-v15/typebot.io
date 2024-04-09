import prisma from '@typebot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebots } from '@/helpers/databaseRules'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
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

    if (!canReadTypebots(typebotId, user))
      return res.status(403).send({ message: 'Forbidden' })

    const begin = req.query.begin as string
    const end = req.query.end as string
    const metric = req.query.metric as string
    const timePeriod = req.query.timePeriod as string

    if (!begin || !end || !metric || !timePeriod)
      return res.status(400).send({ message: 'Invalid query params' })

    // model TypebotStats {
    //   id                  String   @id @default(cuid())
    //   typebotId           String
    //   completed           Boolean
    //   userMessages        Int
    //   callbackAsked       Boolean
    //   averageResponseTime Float?
    //   chatTime            Float?
    //   createdAt           DateTime @default(now())
    //   Typebot             Typebot? @relation(fields: [typebotId], references: [id])
    // }

    // const allPoints = []
    const _begin = new Date(begin)
    const _end = new Date(end)

    const records = await prisma.typebotStats.findMany({
      where: {
        typebotId: typebot.id,
        createdAt: {
          gte: _begin,
          lte: _end,
        },
      },
      select: {
        completed: metric === 'completed' || metric === 'all',
        userMessages: metric === 'userMessages' || metric === 'all',
        callbackAsked: metric === 'callbackAsked' || metric === 'all',
        averageResponseTime:
          metric === 'averageResponseTime' || metric === 'all',
        chatTime: metric === 'chatTime' || metric === 'all',
        createdAt: true,
      },
    })

    const stats: {
      [key: number]: {
        completed: number
        userMessages: number
        callbackAsked: number
        averageResponseTime: number
        chatTime: number
      }
    } = {}

    records.forEach((record) => {
      let _timePeriod
      if (timePeriod === 'hour') {
        _timePeriod = record.createdAt.getHours()
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

      if (!stats[_timePeriod]) {
        stats[_timePeriod] = {
          completed: 0,
          userMessages: 0,
          callbackAsked: 0,
          averageResponseTime: 0,
          chatTime: 0,
        }
      }
      stats[_timePeriod].completed += record.completed ? 1 : 0
      stats[_timePeriod].userMessages += record.userMessages
      stats[_timePeriod].callbackAsked += record.callbackAsked ? 1 : 0
      stats[_timePeriod].chatTime += record.chatTime || 0
      if (record.averageResponseTime)
        stats[_timePeriod].averageResponseTime = record.averageResponseTime
      else stats[_timePeriod].averageResponseTime = -1
    })

    return res.status(200).send({ dataPoints: stats || [] })
  }
  return methodNotAllowed(res)
}

export default handler
