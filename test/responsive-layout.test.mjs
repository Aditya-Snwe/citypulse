import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const SRC_DIR = path.resolve('src')

function readSrcFile(relPath) {
  return fs.readFileSync(path.join(SRC_DIR, relPath), 'utf8')
}

test('Responsive Layout Audit - Root cause removal in PhoneShell and index.css', () => {
  const phoneShell = readSrcFile('components/PhoneShell.tsx')
  assert.ok(!phoneShell.includes('max-w-[430px]'), 'PhoneShell must not have hardcoded max-w-[430px]')
  assert.ok(!phoneShell.includes('bg-surface-dim'), 'PhoneShell must not surround app with pale blue background frame')
  assert.ok(phoneShell.includes('DesktopNavBar'), 'PhoneShell must render DesktopNavBar')
  assert.ok(phoneShell.includes('w-full'), 'PhoneShell must allow full width on desktop')

  const indexCss = readSrcFile('index.css')
  assert.ok(!indexCss.includes('background: #cbdbf5'), 'index.css body background must not be hardcoded to pale blue mobile device frame background')
  assert.ok(indexCss.includes('var(--color-surface)'), 'index.css body background must use var(--color-surface)')
})

test('Responsive Navigation - DesktopNavBar and BottomTabBar visibility', () => {
  const desktopNav = readSrcFile('components/DesktopNavBar.tsx')
  assert.ok(desktopNav.includes('hidden md:block'), 'DesktopNavBar must be hidden on mobile and visible on md+ viewports')
  assert.ok(desktopNav.includes('/home') && desktopNav.includes('/map') && desktopNav.includes('/reports'), 'DesktopNavBar must link to primary routes')
  assert.ok(desktopNav.includes('Report Issue'), 'DesktopNavBar must have prominent Report Issue CTA')

  const bottomTabBar = readSrcFile('components/BottomTabBar.tsx')
  assert.ok(bottomTabBar.includes('md:hidden'), 'BottomTabBar must be hidden on md+ tablet/desktop viewports')
})

test('Page-Level Responsive Layouts - Grid systems and desktop transitions', () => {
  // Landing
  const landing = readSrcFile('pages/Landing.tsx')
  assert.ok(landing.includes('lg:grid-cols-12'), 'Landing hero must use 12-column responsive grid on desktop')
  assert.ok(!landing.includes('max-w-[430px]'), 'Landing must not have max-w-[430px] constraint')
  assert.ok(landing.includes('max-w-7xl'), 'Landing must have max-w-7xl desktop container')

  // Home
  const home = readSrcFile('pages/Home.tsx')
  assert.ok(home.includes('lg:grid-cols-12'), 'Home must use 12-column responsive dashboard grid on desktop')
  assert.ok(home.includes('md:grid-cols-2'), 'Active alerts must use 2-column grid on md+ screens')
  assert.ok(home.includes('max-w-7xl'), 'Home must have max-w-7xl container')

  // Community Map
  const mapPage = readSrcFile('pages/CommunityMap.tsx')
  assert.ok(mapPage.includes('hidden lg:flex'), 'CommunityMap must have desktop sidebar panel')
  assert.ok(mapPage.includes('lg:hidden'), 'CommunityMap must keep mobile overlays for phone viewports')

  // Report Issue
  const reportIssue = readSrcFile('pages/ReportIssue.tsx')
  assert.ok(reportIssue.includes('sm:grid-cols-4'), 'ReportIssue step 0 must use 4 columns on larger screens')
  assert.ok(reportIssue.includes('md:grid-cols-12'), 'ReportIssue step 1 location must use responsive layout')
  assert.ok(reportIssue.includes('max-w-3xl') || reportIssue.includes('max-w-4xl'), 'ReportIssue form must have readable max-width container')

  // My Reports
  const myReports = readSrcFile('pages/MyReports.tsx')
  assert.ok(myReports.includes('lg:grid-cols-3'), 'MyReports must support 3-column feed on desktop')
  assert.ok(myReports.includes('md:grid-cols-2'), 'MyReports must support 2-column feed on tablet')

  // Report Details
  const reportDetails = readSrcFile('pages/ReportDetails.tsx')
  assert.ok(reportDetails.includes('lg:grid-cols-12'), 'ReportDetails must use split-column layout on desktop')
  assert.ok(reportDetails.includes('VerificationCard'), 'ReportDetails must display VerificationCard in side column')

  // Profile
  const profile = readSrcFile('pages/Profile.tsx')
  assert.ok(profile.includes('lg:grid-cols-12'), 'Profile must use multi-column layout on desktop')

  // Notifications
  const notifications = readSrcFile('pages/Notifications.tsx')
  assert.ok(notifications.includes('max-w-4xl'), 'Notifications must use centered max-w-4xl container on desktop')
})
