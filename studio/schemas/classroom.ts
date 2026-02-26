import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'classroom',
  title: 'Classroom',
  type: 'document',
  fields: [
    defineField({
      name: 'classroomId',
      title: 'ID (number)',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: 'community',
      title: 'Community / Village',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'department',
      title: 'Department',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'teacher',
      title: 'Teacher Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'students',
      title: 'Number of Students',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'lat',
      title: 'Latitude',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lng',
      title: 'Longitude',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year Started',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
    }),
  ],
  preview: {
    select: {community: 'community', department: 'department', teacher: 'teacher'},
    prepare: ({community, department, teacher}) => ({
      title: `${community || 'Untitled'} (${department || '?'})`,
      subtitle: teacher ? `Teacher: ${teacher}` : undefined,
    }),
  },
  orderings: [
    {
      title: 'Department',
      name: 'departmentAsc',
      by: [{field: 'department', direction: 'asc'}, {field: 'community', direction: 'asc'}],
    },
    {
      title: 'Year (newest first)',
      name: 'yearDesc',
      by: [{field: 'year', direction: 'desc'}],
    },
  ],
})
