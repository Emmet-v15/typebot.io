import { Seo } from '@/components/Seo'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Stack } from '@chakra-ui/react'
import { DashboardHeader } from './DashboardHeader'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'
import { TypebotDndProvider } from '@/features/folders/TypebotDndProvider'
import { FolderContent } from '@/features/folders/components/FolderContent'

export const DashboardPage = () => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [setIsLoading])

  return (
    <Stack minH="100vh">
      <Seo title={workspace?.name ?? t('dashboard.title')} />
      <DashboardHeader type="analytics" />
      {!isLoading && (
        <TypebotDndProvider>
          <FolderContent folder={null} />
        </TypebotDndProvider>
      )}
    </Stack>
  )
}
