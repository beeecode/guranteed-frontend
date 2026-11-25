/**
 * The school's own photos (public/images/school), used across the public site instead of
 * stock images. Captions describe only what the photo shows. Add new photos here (and the
 * file under public/images/school); every page picks them up from this list.
 */
export interface SchoolPhoto {
  src: string
  alt: string
  title: string
  category: "Students" | "Our School"
  orientation: "landscape" | "portrait"
}

export const SCHOOL_PHOTOS = {
  frontOfSchool: { src: "/images/school/students-front-of-school.jpg", alt: "Guaranteed Future Model Schools students gathered in front of the school building", title: "Our school family", category: "Our School", orientation: "landscape" },
  frontOfSchool2: { src: "/images/school/students-front-of-school-2.jpg", alt: "Students in uniform in front of the school's welcome sign", title: "Welcome to GFMS", category: "Our School", orientation: "landscape" },
  seniorStudents: { src: "/images/school/senior-students.jpg", alt: "Senior students in school uniform in the courtyard", title: "Senior students", category: "Students", orientation: "landscape" },
  seniorStudents2: { src: "/images/school/senior-students-2.jpg", alt: "A group of senior students in uniform", title: "Proud in uniform", category: "Students", orientation: "landscape" },
  sweaters: { src: "/images/school/students-in-sweaters.jpg", alt: "Students wearing the school sweater", title: "Ready to learn", category: "Students", orientation: "landscape" },
  sweaters2: { src: "/images/school/students-in-sweaters-2.jpg", alt: "Students in school sweaters in the courtyard", title: "Friends at GFMS", category: "Students", orientation: "landscape" },
  uniform: { src: "/images/school/students-in-uniform.jpg", alt: "Students standing in school uniform", title: "Our students", category: "Students", orientation: "portrait" },
} satisfies Record<string, SchoolPhoto>

export const ALL_SCHOOL_PHOTOS: SchoolPhoto[] = Object.values(SCHOOL_PHOTOS)
