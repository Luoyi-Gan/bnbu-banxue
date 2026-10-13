import campusPhoto from '../assets/campus/home-background.jpg'
import campusEvening from '../assets/campus/evening-campus.jpg'
import campusNight from '../assets/campus/night-walkway.jpg'
import type { Post } from '../../shared/v2/model'

const seedPhotos: Record<string, string[]> = {
  'post-study': [campusPhoto],
  'post-english': [campusEvening],
  'post-run': [campusNight],
  'alumni-post-application': [campusPhoto],
  'alumni-post-career': [campusEvening],
}

export const photosForPost = (post: Post) => post.images?.length ? post.images : seedPhotos[post.id] ?? []
export const usesCampusIllustration = (post: Post) => Boolean(post.alumniId && !post.images?.length && seedPhotos[post.id])
