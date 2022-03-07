import { Link, redirect, useLoaderData } from 'remix'
import type { LoaderFunction } from 'remix'
import { Lesson } from '@prisma/client'
import { ChevronLeftIcon } from '@heroicons/react/solid'
import { getFirstCourse } from '~/models/course'
import { getLessonById } from '~/models/lesson'
import { requireUser } from '~/services/auth.server'
import { requireActiveSubscription } from '~/utils/permissions'
import { Handle } from '~/utils/types'

export const handle: Handle = { name: 'Video' }

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const course = await getFirstCourse()

  if (!requireActiveSubscription(user, course)) {
    return redirect(`/dashboard/purchase`)
  }

  const { lessonId } = params
  if (!lessonId) {
    return redirect(`/dashboard/course`)
  }

  const lesson = await getLessonById(lessonId)
  if (!lesson) {
    return redirect(`/dashboard/course`)
  }

  return { lesson }
}

export default function LessonPage() {
  const { lesson } = useLoaderData<{ lesson: Lesson }>()

  return (
    <div className="flex flex-col h-screen w-full">
      <nav
        className="flex items-start px-4 py-3 sm:px-6 lg:px-8 xl:hidden border-solid border-y-2 border-gray-200"
        aria-label="Breadcrumb"
      >
        <Link
          to="/dashboard/course"
          className="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
        >
          <span className="absolute inset-0" aria-hidden="true" />
          <ChevronLeftIcon
            className="-ml-2 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          <span>Kembali</span>
        </Link>
      </nav>
      <article className="h-full">
        <div className="m-8 aspect-w-16 aspect-h-9">
          <iframe
            title={lesson.name}
            src={`https://www.youtube.com/embed/${lesson.videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="mt-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Judul</dt>
              <dd className="mt-1 text-sm text-gray-900">{lesson.name}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Deskripsi</dt>
              <dd className="mt-1 max-w-prose text-sm text-gray-900 space-y-5">
                {lesson.description}
              </dd>
            </div>
          </dl>
        </div>
      </article>
    </div>
  )
}
