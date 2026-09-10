import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PhoneShell } from './components/PhoneShell'
import { ReportsProvider } from './context/ReportsContext'
import { CommunityMap } from './pages/CommunityMap'
import { Home } from './pages/Home'
import { Landing } from './pages/Landing'
import { MyReports } from './pages/MyReports'
import { Notifications } from './pages/Notifications'
import { Profile } from './pages/Profile'
import { ReportDetails } from './pages/ReportDetails'
import { ReportIssue } from './pages/ReportIssue'

export default function App() {
  return (
    <ReportsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PhoneShell />}>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/map" element={<CommunityMap />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/reports" element={<MyReports />} />
            <Route path="/reports/:id" element={<ReportDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ReportsProvider>
  )
}
