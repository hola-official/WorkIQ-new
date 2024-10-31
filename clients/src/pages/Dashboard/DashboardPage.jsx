import React from 'react'
import SidebarWithHeader from '../../SidebarWithHeader'
import Dashboard from './components/Dashboard'
import Dashboardche from './components/Dashboardche'
import { UserProvider } from '@/context/UserContext'
import FreelancerDashboard from './freelancerDashboard/FreelancerDashboard'

const DashboardPage = () => {
  return (
    <SidebarWithHeader>
      <UserProvider>
        {/* <Dashboardche /> */}
        {/* <Dashboard /> */}
        <FreelancerDashboard />
      </UserProvider>
    </SidebarWithHeader>
  )
}

export default DashboardPage