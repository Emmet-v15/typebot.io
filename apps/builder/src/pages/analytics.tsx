import { GetServerSidePropsContext } from 'next'
import { DashboardPage } from '../features/dashboard/components/AnalyticsPage'

export default function Page() {
  return <DashboardPage />
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const callbackUrl = context.query.callbackUrl?.toString()
  const redirectPath =
    context.query.redirectPath?.toString() ??
    (callbackUrl
      ? new URL(callbackUrl).searchParams.get('redirectPath')
      : undefined)
  return redirectPath
    ? {
        redirect: {
          permanent: false,
          destination: redirectPath,
        },
      }
    : { props: {} }
}
