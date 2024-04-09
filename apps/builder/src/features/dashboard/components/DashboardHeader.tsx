import React, { useEffect, useState } from 'react'
import { HStack, Flex, Button, useDisclosure } from '@chakra-ui/react'
import { HardDriveIcon, SettingsIcon } from '@/components/icons'
import { useUser } from '@/features/account/hooks/useUser'
import { isNotDefined } from '@typebot.io/lib'
import Link from 'next/link'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { useTranslate } from '@tolgee/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { WorkspaceDropdown } from '@/features/workspace/components/WorkspaceDropdown'
import { WorkspaceSettingsModal } from '@/features/workspace/components/WorkspaceSettingsModal'
import { WorkspaceRole } from '@typebot.io/prisma'

type Props = {
  type: 'typebots' | 'analytics'
}

export const DashboardHeader = ({ type }: Props) => {
  const { t } = useTranslate()
  const { user, logOut } = useUser()

  const { workspace, switchWorkspace, createWorkspace } = useWorkspace()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { currentRole } = useWorkspace()
  const [analyticsUser, setAnalyticsUser] = useState(true)
  useEffect(() => {
    if (!currentRole) return
    setAnalyticsUser(currentRole === WorkspaceRole.ANALYTICS)
  }, [currentRole, setAnalyticsUser])

  const handleCreateNewWorkspace = () =>
    createWorkspace(user?.name ?? undefined)

  return (
    <Flex w="full" borderBottomWidth="1px" justify="center">
      <Flex
        justify="space-between"
        alignItems="center"
        h="16"
        maxW="1000px"
        flex="1"
      >
        <Link href={'/' + { type }} data-testid="typebot-logo">
          <EmojiOrImageIcon
            boxSize="30px"
            icon={workspace?.icon}
            defaultIcon={HardDriveIcon}
          />
        </Link>
        {!analyticsUser && type === 'analytics' && (
          <Link href="/typebots">
            <Button
              variant="outline"
              colorScheme="primary"
              fontSize="xl"
              fontWeight="bold"
              data-testid="typebot-name"
            >
              {t('dashboard.header.typebots')}
            </Button>
          </Link>
        )}
        {!analyticsUser && type === 'typebots' && (
          <Link href="/analytics">
            <Button
              variant="outline"
              colorScheme="primary"
              fontSize="xl"
              fontWeight="bold"
              data-testid="typebot-name"
            >
              {t('dashboard.header.analytics')}
            </Button>
          </Link>
        )}
        <HStack>
          {user && workspace && !workspace.isPastDue && (
            <WorkspaceSettingsModal
              isOpen={isOpen}
              onClose={onClose}
              user={user}
              workspace={workspace}
            />
          )}
          {type !== 'analytics' && (
            <Button
              leftIcon={<SettingsIcon />}
              onClick={onOpen}
              isLoading={isNotDefined(workspace)}
            >
              {t('dashboard.header.settingsButton.label')}
            </Button>
          )}
          <WorkspaceDropdown
            currentWorkspace={workspace}
            onLogoutClick={logOut}
            onCreateNewWorkspaceClick={handleCreateNewWorkspace}
            onWorkspaceSelected={switchWorkspace}
          />
        </HStack>
      </Flex>
    </Flex>
  )
}
