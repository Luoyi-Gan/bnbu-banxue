import { TeachingPage, AcademicPage, CampusAIPage } from '../pages/SupportPages'
import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import {
  AlumniPage,
  CampusPage,
  CoffeeChatPage,
  CommunityPage,
  NotificationsPage,
  OrganizationDetailPage,
  OrganizationsPage,
  PartnersPage,
  TeacherDetailPage,
} from '../pages/CampusPages'
import {
  CalendarPage,
  CreateEventPage,
  DiscoverPage,
  EventDetailPage,
  EventTicketPage,
  HomePage,
  HostDetailPage,
  ManageEventPage,
  MyEventsPage,
  NotFoundPage,
} from '../pages/EventPages'
import { CampusGraphPage, ProfilePage } from '../pages/ProfilePages'
import { CheckInPage, SettingsPage } from '../pages/CheckInPages'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export function App() {
  return (
    <AppShell>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/events/:id/ticket" element={<EventTicketPage />} />
        <Route path="/hosts/:id" element={<HostDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/my-events" element={<MyEventsPage />} />
        <Route path="/create" element={<CreateEventPage />} />
        <Route path="/manage/:id" element={<ManageEventPage />} />
        <Route path="/teaching" element={<TeachingPage />} />
        <Route path="/campus/academic" element={<AcademicPage />} />
        <Route path="/campus/ai" element={<CampusAIPage />} />
        <Route path="/campus" element={<CampusPage />} />
        <Route path="/campus/organizations" element={<OrganizationsPage />} />
        <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
        <Route path="/coffee-chat" element={<CoffeeChatPage />} />
        <Route path="/coffee-chat/teachers/:id" element={<TeacherDetailPage />} />
        <Route path="/campus/partners" element={<PartnersPage />} />
        <Route path="/campus/community" element={<CommunityPage />} />
        <Route path="/campus/alumni" element={<AlumniPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/graph" element={<CampusGraphPage />} />
        <Route path="/check-in" element={<CheckInPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  )
}
