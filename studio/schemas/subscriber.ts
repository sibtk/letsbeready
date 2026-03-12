import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'subscriber',
  title: 'Subscriber',
  type: 'document',
  description: 'Email submitted via the newsletter signup form on the website.',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) =>
        Rule.required().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {name: 'email'}).error('Must be a valid email'),
    }),
    defineField({
      name: 'subscribed_at',
      title: 'Subscribed at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Which page/form they signed up from (e.g. "footer", "/donate")',
      readOnly: true,
    }),
    defineField({
      name: 'name',
      title: 'Name (optional)',
      type: 'string',
      description: 'Only set if the form ever asks for a name',
    }),
    defineField({
      name: 'notes',
      title: 'Internal notes',
      type: 'text',
      rows: 2,
      description: 'Editor-only notes (unsubscribe requests, bounces, follow-up status, etc.)',
    }),
  ],
  preview: {
    select: {email: 'email', date: 'subscribed_at', source: 'source'},
    prepare: ({email, date, source}) => {
      const subtitleParts = []
      if (date) {
        const d = new Date(date)
        subtitleParts.push(d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}))
      }
      if (source) subtitleParts.push(source)
      return {
        title: email || '(no email)',
        subtitle: subtitleParts.join(' · '),
      }
    },
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'newestFirst',
      by: [{field: 'subscribed_at', direction: 'desc'}],
    },
    {
      title: 'Oldest first',
      name: 'oldestFirst',
      by: [{field: 'subscribed_at', direction: 'asc'}],
    },
    {
      title: 'Email A→Z',
      name: 'emailAsc',
      by: [{field: 'email', direction: 'asc'}],
    },
  ],
})
