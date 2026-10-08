import campusServices from '../assets/campus/campus-services.jpg'
import eveningCampus from '../assets/campus/evening-campus.jpg'
import homeBackground from '../assets/campus/home-background.jpg'
import nightWalkway from '../assets/campus/night-walkway.jpg'
import type { Event } from '../types'

const photos: Record<string, string> = {
  'cover-ai': homeBackground,
  'cover-marketing': nightWalkway,
  'cover-alumni': eveningCampus,
  'cover-games': campusServices,
  'cover-basketball': campusServices,
  'cover-startup': eveningCampus,
  'cover-run': campusServices,
  'cover-badminton': campusServices,
  'cover-photo': homeBackground,
  'cover-music': nightWalkway,
  'cover-debate': nightWalkway,
  'cover-green': campusServices,
  'cover-career': eveningCampus,
  'cover-makers': campusServices,
  'cover-language': campusServices,
  'cover-volunteer': campusServices,
  'cover-design': homeBackground,
}

export function recommendationPhoto(event: Pick<Event, 'cover'>): string {
  return photos[event.cover] ?? homeBackground
}
