import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'staffPage',
  title: 'Staff Page',
  type: 'document',
  description: 'Settings for the full staff page. Toggle "Show staff page" to enable the link from the homepage.',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Show staff page link on homepage',
      type: 'boolean',
      description: 'When OFF, the "Meet our staff" link is hidden from the homepage. The page itself still exists at /staff.html.',
      initialValue: false,
    }),
    defineField({
      name: 'staff_link_text',
      title: 'Homepage Link Text',
      type: 'string',
      description: 'The link shown below the leadership team on the homepage',
      initialValue: 'Meet our full staff →',
    }),
    defineField({
      name: 'staff_eyebrow',
      title: 'Page Eyebrow',
      type: 'string',
      initialValue: 'Our People',
    }),
    defineField({
      name: 'staff_heading',
      title: 'Page Heading (HTML allowed)',
      type: 'text',
      rows: 2,
      initialValue: 'The faces behind every classroom.',
    }),
    defineField({
      name: 'staff_intro',
      title: 'Intro Paragraph',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    prepare: () => ({title: 'Staff Page'}),
  },
})
