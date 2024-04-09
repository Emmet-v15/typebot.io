import { Seo } from '@/components/Seo'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Stack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { DashboardHeader } from './DashboardHeader'
import { FolderContent } from '@/features/folders/components/FolderContent'
import { TypebotDndProvider } from '@/features/folders/TypebotDndProvider'
import { useTranslate } from '@tolgee/react'
import { WorkspaceRole } from '@typebot.io/prisma'
import { useEffect, useState } from 'react'

export const DashboardPage = () => {
  const { t } = useTranslate()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const { workspace, currentRole } = useWorkspace()
  const [isAnalyticsUser, setIsAnalyticsUser] = useState(true)

  useEffect(() => {
    if (currentRole && currentRole === WorkspaceRole.ANALYTICS) {
      setIsAnalyticsUser(true)
      setIsLoading(false)
      router.push('/analytics')
    } else if (currentRole) {
      setIsAnalyticsUser(false)
      setIsLoading(false)
    }
    if (currentRole) {
      setIsLoading(false)
    }
  }, [currentRole, router])

  return (
    <Stack minH="100vh">
      <Seo title={workspace?.name ?? t('dashboard.title')} />
      <DashboardHeader type="typebots" />
      {!isLoading && !isAnalyticsUser && (
        <TypebotDndProvider>
          <FolderContent folder={null} />
        </TypebotDndProvider>
      )}
    </Stack>
  )
}
